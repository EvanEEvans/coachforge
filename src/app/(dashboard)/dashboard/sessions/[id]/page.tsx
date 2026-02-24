"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Video, Play, CheckCircle, Clock, Brain, Mail,
  Loader2, ListChecks, BarChart3, AlertCircle, Zap, Flag,
  Send, Copy, ChevronDown, ChevronRight, Mic, FileText,
  Sparkles, TrendingUp, Heart, Battery, MessageSquare,
  RefreshCw, ExternalLink, BookOpen
} from "lucide-react";
import { formatDate, formatDuration, formatTime, getInitials, cn } from "@/lib/utils/constants";
import type { Session, Client, ActionItem } from "@/lib/supabase/types";

export default function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
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
    // Poll for processing updates
    const interval = setInterval(async () => {
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (sess && sess.status === "completed" && session?.status !== "completed") {
        setSession(sess);
        const { data: acts } = await supabase.from("action_items").select("*").eq("session_id", id).order("priority");
        setActions(acts || []);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleStartSession = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/sessions/${id}/start`, { method: "POST" });
      const data = await res.json();
      if (data.room_url) { router.push(`/dashboard/sessions/${id}/live`); }
    } catch (e) { console.error(e); }
    setStarting(false);
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await fetch(`/api/sessions/${id}/end`, { method: "POST" });
      const data = await res.json();
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (sess) setSession(sess);
      const { data: acts } = await supabase.from("action_items").select("*").eq("session_id", id).order("priority");
      setActions(acts || []);
    } catch (e) { console.error(e); }
    setReprocessing(false);
  };

  const copyEmail = () => {
    if (session?.followup_email_body) {
      navigator.clipboard.writeText(session.followup_email_body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      await fetch(`/api/sessions/${id}/send-email`, { method: "POST" });
      setSession(prev => prev ? { ...prev, followup_email_sent: true, followup_email_sent_at: new Date().toISOString() } : null);
    } catch (e) { console.error(e); }
    setEmailSending(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-white rounded-xl w-48" /><div className="h-64 bg-white rounded-2xl" /></div>;
  if (!session || !client) return <div className="text-center py-16 text-gray-400">Session not found</div>;

  const isCompleted = session.status === "completed";
  const isProcessing = session.status === "processing";
  const mode = session.ai_notes?.mode || "video";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/sessions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal transition">
        <ArrowLeft className="w-4 h-4" /> Back to sessions
      </Link>

      {/* Session Header */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-soft text-teal flex items-center justify-center text-lg font-bold">
              {getInitials(client.full_name)}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">{client.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">Session #{session.session_number}</span>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-400">{formatDate(session.created_at)}</span>
                {session.started_at && <><span className="text-gray-300">·</span><span className="text-sm text-gray-400">{formatTime(session.started_at)}</span></>}
                <span className="text-gray-300">·</span>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                  mode === "video" ? "bg-teal-soft text-teal" : "bg-violet-50 text-violet-500"
                )}>
                  {mode === "video" ? <Video className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  {mode === "video" ? "Video" : "Audio"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.status === "scheduled" && (
              <button onClick={handleStartSession} disabled={starting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-bold hover:shadow-teal transition disabled:opacity-50">
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {starting ? "Starting..." : "Start Session"}
              </button>
            )}
            {session.status === "in_progress" && (
              <button onClick={() => router.push(`/dashboard/sessions/${id}/live`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Rejoin Live
              </button>
            )}
            {isCompleted && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>

        {/* Session Metrics */}
        {(session.duration_seconds || session.mood_score) && (
          <div className="flex gap-5 mt-6 pt-5 border-t border-gray-50">
            {session.duration_seconds && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Clock className="w-4 h-4 text-blue-500" /></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Duration</p><p className="text-sm font-bold mt-0.5">{formatDuration(session.duration_seconds)}</p></div>
              </div>
            )}
            {session.mood_score != null && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center"><Heart className="w-4 h-4 text-pink-500" /></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Mood</p><p className="text-sm font-bold mt-0.5">{session.mood_score}%</p></div>
              </div>
            )}
            {session.energy_score != null && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Battery className="w-4 h-4 text-amber-500" /></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Energy</p><p className="text-sm font-bold mt-0.5">{session.energy_score}%</p></div>
              </div>
            )}
            {session.engagement_score != null && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-500" /></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Engagement</p><p className="text-sm font-bold mt-0.5">{session.engagement_score}%</p></div>
              </div>
            )}
            {session.breakthrough_flagged && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700">Breakthrough Detected</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white rounded-2xl border border-gray-50 p-12 text-center">
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-3 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-3 border-teal border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-teal-soft flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold mb-2">AI is analyzing your session</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Generating summary, detecting breakthroughs, creating action items, and drafting your client&apos;s follow-up email. This takes 30–60 seconds.</p>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-teal animate-pulse" /> Analyzing themes</span>
            <span className="flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Extracting actions</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-500 animate-pulse" /> Drafting email</span>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {isCompleted && session.summary && (
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal to-emerald-500 flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div>
            <h3 className="font-display text-lg font-bold">Session Summary</h3>
            <span className="ml-auto text-xs text-gray-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Generated</span>
          </div>
          <p className="text-gray-600 leading-relaxed">{session.summary}</p>

          {session.summary_structured && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {session.summary_structured.key_themes?.length > 0 && (
                <div className="p-4 bg-teal-soft/30 rounded-xl border border-teal/10">
                  <p className="text-xs font-bold text-teal uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Key Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {session.summary_structured.key_themes.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white rounded-lg text-xs text-gray-600 font-medium shadow-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {session.summary_structured.breakthroughs?.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Zap className="w-3 h-3" /> Breakthroughs</p>
                  <div className="space-y-2">
                    {session.summary_structured.breakthroughs.map((b: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600 flex items-start gap-2"><span className="text-amber-400 mt-0.5">★</span> {b}</p>
                    ))}
                  </div>
                </div>
              )}
              {session.summary_structured.concerns?.length > 0 && (
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Watch Points</p>
                  <div className="space-y-2">
                    {session.summary_structured.concerns.map((c: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600 flex items-start gap-2"><span className="text-red-300 mt-0.5">●</span> {c}</p>
                    ))}
                  </div>
                </div>
              )}
              {session.summary_structured.coaching_techniques_used?.length > 0 && (
                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Techniques Used</p>
                  <div className="flex flex-wrap gap-2">
                    {session.summary_structured.coaching_techniques_used.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white rounded-lg text-xs text-gray-600 font-medium shadow-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Items */}
      {isCompleted && (
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><ListChecks className="w-4 h-4 text-white" /></div>
            <h3 className="font-display text-lg font-bold">Action Items & To-Dos</h3>
            <span className="ml-auto text-xs text-gray-400">{actions.filter(a => a.completed).length}/{actions.length} complete</span>
          </div>
          {actions.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No action items generated for this session.</p>
          ) : (
            <div className="space-y-2">
              {actions.map(action => (
                <div key={action.id} className={cn("flex items-start gap-3 p-3 rounded-xl transition group",
                  action.completed ? "bg-gray-50/50" : "hover:bg-brand-bg-soft"
                )}>
                  <button onClick={async () => {
                      const { data } = await supabase.from("action_items").update({ completed: !action.completed, completed_at: !action.completed ? new Date().toISOString() : null }).eq("id", action.id).select().single();
                      if (data) setActions(prev => prev.map(a => a.id === data.id ? data : a));
                    }}
                    className={cn("w-5 h-5 rounded-lg border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition",
                      action.completed ? "bg-teal border-teal text-white" : "border-gray-300 group-hover:border-teal/50"
                    )}>
                    {action.completed && <CheckCircle className="w-3 h-3" />}
                  </button>
                  <div className="flex-1">
                    <p className={cn("text-sm", action.completed ? "line-through text-gray-400" : "text-gray-700")}>{action.task}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        action.priority === "high" ? "bg-red-50 text-red-500" : action.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"
                      )}>{action.priority}</span>
                      {action.due_date && <span className="text-[10px] text-gray-400 font-medium">{formatDate(action.due_date)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Follow-Up Email */}
      {isCompleted && session.followup_email_body && (
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Mail className="w-4 h-4 text-white" /></div>
            <h3 className="font-display text-lg font-bold">Follow-Up Email</h3>
            <div className="ml-auto flex items-center gap-2">
              {session.followup_email_sent ? (
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold px-3 py-1.5 bg-green-50 rounded-lg">
                  <CheckCircle className="w-3 h-3" /> Sent to {client.email}
                </span>
              ) : (
                <>
                  <button onClick={copyEmail} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={handleSendEmail} disabled={emailSending}
                    className="flex items-center gap-1.5 text-xs text-white font-semibold px-3 py-1.5 bg-teal rounded-lg hover:shadow-teal transition disabled:opacity-50">
                    {emailSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    {emailSending ? "Sending..." : "Send Now"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
              <span className="text-xs text-gray-400 font-medium">To:</span>
              <span className="text-xs text-gray-600 font-semibold">{client.full_name} &lt;{client.email}&gt;</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{session.followup_email_body}</p>
          </div>
        </div>
      )}

      {/* Transcript */}
      {isCompleted && session.transcript_text && (
        <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
          <button onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><FileText className="w-4 h-4 text-gray-500" /></div>
              <h3 className="font-display text-lg font-bold">Full Transcript</h3>
              <span className="text-xs text-gray-400 ml-2">{session.ai_notes?.word_count || "—"} words</span>
            </div>
            {showTranscript ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </button>
          {showTranscript && (
            <div className="px-6 pb-6 border-t border-gray-50">
              <div className="mt-4 max-h-96 overflow-y-auto space-y-3 pr-2">
                {session.transcript_raw ? (
                  session.transcript_raw.map((line: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5",
                        line.speaker === "coach" ? "bg-teal-soft text-teal" : "bg-violet-50 text-violet-500"
                      )}>
                        {line.speaker === "coach" ? "C" : client.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono">{line.timestamp}</span>
                        <p className="text-sm text-gray-600 leading-relaxed">{line.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <pre className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">{session.transcript_text}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
