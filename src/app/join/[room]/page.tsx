"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Video, Mic, Shield, ArrowRight } from "lucide-react";

export default function JoinSessionPage() {
  const { room } = useParams();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [consent, setConsent] = useState(false);

  const roomUrl = `https://coachforge.daily.co/${room}`;

  if (joined) {
    return (
      <div className="min-h-screen bg-gray-900">
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-screen border-0"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0D7377] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="font-bold text-white text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join Your Session</h1>
          <p className="text-gray-400 mt-2">Your coach is waiting for you</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Your name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377] transition" autoFocus />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What to expect</p>
            <div className="flex items-start gap-3"><Video className="w-4 h-4 text-[#0D7377] mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Video & audio coaching session with your coach</p></div>
            <div className="flex items-start gap-3"><Mic className="w-4 h-4 text-[#0D7377] mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">Session will be transcribed by AI for your benefit</p></div>
            <div className="flex items-start gap-3"><Shield className="w-4 h-4 text-[#0D7377] mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-600">You will receive a summary and action items by email after</p></div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300" />
            <span className="text-xs text-gray-500 leading-relaxed">I consent to this session being recorded and transcribed by AI for coaching purposes. My data is encrypted and never shared with third parties.</span>
          </label>
          <button onClick={() => setJoined(true)} disabled={!name.trim() || !consent}
            className="w-full py-3.5 rounded-xl bg-[#0D7377] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-sm">
            Join Session <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by <span className="font-semibold">CoachForge</span></p>
      </div>
    </div>
  );
}
