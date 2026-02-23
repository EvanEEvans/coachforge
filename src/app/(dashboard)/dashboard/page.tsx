"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Users, Video, Clock, TrendingUp, ArrowRight, Calendar, Plus } from "lucide-react";
import { formatRelative, getInitials } from "@/lib/utils/constants";
import type { Client, Session, Profile } from "@/lib/supabase/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, clientRes, sessionRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("clients").select("*").eq("coach_id", user.id).eq("status", "active").order("last_session_at", { ascending: false }),
        supabase.from("sessions").select("*, client:clients(full_name, email)").eq("coach_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setProfile(profRes.data);
      setClients(clientRes.data || []);
      setSessions(sessionRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const completedSessions = sessions.filter(s => s.status === "completed");
  const upcomingSessions = sessions.filter(s => s.status === "scheduled");
  const totalHoursSaved = completedSessions.length * 1.5; // ~1.5hr saved per session

  const stats = [
    { label: "Active Clients", value: clients.length, icon: Users, color: "text-teal", bg: "bg-teal-soft" },
    { label: "Sessions This Month", value: profile?.session_count_this_month || 0, icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Hours Saved", value: `${totalHoursSaved.toFixed(0)}h`, icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg Engagement", value: completedSessions.length ? Math.round(completedSessions.reduce((a, s) => a + (s.engagement_score || 0), 0) / completedSessions.length) + "%" : "—", icon: TrendingUp, color: "text-terra", bg: "bg-terra-soft" },
  ];

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}</div>
      <div className="h-64 bg-white rounded-2xl" />
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {profile?.full_name?.split(" ")[0]}
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your coaching practice.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-50 hover:shadow-medium transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Upcoming Sessions</h3>
            <Link href="/dashboard/sessions" className="text-teal text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-3">No upcoming sessions</p>
              <Link href="/dashboard/sessions?new=true" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
                <Plus className="w-4 h-4" /> Schedule Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 5).map(session => (
                <Link key={session.id} href={`/dashboard/sessions/${session.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-bg-soft transition"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
                    {getInitials((session.client as any)?.full_name || "?")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{(session.client as any)?.full_name}</p>
                    <p className="text-xs text-gray-400">Session #{session.session_number}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "TBD"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Clients</h3>
            <Link href="/dashboard/clients/new" className="text-teal text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus className="w-3 h-3" /> Add
            </Link>
          </div>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-3">No clients yet</p>
              <Link href="/dashboard/clients/new" className="text-teal text-sm font-semibold hover:underline">Add your first client</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 6).map(client => (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-bg-soft transition"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
                    {getInitials(client.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.full_name}</p>
                    <p className="text-xs text-gray-400">{client.session_count} sessions</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="font-display text-lg font-bold mb-4">Recent Sessions</h3>
        {completedSessions.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">No completed sessions yet. Start your first session to see results here.</p>
        ) : (
          <div className="space-y-3">
            {completedSessions.slice(0, 5).map(session => (
              <Link key={session.id} href={`/dashboard/sessions/${session.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-bg-soft transition"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">
                  {getInitials((session.client as any)?.full_name || "?")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{(session.client as any)?.full_name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{session.summary?.slice(0, 80)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{formatRelative(session.ended_at || session.created_at)}</p>
                  {session.breakthrough_flagged && <span className="text-xs text-terra font-semibold">🔥 Breakthrough</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
