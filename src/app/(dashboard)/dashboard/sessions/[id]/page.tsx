"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Video, Play, CheckCircle, Clock, Brain, Mail,
  Loader2, ListChecks, BarChart3, AlertCircle, Zap
} from "lucide-react";
import { formatDate, formatDuration, getInitials } from "@/lib/utils/constants";
import type { Session, Client, ActionItem } from "@/lib/supabase/types";

export default function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (sess) {
        setSession(sess);
        const { data: cl } = await supabase.from("clients").select("*").eq("id", sess.client_id).single();
        setClient(cl);
        const { data: acts } = await supabase.from("action_items").select("*").eq("session_id", id).order("priority");
        setActions(acts || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleStartSession = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/sessions/${id}/start`, { method: "POST" });
      const data = await res.json();
      if (data.room_url) {
        router.push(`/dashboard/sessions/${id}/live`);
      }
    } catch (e) {
      console.error(e);
    }
    setStarting(false);
  };

  const handleProcessSession = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/sessions/${id}/end`, { method: "POST" });
      const data = await res.json();
      // Reload session data
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (sess) setSession(sess);
      const { data: acts } = await supabase.from("action_items").select("*").eq("session_id", id).order("priority");
      setActions(acts || []);
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-white rounded-xl w-48" /><div className="h-64 bg-white rounded-2xl" /></div>;
  if (!session || !client) return <div className="text-center py-16 text-gray-400">Session not found</div>;

  const isCompleted = session.status === "completed";

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/sessions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal transition">
        <ArrowLeft className="w-4 h-4" /> Back to sessions
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-soft text-teal flex items-center justify-center text-sm font-bold">
              {getInitials(client.full_name)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{client.full_name}</h2>
              <p className="text-sm text-gray-400">Session #{session.session_number} · {formatDate(session.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.status === "scheduled" && (
              <button onClick={handleStartSession} disabled={starting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition disabled:opacity-50"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {starting ? "Starting..." : "Start Session"}
              </button>
            )}
            {session.status === "in_progress" && (
              <button onClick={handleProcessSession} disabled={processing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {processing ? "Processing..." : "End & Process Session"}
              </button>
            )}
            {isCompleted && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>

        {session.duration_seconds && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
            <div><span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Duration</span><p className="text-sm font-semibold mt-1">{formatDuration(session.duration_seconds)}</p></div>
            {session.mood_score && <div><span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Mood</span><p className="text-sm font-semibold mt-1">{session.mood_score}%</p></div>}
            {session.energy_score && <div><span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Energy</span><p className="text-sm font-semibold mt-1">{session.energy_score}%</p></div>}
            {session.engagement_score && <div><span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Engagement</span><p className="text-sm font-semibold mt-1">{session.engagement_score}%</p></div>}
            {session.breakthrough_flagged && <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-terra-soft text-terra text-sm font-semibold"><Zap className="w-3 h-3" /> Breakthrough</div>}
          </div>
        )}
      </div>

      {/* AI Outputs */}
      {isCompleted && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-teal" />
              <h3 className="font-display text-lg font-bold">AI Session Summary</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{session.summary}</p>

            {session.summary_structured && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {session.summary_structured.key_themes?.length > 0 && (
                  <div className="p-4 bg-teal-soft/50 rounded-xl">
                    <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-2">Key Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {session.summary_structured.key_themes.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {session.summary_structured.breakthroughs?.length > 0 && (
                  <div className="p-4 bg-terra-soft/50 rounded-xl">
                    <p className="text-xs font-semibold text-terra uppercase tracking-wider mb-2">Breakthroughs</p>
                    {session.summary_structured.breakthroughs.map((b: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600 mb-1">• {b}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-2xl border border-gray-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-teal" />
              <h3 className="font-display text-lg font-bold">Action Items</h3>
              <span className="text-xs text-gray-400 ml-auto">{actions.filter(a => a.completed).length}/{actions.length} complete</span>
            </div>
            {actions.length === 0 ? (
              <p className="text-gray-400 text-sm">No action items for this session.</p>
            ) : (
              <div className="space-y-3">
                {actions.map(action => (
                  <div key={action.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-brand-bg-soft transition">
                    <button
                      onClick={async () => {
                        const { data } = await supabase.from("action_items").update({ completed: !action.completed, completed_at: !action.completed ? new Date().toISOString() : null }).eq("id", action.id).select().single();
                        if (data) setActions(prev => prev.map(a => a.id === data.id ? data : a));
                      }}
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition ${action.completed ? "bg-teal border-teal text-white" : "border-gray-300"}`}
                    >
                      {action.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${action.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{action.task}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${action.priority === "high" ? "bg-red-50 text-red-500" : action.priority === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-400"}`}>
                          {action.priority}
                        </span>
                        {action.due_date && <span className="text-xs text-gray-400">{formatDate(action.due_date)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Email */}
          {session.followup_email_body && (
            <div className="bg-white rounded-2xl border border-gray-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-teal" />
                  <h3 className="font-display text-lg font-bold">Follow-Up Email</h3>
                </div>
                {session.followup_email_sent ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold px-3 py-1 bg-green-50 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Sent
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Draft</span>
                )}
              </div>
              <div className="p-4 bg-brand-bg-soft rounded-xl">
                <p className="text-xs text-gray-400 mb-2">To: {client.email}</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{session.followup_email_body}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Processing state */}
      {session.status === "processing" && (
        <div className="bg-white rounded-2xl border border-gray-50 p-12 text-center">
          <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-teal animate-spin mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold mb-2">Processing your session...</h3>
          <p className="text-gray-400 text-sm">Generating summary, action items, and follow-up email. This typically takes 1-3 minutes.</p>
        </div>
      )}
    </div>
  );
}
