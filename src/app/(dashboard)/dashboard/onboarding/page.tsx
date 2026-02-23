"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Camera } from "lucide-react";
import { COACHING_TYPES } from "@/lib/utils/constants";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({
      full_name: name || undefined,
      coaching_type: type || null,
      timezone,
      onboarding_completed: true,
    }).eq("id", user.id);

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-teal flex items-center justify-center mx-auto mb-5 shadow-teal">
            <span className="font-display font-black text-white text-2xl">C</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome to CoachForge</h1>
          <p className="text-stone-500">Let's set up your coaching practice in 30 seconds.</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-large p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Your name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Sarah Mitchell"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">What kind of coaching do you do?</label>
            <div className="grid grid-cols-2 gap-2">
              {COACHING_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition border ${type === t.value ? "border-teal bg-teal-soft text-teal" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal bg-white">
              {Intl.supportedValuesOf?.("timeZone")?.slice(0, 50).map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              )) || <option value={timezone}>{timezone}</option>}
            </select>
          </div>

          <button onClick={handleComplete} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal text-white font-semibold flex items-center justify-center gap-2 hover:shadow-teal transition disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Launch My Dashboard</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">You can always change these later in Settings.</p>
      </div>
    </div>
  );
}
