"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Loader2,
  AlertCircle, Users, Maximize2, Minimize2, FileText,
  Sparkles, Zap, BookOpen, PauseCircle, Volume2, Wifi,
  ChevronDown, ChevronUp, Flag
} from "lucide-react";
import type { Session, Client } from "@/lib/supabase/types";

interface TranscriptLine {
  id: string;
  timestamp: string;
  speaker: "coach" | "client";
  text: string;
  flagged?: boolean;
}

export default function LiveSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Transcript state
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);

  // Session mode
  const [mode, setMode] = useState<"video" | "audio">("video");

  // Live indicators
  const [keyMoments, setKeyMoments] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // Load session
  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (!sess) { setError("Session not found"); setLoading(false); return; }
      if (!sess.room_url && !sess.ai_notes?.mode) { setError("Session not configured. Go back and start again."); setLoading(false); return; }
      setSession(sess);
      setMode(sess.ai_notes?.mode || "video");
      const { data: cl } = await supabase.from("clients").select("*").eq("id", sess.client_id).single();
      setClient(cl);
      setLoading(false);
    }
    load();
  }, [id]);

  // Timer
  useEffect(() => {
    if (!session || session.status !== "in_progress") return;
    const startTime = new Date(session.started_at || session.created_at).getTime();
    const interval = setInterval(() => { setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Start browser speech recognition for live transcript
  useEffect(() => {
    if (!session || loading) return;
    startTranscription();
    return () => stopTranscription();
  }, [session, loading]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimText]);

  const startTranscription = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            const newLine: TranscriptLine = {
              id: `t-${Date.now()}`,
              timestamp: formatTime(elapsed),
              speaker: "coach",
              text,
            };
            setTranscript(prev => [...prev, newLine]);
            setWordCount(prev => prev + text.split(/\s+/).length);
            setInterimText("");
          }
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") console.error("Speech error:", event.error);
    };

    recognition.onend = () => {
      if (isTranscribing) recognition.start();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsTranscribing(true);
    } catch (e) { console.error("Could not start recognition:", e); }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      setIsTranscribing(false);
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const toggleTranscription = () => {
    if (isTranscribing) { stopTranscription(); }
    else { startTranscription(); }
  };

  const flagMoment = () => {
    const moment = `${formatTime(elapsed)} — Key moment flagged`;
    setKeyMoments(prev => [...prev, moment]);
    if (transcript.length > 0) {
      setTranscript(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], flagged: true };
        return updated;
      });
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleEndSession = async () => {
    if (!confirm("End this session and generate AI summary?")) return;
    setEnding(true);
    stopTranscription();

    // Save transcript to session before ending
    const transcriptText = transcript.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join("\n");
    const transcriptRaw = transcript.map(t => ({ timestamp: t.timestamp, speaker: t.speaker, text: t.text }));

    await supabase.from("sessions").update({
      transcript_text: transcriptText,
      transcript_raw: transcriptRaw,
      ai_notes: { 
        ...(session?.ai_notes || {}),
        key_moments: keyMoments,
        word_count: wordCount,
        flagged_lines: transcript.filter(t => t.flagged).map(t => t.text),
      },
    }).eq("id", id);

    try {
      const res = await fetch(`/api/sessions/${id}/end`, { method: "POST" });
      const data = await res.json();
      if (data.error) { setError(data.error); setEnding(false); return; }
      router.push(`/dashboard/sessions/${id}`);
    } catch (e) { setError("Failed to end session"); setEnding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center"><Loader2 className="w-8 h-8 text-teal animate-spin mx-auto mb-4" /><p className="text-gray-500">Preparing your session...</p></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-md"><AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" /><p className="text-gray-600 mb-4 text-lg font-semibold">{error}</p>
        <button onClick={() => router.push(`/dashboard/sessions`)} className="px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">Back to Sessions</button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-3">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center text-[10px] font-bold">
              {client ? client.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "?"}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{client?.full_name}</p>
              <p className="text-[10px] text-gray-400">Session #{session?.session_number} · {mode === "video" ? "Video" : "Audio"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Word count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
            <FileText className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-500 font-medium">{wordCount} words</span>
          </div>
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg">
            <Clock className="w-3 h-3 text-red-400" />
            <span className="text-sm font-mono font-bold tracking-wide">{formatTime(elapsed)}</span>
          </div>
          {/* Flag Moment */}
          <button onClick={flagMoment} title="Flag this moment"
            className="w-9 h-9 rounded-xl border border-amber-200 bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition">
            <Flag className="w-4 h-4" />
          </button>
          {/* Toggle Transcription */}
          <button onClick={toggleTranscription} title={isTranscribing ? "Pause transcription" : "Resume transcription"}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${isTranscribing ? "border-green-200 bg-green-50 text-green-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
            {isTranscribing ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          {/* End Session */}
          <button onClick={handleEndSession} disabled={ending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50">
            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{ending ? "Processing..." : "End Session"}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Video/Audio + Transcript Side by Side */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left: Video or Audio Visualizer */}
        <div className={`${transcriptExpanded ? "w-3/5" : "w-full"} transition-all duration-300`}>
          <div className="bg-gray-900 rounded-2xl overflow-hidden h-full relative">
            {mode === "video" && session?.room_url ? (
              <iframe ref={iframeRef} src={session.room_url}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0" />
            ) : (
              /* Audio-only mode with beautiful visualizer */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative mx-auto mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          {isTranscribing ? <Volume2 className="w-7 h-7 text-white animate-pulse" /> : <Mic className="w-7 h-7 text-white" />}
                        </div>
                      </div>
                    </div>
                    {isTranscribing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-2 border-violet-400/30 animate-ping" style={{ animationDuration: "2s" }} />
                      </div>
                    )}
                  </div>
                  <p className="text-white/90 font-display font-bold text-xl">{client?.full_name}</p>
                  <p className="text-white/40 text-sm mt-1">Audio Session · {isTranscribing ? "Listening..." : "Paused"}</p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                      <Wifi className="w-3 h-3 text-green-400" />
                      <span className="text-white/60 text-xs">Connected</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                      <Sparkles className="w-3 h-3 text-teal" />
                      <span className="text-white/60 text-xs">AI Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Floating key moments count */}
            {keyMoments.length > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg shadow-lg text-xs font-bold">
                <Flag className="w-3 h-3" /> {keyMoments.length} flagged
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Transcript Panel */}
        {transcriptExpanded && (
          <div className="w-2/5 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Transcript Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-bold">Live Transcript</h3>
                {isTranscribing && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              </div>
              <button onClick={() => setTranscriptExpanded(false)} className="text-gray-400 hover:text-gray-600 transition">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript Body */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 scrollbar-thin">
              {transcript.length === 0 && !interimText && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Listening for speech...</p>
                  <p className="text-gray-300 text-xs mt-1 max-w-[200px]">Start speaking and your words will appear here in real-time</p>
                </div>
              )}

              {transcript.map((line) => (
                <div key={line.id} className={`group relative ${line.flagged ? "bg-amber-50/50 -mx-2 px-2 py-1 rounded-xl border border-amber-100" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                      line.speaker === "coach" ? "bg-teal-soft text-teal" : "bg-violet-50 text-violet-500"
                    }`}>
                      {line.speaker === "coach" ? "You" : client?.full_name?.charAt(0) || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-gray-400 font-mono">{line.timestamp}</span>
                        {line.flagged && <Flag className="w-3 h-3 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Interim (currently being spoken) */}
              {interimText && (
                <div className="flex items-start gap-3 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-teal-soft text-teal flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">You</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 italic leading-relaxed">{interimText}<span className="inline-block w-1 h-4 bg-teal animate-pulse ml-0.5 align-text-bottom" /></p>
                  </div>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Transcript Footer */}
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{transcript.length} entries</span>
                  <span>·</span>
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal" />
                  <span className="text-[11px] text-teal font-semibold">AI processing on end</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed transcript toggle */}
        {!transcriptExpanded && (
          <button onClick={() => setTranscriptExpanded(true)}
            className="w-10 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-teal transition">
            <FileText className="w-4 h-4 text-teal" />
            <ChevronUp className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="flex items-center gap-4 px-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Sparkles className="w-3 h-3 text-teal" />
          <span>AI is transcribing and detecting key coaching moments</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span>When you end, CoachForge generates:</span>
          <span className="font-medium text-gray-500">Summary</span>
          <span>·</span>
          <span className="font-medium text-gray-500">Action Items</span>
          <span>·</span>
          <span className="font-medium text-gray-500">Follow-up Email</span>
        </div>
      </div>
    </div>
  );
}
