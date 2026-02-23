import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2024-06-20",
});

export type SubscriptionTier = "free" | "starter" | "pro" | "agency";

export const PLANS: Record<SubscriptionTier, {
  name: string;
  price: number;
  priceId: string | null;
  sessions: number;
  clients: number;
  features: string[];
}> = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    sessions: 2,
    clients: 2,
    features: ["2 sessions/month", "AI summaries", "Basic follow-ups"],
  },
  starter: {
    name: "Starter",
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    sessions: 15,
    clients: 15,
    features: ["15 sessions/month", "AI summaries", "Auto follow-up emails", "Session prep briefs", "Up to 15 clients"],
  },
  pro: {
    name: "Pro",
    price: 97,
    priceId: process.env.STRIPE_PRICE_PRO!,
    sessions: 40,
    clients: 999,
    features: ["40 sessions/month", "Client progress dashboard", "Branded client portal", "Transformation reports", "Accountability nudges", "Unlimited clients"],
  },
  agency: {
    name: "Agency",
    price: 197,
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    sessions: 999,
    clients: 999,
    features: ["Unlimited sessions", "Multi-coach (up to 5)", "Team dashboard", "White-label option", "Revenue analytics", "Dedicated success manager"],
  },
};
