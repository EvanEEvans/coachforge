"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Target, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { COACHING_TYPES } from "@/lib/utils/constants";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase.from("clients").insert({
      coach_id: user.id,
      full_name: name,
      email,
      phone: phone || null,
      coaching_type: type || null,
      goals: goals ? goals.split("\n").filter(g => g.trim()) : [],
      intake_notes: notes || null,
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/clients/${data.id}`);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/clients" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to clients
      </Link>

      <h2 className="font-display text-2xl font-bold mb-1">Add New Client</h2>
      <p className="text-gray-500 text-sm mb-8">Enter your client's details to get started.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-50 p-6 space-y-5">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400">Basic Info</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Sarah Mitchell"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="sarah@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Coaching Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition bg-white"
            >
              <option value="">Select type...</option>
              {COACHING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-6 space-y-5">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400">Goals & Notes</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Goals (one per line)</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
              placeholder="Get promoted to team lead&#10;Build confidence in leadership&#10;Improve delegation skills"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Intake Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="Background context, initial assessment, anything relevant..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition resize-none"
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:shadow-teal transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : "Add Client"}
        </button>
      </form>
    </div>
  );
}
