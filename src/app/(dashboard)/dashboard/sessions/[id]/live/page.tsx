"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Clock,
  Loader2, AlertCircle, Users, Maximize2, Minimize2
} from "lucide-react";
import type { Session, Client } from "@/lib/supabase/types";

export default function LiveSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (!sess) { setError("Session not found"); setLoading(false); return; }
      if (!sess.room_url) { setError("No video room available. Please start the session first."); setLoading(false); return; }
      setSession(sess);
      const { data: cl } = await supabase.from("clients").select("*").eq("id", sess.client_id).single();
      setClient(cl);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!session || session.status !== "in_progress") return;
    const startTime = new Date(session.started_at || session.created_at).getTime();
    const interval = setInterval(() => { setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleEndSession = async () => {
    if (!confirm("End this session? AI will begin processing the recording.")) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/sessions/${id}/end`, { method: "POST" });
      const data = await res.json();
      if (data.error) { setError(data.error); } else { router.push(`/dashboard/sessions/${id}`); }
    } catch (e) { setError("Failed to end session"); }
    setEnding(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { iframeRef.current?.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><Loader2 className="w-8 h-8 text-teal animate-spin mx-auto mb-4" /><p className="text-gray-500">Loading session...</p></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" /><p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => router.push(`/dashboard/sessions/${id}`)} className="px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">Back to Session</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-sm font-semibold text-red-500">LIVE</span></div>
          <div className="w-px h-6 bg-gray-200" />
          <div><p className="text-sm font-semibold">{client?.full_name}</p><p className="text-xs text-gray-400">Session #{session?.session_number}</p></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl"><Clock className="w-4 h-4 text-gray-400" /><span className="text-sm font-mono font-semibold">{formatTime(elapsed)}</span></div>
          <button onClick={toggleFullscreen} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-teal hover:border-teal/20 transition">{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
          <button onClick={handleEndSession} disabled={ending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}{ending ? "Ending..." : "End Session"}
          </button>
        </div>
      </div>
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        {session?.room_url ? (
          <iframe ref={iframeRef} src={session.room_url} allow="camera; microphone; fullscreen; display-capture; autoplay" className="w-full h-full border-0" />
        ) : (
          <div className="flex items-center justify-center h-full"><div className="text-center text-white"><Video className="w-12 h-12 mx-auto mb-4 opacity-50" /><p className="text-gray-400">Waiting for video room...</p></div></div>
        )}
      </div>
      <div className="bg-teal-soft/50 rounded-2xl px-6 py-3 flex items-center gap-3">
        <Users className="w-4 h-4 text-teal flex-shrink-0" />
        <p className="text-xs text-teal">Share the session link with your client. Audio is being recorded for AI processing. Click "End Session" when finished.</p>
      </div>
    </div>
  );
}
