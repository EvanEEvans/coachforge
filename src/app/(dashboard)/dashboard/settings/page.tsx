"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save } from "lucide-react";
import { COACHING_TYPES } from "@/lib/utils/constants";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;
    await supabase.from("profiles").update({
      full_name: profile.full_name,
      coaching_type: profile.coaching_type,
      timezone: profile.timezone,
      brand_color: profile.brand_color,
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <div className="animate-pulse space-y-4"><div className="h-64 bg-white rounded-2xl" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-bold">Settings</h2>

      <div className="bg-white rounded-2xl border border-stone-50 p-6 space-y-5">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-stone-400">Profile</h3>
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <input type="text" value={profile.full_name || ""} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" value={profile.email || ""} disabled className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm bg-stone-50 text-stone-400" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Coaching Type</label>
          <select value={profile.coaching_type || ""} onChange={e => setProfile({ ...profile, coaching_type: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-teal/20 focus:border-teal">
            <option value="">Select...</option>
            {COACHING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Brand Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={profile.brand_color || "#0D7377"} onChange={e => setProfile({ ...profile, brand_color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer" />
            <span className="text-sm text-stone-500">{profile.brand_color || "#0D7377"}</span>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:shadow-teal transition disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
