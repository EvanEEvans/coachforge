"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video, Plus, CheckCircle, Clock, Target, Zap } from "lucide-react";
import { formatDate, formatRelative, getInitials } from "@/lib/utils/constants";
import type { Client, Session, ActionItem } from "@/lib/supabase/types";

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [cRes, sRes, aRes] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("sessions").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(20),
        supabase.from("action_items").select("*").eq("client_id", id).eq("completed", false).order("created_at", { ascending: false }),
      ]);
      setClient(cRes.data);
      setSessions(sRes.data || []);
      setActions(aRes.data || []);
    }
    load();
  }, [id]);

  if (!client) return <div className="animate-pulse"><div className="h-64 bg-white rounded-2xl" /></div>;

  const completed = sessions.filter(s => s.status === "completed");

  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-teal transition">
        <ArrowLeft className="w-4 h-4" /> Back to clients
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-stone-50 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-soft text-teal flex items-center justify-center text-xl font-bold">
            {getInitials(client.full_name)}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{client.full_name}</h2>
            <p className="text-sm text-stone-400">{client.email} {client.coaching_type && `· ${client.coaching_type}`}</p>
          </div>
          <Link href={`/dashboard/sessions?new=true`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
            <Plus className="w-4 h-4" /> New Session
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-50">
          <div><span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Sessions</span><p className="font-display text-xl font-bold mt-1">{client.session_count}</p></div>
          <div><span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Streak</span><p className="font-display text-xl font-bold mt-1 text-green-600">{client.current_streak} 🔥</p></div>
          <div><span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Status</span><p className="text-sm font-semibold mt-1.5 capitalize text-green-600">{client.status}</p></div>
          <div><span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Last Session</span><p className="text-sm mt-1.5 text-stone-500">{client.last_session_at ? formatRelative(client.last_session_at) : "Never"}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Goals */}
        <div className="bg-white rounded-2xl border border-stone-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-teal" />
            <h3 className="font-display font-bold">Goals</h3>
          </div>
          {client.goals?.length > 0 ? (
            <div className="space-y-2">{client.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-stone-600"><Target className="w-3.5 h-3.5 text-teal mt-0.5 shrink-0" /> {g}</div>
            ))}</div>
          ) : <p className="text-sm text-stone-400">No goals set yet</p>}
        </div>

        {/* Open Actions */}
        <div className="bg-white rounded-2xl border border-stone-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-teal" />
            <h3 className="font-display font-bold">Open Actions</h3>
            <span className="text-xs text-stone-400 ml-auto">{actions.length}</span>
          </div>
          {actions.length > 0 ? (
            <div className="space-y-2.5">{actions.slice(0, 5).map(a => (
              <div key={a.id} className="text-sm text-stone-600 flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.priority === "high" ? "bg-red-400" : a.priority === "medium" ? "bg-yellow-400" : "bg-stone-300"}`} />
                {a.task}
              </div>
            ))}</div>
          ) : <p className="text-sm text-stone-400">All caught up!</p>}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-stone-50 p-6">
          <h3 className="font-display font-bold mb-4">Intake Notes</h3>
          <p className="text-sm text-stone-500 leading-relaxed">{client.intake_notes || "No intake notes yet."}</p>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-2xl border border-stone-50 p-6">
        <h3 className="font-display font-bold text-lg mb-4">Session History</h3>
        {completed.length === 0 ? (
          <p className="text-sm text-stone-400 py-4">No completed sessions yet.</p>
        ) : (
          <div className="space-y-3">{completed.map(s => (
            <Link key={s.id} href={`/dashboard/sessions/${s.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition">
              <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">#{s.session_number}</div>
              <div className="flex-1">
                <p className="text-sm text-stone-600 line-clamp-1">{s.summary?.slice(0, 120) || "Session completed"}</p>
                <p className="text-xs text-stone-400 mt-0.5">{formatDate(s.created_at)}</p>
              </div>
              {s.breakthrough_flagged && <Zap className="w-4 h-4 text-terra" />}
            </Link>
          ))}</div>
        )}
      </div>
    </div>
  );
}
