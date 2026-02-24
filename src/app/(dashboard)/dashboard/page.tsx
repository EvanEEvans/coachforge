"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video, Mic, Clock, CheckCircle, Users, Search,
  Loader2, PlayCircle, Zap, ChevronRight, UserPlus,
  Sparkles, TrendingUp, Calendar, ArrowRight, Phone
} from "lucide-react";
import { formatDate, formatDuration, formatRelative, getInitials } from "@/lib/utils/constants";
import type { Client, Session } from "@/lib/supabase/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [sessionMode, setSessionMode] = useState<"video" | "audio" | null>(null);
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
        supabase.from("sessions").select("*, client:clients(full_name, email)").eq("coach_id", user.id).order("created_at", { ascending: false }).limit(20),
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
    const { data } = await supabase.from("sessions").insert({
      coach_id: user.id, client_id: clientId, session_number: sessionNumber, status: "scheduled",
      ai_notes: { mode: sessionMode || "video" },
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
  const recentSessions = sessions.slice(0, 6);
  const activeSessions = sessions.filter(s => s.status === "in_progress");
  const completedSessions = sessions.filter(s => s.status === "completed");
  const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-teal animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{greeting()}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
        <p className="text-gray-400 mt-1">
          {activeSessions.length > 0 ? `You have ${activeSessions.length} active session${activeSessions.length > 1 ? "s" : ""} right now` 
            : "Ready to coach? Your AI assistant is standing by."}
        </p>
      </div>

      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 via-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Video className="w-5 h-5" /></div><div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-red-500 animate-pulse" /></div>
              <div>
                <p className="font-display font-bold text-lg">Live Session</p>
                <p className="text-white/70 text-sm">{(activeSessions[0].client as any)?.full_name} · Session #{activeSessions[0].session_number}</p>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/sessions/${activeSessions[0].id}/live`)}
              className="px-6 py-3 bg-white text-red-500 rounded-xl text-sm font-bold hover:shadow-xl transition-all hover:scale-[1.02]">
              Rejoin Session <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Main Action Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {!showQuickStart ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button onClick={() => { setSessionMode("video"); setShowQuickStart(true); }}
                className="group relative w-36 h-36 rounded-3xl bg-gradient-to-br from-teal to-emerald-500 flex flex-col items-center justify-center gap-2 hover:shadow-[0_8px_40px_rgba(0,166,153,0.35)] transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Video className="w-10 h-10 text-white drop-shadow-sm" />
                <span className="text-white text-sm font-bold">Video Call</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal rounded-full text-[10px] text-white font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                  + AI Notes
                </div>
              </button>
              <div className="text-gray-300 font-display text-sm">or</div>
              <button onClick={() => { setSessionMode("audio"); setShowQuickStart(true); }}
                className="group relative w-36 h-36 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center gap-2 hover:shadow-[0_8px_40px_rgba(139,92,246,0.35)] transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Mic className="w-10 h-10 text-white drop-shadow-sm" />
                <span className="text-white text-sm font-bold">Audio Only</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500 rounded-full text-[10px] text-white font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                  + AI Notes
                </div>
              </button>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Start a Coaching Session</h2>
            <p className="text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Choose video or audio, pick your client, and go. CoachForge transcribes in real-time, 
              captures key moments, and sends your client a polished follow-up — automatically.
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-teal" /> Live transcription</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Breakthrough detection</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Auto follow-ups</span>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sessionMode === "video" ? "bg-teal text-white" : "bg-violet-500 text-white"}`}>
                  {sessionMode === "video" ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Select Client</h2>
                  <p className="text-xs text-gray-400">{sessionMode === "video" ? "Video" : "Audio"} session with AI transcription</p>
                </div>
              </div>
              <button onClick={() => { setShowQuickStart(false); setSearchQuery(""); setSessionMode(null); }} className="text-sm text-gray-400 hover:text-gray-600 transition">Cancel</button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold mb-1">No clients yet</p>
                <p className="text-gray-400 text-sm mb-5">Add your first client to start coaching.</p>
                <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
                  <UserPlus className="w-4 h-4" /> Add Your First Client
                </Link>
              </div>
            ) : (
              <>
                {clients.length > 3 && (
                  <div className="relative mb-5">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition" autoFocus />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredClients.map(client => (
                    <button key={client.id} onClick={() => handleQuickStart(client.id)} disabled={creating}
                      className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all hover:border-teal hover:bg-teal-soft/20 hover:shadow-sm hover:-translate-y-0.5 ${creating && selectedClient === client.id ? "border-teal bg-teal-soft/30 shadow-sm" : "border-gray-100"} disabled:opacity-50`}>
                      <div className="w-14 h-14 rounded-full bg-teal-soft text-teal flex items-center justify-center text-sm font-bold group-hover:scale-105 transition">
                        {getInitials(client.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{client.full_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{client.session_count || 0} sessions</p>
                      </div>
                      {creating && selectedClient === client.id && <Loader2 className="w-4 h-4 text-teal animate-spin" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-50 p-5 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-teal-soft flex items-center justify-center"><Users className="w-4 h-4 text-teal" /></div></div>
          <p className="font-display text-2xl font-bold">{clients.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Active Clients</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-50 p-5 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Video className="w-4 h-4 text-blue-500" /></div></div>
          <p className="font-display text-2xl font-bold">{sessions.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Sessions</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-50 p-5 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Clock className="w-4 h-4 text-purple-500" /></div></div>
          <p className="font-display text-2xl font-bold">{Math.round(totalMinutes)}<span className="text-sm text-gray-400 ml-1">min</span></p>
          <p className="text-xs text-gray-400 mt-0.5">Coaching Hours</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-50 p-5 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-500" /></div></div>
          <p className="font-display text-2xl font-bold">{sessions.filter(s => s.breakthrough_flagged).length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Breakthroughs</p>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Recent Sessions</h3>
            <Link href="/dashboard/sessions" className="text-sm text-teal font-semibold hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden divide-y divide-gray-50">
            {recentSessions.map(session => (
              <Link key={session.id} href={session.status === "in_progress" ? `/dashboard/sessions/${session.id}/live` : `/dashboard/sessions/${session.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-bg-soft transition group">
                <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitials((session.client as any)?.full_name || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{(session.client as any)?.full_name}</p>
                    <span className="text-xs text-gray-300">#{session.session_number}</span>
                    {session.breakthrough_flagged && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md uppercase">Breakthrough</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {session.summary?.slice(0, 90) || (session.status === "scheduled" ? "Ready to start" : session.status === "in_progress" ? "Session in progress..." : session.status === "processing" ? "AI is processing..." : "Pending")}
                    {session.summary && session.summary.length > 90 ? "..." : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatRelative(session.created_at)}</span>
                  {session.duration_seconds && <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-md">{formatDuration(session.duration_seconds)}</span>}
                  {session.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {session.status === "in_progress" && <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-xs text-red-500 font-semibold">LIVE</span></div>}
                  {session.status === "scheduled" && <Clock className="w-4 h-4 text-blue-400" />}
                  {session.status === "processing" && <Loader2 className="w-4 h-4 text-teal animate-spin" />}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
