import { stripe } from "@/lib/stripe/plans";
import { createServiceSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  const supabase = createServiceSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata.userId;
      const tier = session.metadata.tier;

      await supabase.from("profiles").update({
        subscription_tier: tier,
        subscription_status: "active",
        stripe_customer_id: session.customer,
      }).eq("id", userId);

      // Create subscription record
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await supabase.from("subscriptions").upsert({
        profile_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        tier,
        status: "active",
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        await supabase.from("subscriptions").update({
          status: "active",
        }).eq("stripe_subscription_id", invoice.subscription);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        await supabase.from("subscriptions").update({
          status: "past_due",
        }).eq("stripe_subscription_id", invoice.subscription);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      // Downgrade to free
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("profile_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (sub) {
        await supabase.from("profiles").update({
          subscription_tier: "free",
          subscription_status: "cancelled",
        }).eq("id", sub.profile_id);

        await supabase.from("subscriptions").update({
          status: "cancelled",
        }).eq("stripe_subscription_id", subscription.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
