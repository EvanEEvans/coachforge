"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Video, Search, Clock, CheckCircle, Loader2, PlayCircle, XCircle } from "lucide-react";
import { formatDate, formatDuration, getInitials } from "@/lib/utils/constants";
import type { Client, Session } from "@/lib/supabase/types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [creating, setCreating] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("new") === "true") setShowNew(true);
  }, [params]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [sessRes, clientRes] = await Promise.all([
        supabase.from("sessions").select("*, client:clients(full_name, email)").eq("coach_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("clients").select("*").eq("coach_id", user.id).eq("status", "active").order("full_name"),
      ]);
      setSessions(sessRes.data || []);
      setClients(clientRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreateSession = async () => {
    if (!selectedClient) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get client's session count
    const client = clients.find(c => c.id === selectedClient);
    const sessionNumber = (client?.session_count || 0) + 1;

    const { data, error } = await supabase.from("sessions").insert({
      coach_id: user.id,
      client_id: selectedClient,
      session_number: sessionNumber,
      status: "scheduled",
    }).select().single();

    if (data) {
      router.push(`/dashboard/sessions/${data.id}`);
    }
    setCreating(false);
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "in_progress") return <PlayCircle className="w-4 h-4 text-red-500" />;
    if (s === "processing") return <Loader2 className="w-4 h-4 text-teal animate-spin" />;
    if (s === "cancelled") return <XCircle className="w-4 h-4 text-gray-400" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Sessions</h2>
          <p className="text-gray-500 text-sm">{sessions.length} total sessions</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition"
        >
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* New Session Dialog */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-teal/20 p-6 shadow-teal">
          <h3 className="font-display text-lg font-bold mb-4">Start a New Session</h3>
          <div className="flex gap-4">
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition bg-white"
            >
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
            <button onClick={handleCreateSession} disabled={!selectedClient || creating}
              className="px-6 py-3 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              {creating ? "Creating..." : "Create Session"}
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
          {clients.length === 0 && (
            <p className="text-sm text-gray-400 mt-3">
              You need to <Link href="/dashboard/clients/new" className="text-teal font-medium hover:underline">add a client</Link> first.
            </p>
          )}
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-50">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No sessions yet</p>
          <p className="text-gray-400 text-sm mb-4">Create your first session to get started with CoachForge.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {sessions.map(session => (
              <Link key={session.id} href={`/dashboard/sessions/${session.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-brand-bg-soft transition"
              >
                <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
                  {getInitials((session.client as any)?.full_name || "?")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{(session.client as any)?.full_name}</p>
                    <span className="text-xs text-gray-400">· Session #{session.session_number}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                    {session.summary?.slice(0, 100) || (session.status === "scheduled" ? "Scheduled" : "In progress...")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {session.duration_seconds && (
                    <span className="text-xs text-gray-400 font-mono">{formatDuration(session.duration_seconds)}</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {statusIcon(session.status)}
                    <span className="text-xs text-gray-500 capitalize">{session.status.replace("_", " ")}</span>
                  </div>
                  {session.breakthrough_flagged && <span className="text-xs">🔥</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
