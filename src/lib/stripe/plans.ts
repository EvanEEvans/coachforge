import Stripe from "stripe";
import { SubscriptionTier } from "@/lib/supabase/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS: Record<SubscriptionTier, {
  name: string;
  price: number;
  priceId: string | null;
  sessions_per_month: number;
  clients: number;
  coaches: number;
  features: string[];
}> = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    sessions_per_month: 2,
    clients: 1,
    coaches: 1,
    features: ["summary", "action_items"],
  },
  starter: {
    name: "Starter",
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER || "",
    sessions_per_month: 15,
    clients: 15,
    coaches: 1,
    features: ["summary", "action_items", "follow_up_email", "prep_brief"],
  },
  pro: {
    name: "Pro",
    price: 97,
    priceId: process.env.STRIPE_PRICE_PRO || "",
    sessions_per_month: 40,
    clients: 999,
    coaches: 1,
    features: [
      "summary", "action_items", "follow_up_email", "prep_brief",
      "progress_dashboard", "client_portal", "transformation_report",
      "nudges", "coaching_insights", "custom_branding",
    ],
  },
  agency: {
    name: "Agency",
    price: 197,
    priceId: process.env.STRIPE_PRICE_AGENCY || "",
    sessions_per_month: 99999,
    clients: 99999,
    coaches: 5,
    features: [
      "summary", "action_items", "follow_up_email", "prep_brief",
      "progress_dashboard", "client_portal", "transformation_report",
      "nudges", "coaching_insights", "custom_branding",
      "multi_coach", "team_dashboard", "content_engine",
      "testimonial_generator", "group_coaching", "revenue_analytics", "white_label",
    ],
  },
};

export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  return PLANS[tier].features.includes(feature);
}

export function isWithinSessionLimit(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < PLANS[tier].sessions_per_month;
}

export function isWithinClientLimit(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount < PLANS[tier].clients;
}
