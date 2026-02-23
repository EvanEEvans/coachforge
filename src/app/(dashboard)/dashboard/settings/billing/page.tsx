"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Check, ArrowRight, Loader2 } from "lucide-react";

const PLANS = [
  { tier: "free", name: "Free", price: 0, sessions: "2/mo", clients: "1" },
  { tier: "starter", name: "Starter", price: 49, sessions: "15/mo", clients: "15" },
  { tier: "pro", name: "Pro", price: 97, sessions: "40/mo", clients: "Unlimited" },
  { tier: "agency", name: "Agency", price: 197, sessions: "Unlimited", clients: "Unlimited" },
];

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [upgrading, setUpgrading] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    }
    load();
  }, []);

  const handleUpgrade = async (tier: string, priceId: string) => {
    setUpgrading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    }
    setUpgrading("");
  };

  const handleManage = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (!profile) return <div className="animate-pulse"><div className="h-48 bg-white rounded-2xl" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="font-display text-2xl font-bold">Billing</h2>

      <div className="bg-white rounded-2xl border border-stone-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Current Plan</p>
            <p className="font-display text-2xl font-bold capitalize mt-1">{profile.subscription_tier}</p>
          </div>
          {profile.subscription_tier !== "free" && (
            <button onClick={handleManage} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:border-teal hover:text-teal transition">
              Manage Subscription
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {PLANS.map(plan => {
            const isCurrent = plan.tier === profile.subscription_tier;
            return (
              <div key={plan.tier} className={`rounded-xl p-4 border transition ${isCurrent ? "border-teal bg-teal-soft" : "border-stone-100"}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">{plan.name}</p>
                <p className="font-display text-xl font-bold">${plan.price}<span className="text-xs font-normal text-stone-400">/mo</span></p>
                <p className="text-xs text-stone-400 mt-2">{plan.sessions} sessions</p>
                <p className="text-xs text-stone-400">{plan.clients} clients</p>
                <div className="mt-3">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs text-teal font-semibold"><Check className="w-3 h-3" /> Current</span>
                  ) : plan.tier !== "free" ? (
                    <button onClick={() => handleUpgrade(plan.tier, `price_${plan.tier}`)} disabled={!!upgrading}
                      className="w-full py-2 rounded-lg bg-teal text-white text-xs font-semibold hover:shadow-teal transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {upgrading === plan.tier ? <Loader2 className="w-3 h-3 animate-spin" /> : "Upgrade"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-50 p-6">
        <h3 className="font-display font-bold mb-4">Usage This Month</h3>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Sessions Used</p>
            <p className="font-display text-xl font-bold mt-1">{profile.session_count_this_month}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
