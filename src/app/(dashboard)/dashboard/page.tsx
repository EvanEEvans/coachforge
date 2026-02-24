"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video, Plus, Clock, CheckCircle, Users, Search,
  Loader2, PlayCircle, ArrowRight, Calendar, Brain,
  Zap, ChevronRight, UserPlus, Sparkles
} from "lucide-react";
import { formatDate, formatDuration, getInitials } from "@/lib/utils/constants";
import type { Client, Session } from "@/lib/supabase/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [sessRes, clientRes, profRes] = await Promise.all([
        supabase.from("sessions").select("*, client:clients(full_name, email)").eq("coach_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("clients").select("*").eq("coach_id", user.id).eq("status", "active").order("full_name"),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      setSessions(sessRes.data || []);
      setClients(clientRes.data || []);
      setProfile(profRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const handleQuickStart = async (clientId: string) => {
    setCreating(true);
    setSelectedClient(clientId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const client = clients.find(c => c.id === clientId);
    const sessionNumber = (client?.session_count || 0) + 1;
    const { data, error } = await supabase.from("sessions").insert({
      coach_id: user.id, client_id: clientId, session_number: sessionNumber, status: "scheduled",
    }).select().single();
    if (data) {
      try {
        const res = await fetch(`/api/sessions/${data.id}/start`, { method: "POST" });
        const roomData = await res.json();
        if (roomData.room_url) { router.push(`/dashboard/sessions/${data.id}/live`); return; }
      } catch (e) { console.error(e); }
      router.push(`/dashboard/sessions/${data.id}`);
    }
    setCreating(false);
  };

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const recentSessions = sessions.slice(0, 5);
  const activeSessions = sessions.filter(s => s.status === "in_progress");
  const completedToday = sessions.filter(s => {
    if (s.status !== "completed") return false;
    return new Date(s.created_at).toDateString() === new Date().toDateString();
  });
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-teal animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{greeting()}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
        <p className="text-gray-400 mt-1">
          {activeSessions.length > 0 ? `You have ${activeSessions.length} active session${activeSessions.length > 1 ? "s" : ""}` 
            : completedToday.length > 0 ? `${completedToday.length} session${completedToday.length > 1 ? "s" : ""} completed today`
            : "Ready to coach?"}
        </p>
      </div>

      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <div>
                <p className="font-semibold">Session in progress</p>
                <p className="text-white/70 text-sm">{(activeSessions[0].client as any)?.full_name} · Session #{activeSessions[0].session_number}</p>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/sessions/${activeSessions[0].id}/live`)}
              className="px-5 py-2.5 bg-white text-red-500 rounded-xl text-sm font-semibold hover:shadow-lg transition">
              Rejoin Session →
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {!showQuickStart ? (
          <div className="p-10 text-center">
            <button onClick={() => setShowQuickStart(true)}
              className="group w-32 h-32 rounded-full bg-teal mx-auto flex items-center justify-center hover:shadow-[0_0_60px_rgba(0,166,153,0.3)] transition-all duration-300 hover:scale-105">
              <Video className="w-12 h-12 text-white group-hover:scale-110 transition" />
            </button>
            <h2 className="font-display text-2xl font-bold mt-6">Start a Session</h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              Select a client, start your call, and CoachForge handles the rest — notes, summaries, action items, and follow-ups.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <button onClick={() => setShowQuickStart(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
                <Video className="w-4 h-4" /> New Session
              </button>
              <Link href="/dashboard/clients/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:border-teal hover:text-teal transition">
                <UserPlus className="w-4 h-4" /> Add Client
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Who are you coaching?</h2>
              <button onClick={() => { setShowQuickStart(false); setSearchQuery(""); }} className="text-sm text-gray-400 hover:text-gray-600 transition">Cancel</button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">No clients yet</p>
                <p className="text-gray-400 text-sm mb-4">Add your first client to start a session.</p>
                <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
                  <UserPlus className="w-4 h-4" /> Add Client
                </Link>
              </div>
            ) : (
              <>
                {clients.length > 4 && (
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search clients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition" autoFocus />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredClients.map(client => (
                    <button key={client.id} onClick={() => handleQuickStart(client.id)} disabled={creating}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition hover:border-teal hover:bg-teal-soft/30 ${creating && selectedClient === client.id ? "border-teal bg-teal-soft/30" : "border-gray-100"} disabled:opacity-50`}>
                      <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(client.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{client.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{client.session_count || 0} session{(client.session_count || 0) !== 1 ? "s" : ""}</p>
                      </div>
                      {creating && selectedClient === client.id && <Loader2 className="w-4 h-4 text-teal animate-spin ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-50 p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-teal-soft flex items-center justify-center"><Users className="w-4 h-4 text-teal" /></div><span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Clients</span></div>
          <p className="font-display text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-50 p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Video className="w-4 h-4 text-blue-500" /></div><span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sessions</span></div>
          <p className="font-display text-2xl font-bold">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-50 p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-purple-500" /></div><span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">AI Insights</span></div>
          <p className="font-display text-2xl font-bold">{sessions.filter(s => s.status === "completed").length}</p>
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Recent Sessions</h3>
            <Link href="/dashboard/sessions" className="text-sm text-teal font-semibold hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden divide-y divide-gray-50">
            {recentSessions.map(session => (
              <Link key={session.id} href={session.status === "in_progress" ? `/dashboard/sessions/${session.id}/live` : `/dashboard/sessions/${session.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-bg-soft transition">
                <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
                  {getInitials((session.client as any)?.full_name || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-semibold truncate">{(session.client as any)?.full_name}</p><span className="text-xs text-gray-400">#{session.session_number}</span></div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{session.summary?.slice(0, 80) || (session.status === "scheduled" ? "Scheduled" : session.status === "in_progress" ? "In progress..." : "Processing...")}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {session.duration_seconds && <span className="text-xs text-gray-400 font-mono">{formatDuration(session.duration_seconds)}</span>}
                  {session.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {session.status === "in_progress" && <PlayCircle className="w-4 h-4 text-red-500" />}
                  {session.status === "scheduled" && <Clock className="w-4 h-4 text-blue-500" />}
                  {session.status === "processing" && <Loader2 className="w-4 h-4 text-teal animate-spin" />}
                  {session.breakthrough_flagged && <Zap className="w-3 h-3 text-amber-500" />}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
