"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Video, Mic, Mail, Check, ChevronDown, Shield, Zap, Users, Clock,
  BarChart3, FileText, Heart, Target, Send, ArrowRight, Play, X,
  Brain, CheckCircle, Sparkles, Phone, Menu, Star, Globe, Award
} from "lucide-react";

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, visible] = useReveal(0.08);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const transcript = [
  { t: "0:00", who: "Coach", text: "Sarah, great to see you. How did the conversation with your manager go?" },
  { t: "0:45", who: "Client", text: "Really well! I used the framework we practiced — opened with my Q4 contributions, then my vision for team lead." },
  { t: "1:30", who: "Coach", text: "That's fantastic. How did she respond?" },
  { t: "1:48", who: "Client", text: "She was impressed! She mentioned a March opening and told me to apply. But I'm still feeling imposter syndrome." },
  { t: "2:30", who: "Coach", text: "When you say imposter syndrome, what specifically comes up?" },
  { t: "2:50", who: "Client", text: "I keep thinking other candidates have more experience. What if I get it and can't do it?" },
  { t: "3:20", who: "Coach", text: "Your manager — who sees your work every day — was impressed and encouraged you. What does that tell you?" },
  { t: "3:50", who: "Client", text: "...Yeah. If she thought I couldn't do it, she wouldn't have said that." },
];

function EmbeddedDemo() {
  const [step, setStep] = useState(0);
  const [dur, setDur] = useState(0);
  const [ti, setTi] = useState(0);
  const [live, setLive] = useState<typeof transcript>([]);
  const [procStep, setProcStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (step === 1) { const t = setInterval(() => setDur(d => d + 1), 1000); return () => clearInterval(t); } }, [step]);
  useEffect(() => { if (step === 1 && ti < transcript.length) { const t = setTimeout(() => { setLive(p => [...p, transcript[ti]]); setTi(i => i + 1); }, 2200 + Math.random() * 2000); return () => clearTimeout(t); } }, [step, ti]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [live]);
  useEffect(() => { if (step === 2) { let i = 0; const t = setInterval(() => { i++; setProcStep(i); if (i >= 5) { clearInterval(t); setTimeout(() => setStep(3), 700); } }, 600); return () => clearInterval(t); } }, [step]);

  const reset = () => { setStep(0); setDur(0); setTi(0); setLive([]); setProcStep(0); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const steps = ["Dashboard", "Live Session", "AI Processing", "Results"];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[rgba(255,255,255,0.03)]">
      <div className="flex items-center px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] gap-1.5">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${i <= step ? "bg-[#2563EB] text-white" : "bg-white/10 text-[#94A3B8]"} ${i === step ? "ring-4 ring-[#2563EB]/20" : ""}`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${i === step ? "font-semibold text-white" : "text-[#94A3B8]"}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-[#2563EB]" : "bg-white/10"} transition-all`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="p-7">
          <div className="mb-6"><h3 className="text-xl font-bold text-white">Good morning, Coach</h3><p className="text-sm text-[#94A3B8]">Sarah Mitchell&apos;s session is ready</p></div>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[["5", "Clients"], ["12", "This Week"], ["60%", "Progress"], ["14h", "Saved"]].map(([v, l], i) => (
              <div key={i} className="p-4 rounded-xl text-center border border-white/[0.06] bg-white/[0.02]">
                <div className="text-xl font-extrabold text-[#06B6D4]">{v}</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-[#2563EB]/10 rounded-xl flex items-center justify-between border border-[#2563EB]/20 flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center text-sm font-bold">SM</div>
              <div><div className="font-semibold text-white">Sarah Mitchell</div><div className="text-xs text-[#94A3B8]">Session #13 · Career Coaching</div></div>
            </div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:opacity-90 transition">
              <Video className="w-4 h-4" /> Start Session
            </button>
          </div>
          <p className="text-center mt-4 text-xs text-[#2563EB] font-medium">Click &quot;Start Session&quot; to begin the demo</p>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Live</span><span className="font-mono text-sm text-white">{fmt(dur)}</span></div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">AI Transcribing</span>
          </div>
          <div className="grid grid-cols-[1fr_260px] min-h-[320px]">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                {[["You", "EV"], ["Sarah", "SM"]].map(([name, ini], i) => (
                  <div key={i} className="bg-white/[0.03] rounded-xl flex flex-col items-center justify-center min-h-[130px] border border-white/[0.06]">
                    <div className="w-12 h-12 rounded-full bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center text-sm font-bold">{ini}</div>
                    <div className="text-sm font-semibold mt-2 text-white">{name}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3">
                <button className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white/70"><Mic className="w-[18px] h-[18px]" /></button>
                <button className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white/70"><Video className="w-[18px] h-[18px]" /></button>
                <button onClick={() => setStep(2)} className="w-11 h-11 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30"><Phone className="w-[18px] h-[18px]" /></button>
              </div>
              <p className="text-center mt-3 text-[11px] text-[#2563EB] font-medium">Watch the transcript, then click the red button to end</p>
            </div>
            <div className="border-l border-white/[0.06] flex flex-col">
              <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2 text-xs font-semibold text-white"><BarChart3 className="w-3.5 h-3.5 text-[#06B6D4]" /> Live Transcript<div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /></div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 max-h-[240px]">
                {live.length === 0 && <p className="text-center text-[#94A3B8] text-xs mt-8 animate-pulse">Listening...</p>}
                {live.map((l, i) => (
                  <div key={i} className="mb-3.5">
                    <div className="flex items-center gap-1.5 mb-0.5"><span className={`text-[10px] font-bold uppercase tracking-wide ${l.who === "Coach" ? "text-[#2563EB]" : "text-[#06B6D4]"}`}>{l.who}</span><span className="text-[9px] text-[#94A3B8] font-mono">{l.t}</span></div>
                    <p className="text-[12px] text-white/60 leading-relaxed">{l.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-full border-[3px] border-white/10 border-t-[#2563EB] animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold mb-1.5 text-white">Processing your session...</h3>
          <p className="text-[#94A3B8] text-sm mb-8">Takes ~3 min. We&apos;ll fast-forward.</p>
          <div className="inline-flex flex-col gap-2.5 text-left">
            {["Transcribing audio", "Generating summary", "Extracting action items", "Drafting follow-up email", "Updating client progress", "Scheduling nudges"].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${i <= procStep ? "bg-emerald-400/20 text-emerald-400" : "bg-white/10 text-[#94A3B8]"}`}>
                  {i <= procStep ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
                <span className={`text-sm ${i <= procStep ? "font-medium text-white" : "text-[#94A3B8]"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold"><Check className="w-3 h-3" /> Complete</span>
            <span className="text-xs text-[#94A3B8]">Session with Sarah Mitchell · 45 min</span>
          </div>
          <div className="p-5 bg-[#2563EB]/5 rounded-xl mb-4 border border-[#2563EB]/10">
            <div className="text-xs font-bold text-[#2563EB] mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> AI SESSION SUMMARY</div>
            <p className="text-[13px] text-white/60 leading-relaxed">Sarah reported a successful conversation with her manager about the team lead promotion. Her manager encouraged her to apply for a March opening. We identified imposter syndrome as the primary barrier and began a confidence anchoring exercise. Key breakthrough: Sarah recognized her manager&apos;s encouragement is direct evidence of her capability.</p>
          </div>
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <div className="text-xs font-bold mb-3 text-white flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ACTION ITEMS</div>
              {[{ task: "Complete confidence anchoring journal — daily for 1 week", due: "Feb 27" }, { task: "Draft internal application for team lead", due: "Mar 1" }, { task: "List 5 accomplishments with measurable impact", due: "Feb 22" }].map((a, i) => (
                <div key={i} className="flex gap-2 mb-2.5"><div className="w-4 h-4 rounded border-2 border-[#2563EB]/30 shrink-0 mt-0.5" /><div><p className="text-[12px] font-medium leading-snug text-white/80">{a.task}</p><p className="text-[10px] text-[#94A3B8]">{a.due}</p></div></div>
              ))}
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <div className="flex justify-between items-center mb-3"><div className="text-xs font-bold text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#06B6D4]" /> FOLLOW-UP EMAIL</div><span className="text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Auto-Sent</span></div>
              <p className="text-[11px] text-[#94A3B8] mb-2">To: sarah.mitchell@email.com</p>
              <p className="text-[12px] text-white/60">&quot;Hi Sarah, What a powerful session today!...&quot;</p>
              <p className="text-[11px] text-[#94A3B8] italic mt-2">Includes: summary, actions, encouragement, portal link</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-lg font-bold mb-1.5 text-white">Session over. Everything done. You wrote nothing.</p>
            <p className="text-sm text-[#94A3B8] mb-5">Sarah already has her email. You&apos;re free.</p>
            <button onClick={reset} className="px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:opacity-90 transition">Replay Demo</button>
          </div>
        </div>
      )}
    </div>
  );
}

const tiers = [
  { name: "Starter", price: "49", desc: "For coaches getting started", feats: ["15 sessions/month", "AI session summaries", "Auto follow-up emails", "Session prep briefs", "15 clients", "Email support"], cta: "Start Free Trial", pop: false },
  { name: "Professional", price: "97", desc: "The complete coaching OS", feats: ["40 sessions/month", "Everything in Starter", "Client progress dashboard", "Branded client portal", "Transformation reports", "Accountability nudges", "Custom branding", "Priority support"], cta: "Start Free Trial", pop: true },
  { name: "Scale", price: "197", desc: "For coaching businesses", feats: ["Unlimited sessions", "Everything in Professional", "Multi-coach (up to 5)", "Team dashboard", "Content engine", "White-label option", "Dedicated success manager"], cta: "Start Free Trial", pop: false },
];

const comparisons = [
  { feature: "Auto session recording", cf: true, zoom: false, otter: true, notion: false },
  { feature: "AI coaching notes", cf: true, zoom: false, otter: true, notion: false },
  { feature: "Follow-up email generation", cf: true, zoom: false, otter: false, notion: false },
  { feature: "Client dashboards", cf: true, zoom: false, otter: false, notion: true },
  { feature: "Coaching-specific insights", cf: true, zoom: false, otter: false, notion: false },
  { feature: "Action item tracking", cf: true, zoom: false, otter: false, notion: true },
  { feature: "Accountability nudges", cf: true, zoom: false, otter: false, notion: false },
  { feature: "Client portal", cf: true, zoom: false, otter: false, notion: false },
];

const faqs = [
  { q: "Won't the AI emails sound robotic?", a: "No. CoachForge builds emails from your actual session — the words your client used, the emotions they expressed, the commitments they made. Clients consistently rate them as warm and personal." },
  { q: "I'm not technical. Is this complicated?", a: "If you can click a button and have a conversation, you can use CoachForge. Client joins via a link. You hit End Session when you're done. No software to install, no configuration." },
  { q: "What about client confidentiality?", a: "End-to-end encrypted. Transcripts are private to your account. Client data is never used to train AI models. We're building toward HIPAA compliance." },
  { q: "Can I try it before paying?", a: "Yes. The Free tier gives you 2 sessions per month, forever, with no credit card required." },
  { q: "How is this different from Fathom or Otter?", a: "Those are general meeting tools. CoachForge is built specifically for coaching — action items with accountability, client portals, progress tracking, re-enrollment reports, prep briefs." },
];

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#0B0F19", color: "#FFFFFF" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .cf-heading { font-family: 'Space Grotesk', sans-serif; }
        .cf-glow { background: radial-gradient(ellipse 600px 400px at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%); }
        .cf-grid { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 64px 64px; }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl border-b border-white/[0.06]" : ""}`} style={{ background: scrolled ? "rgba(11,15,25,0.9)" : "transparent" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563EB" }}><span className="font-bold text-white text-sm">C</span></div>
            <span className="cf-heading font-bold text-lg tracking-tight text-white">CoachForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-sm text-white/60 hover:text-white transition">Product</a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition">Pricing</a>
            <a href="#compare" className="text-sm text-white/60 hover:text-white transition">Compare</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition">Customers</a>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition">Login</Link>
          </div>
          <Link href="/signup" className="hidden md:inline-flex px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition" style={{ background: "#2563EB", boxShadow: "0 8px 32px rgba(37,99,235,0.25)" }}>Start Free Trial</Link>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white"><Menu className="w-5 h-5" /></button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="cf-glow absolute inset-0 pointer-events-none" />
        <div className="cf-grid absolute inset-0 pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs mb-6" style={{ color: "#94A3B8" }}>
                  <Sparkles className="w-3 h-3" style={{ color: "#06B6D4" }} /> Now with real-time AI transcription
                </div>
              </FadeIn>
              <FadeIn delay={100}>
                <h1 className="cf-heading text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-6">
                  The Operating System<br />for <span style={{ color: "#2563EB" }}>Serious Coaches</span>
                </h1>
              </FadeIn>
              <FadeIn delay={200}>
                <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Run your entire coaching practice from one platform. Record sessions, generate notes, send follow-ups, and manage clients — automatically.
                </p>
              </FadeIn>
              <FadeIn delay={300}>
                <div className="flex items-center gap-4">
                  <Link href="/signup" className="px-7 py-3.5 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm" style={{ background: "#2563EB", boxShadow: "0 8px 32px rgba(37,99,235,0.25)" }}>Start Free Trial</Link>
                  <a href="#demo" className="flex items-center gap-2 px-5 py-3.5 rounded-lg border border-white/[0.1] text-sm font-medium text-white/70 hover:text-white hover:border-white/20 transition"><Play className="w-4 h-4" /> Watch Demo</a>
                </div>
              </FadeIn>
              <FadeIn delay={400}><p className="text-xs mt-6" style={{ color: "#94A3B8" }}>No credit card required · Free forever plan · Setup in 2 minutes</p></FadeIn>
            </div>
            <FadeIn delay={200}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl blur-3xl" style={{ background: "rgba(37,99,235,0.05)" }} />
                <div className="relative"><EmbeddedDemo /></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium tracking-[1.5px] uppercase mb-8" style={{ color: "#94A3B8" }}>Trusted by coaches building modern coaching companies</p>
          <div className="flex items-center justify-center gap-16 opacity-50 hover:opacity-70 transition-opacity">
            <div className="flex items-center gap-2"><span className="cf-heading text-2xl font-bold tracking-tight text-white/60">EEE</span><span className="text-sm text-white/40 font-medium">Coach</span></div>
            <div><span className="cf-heading text-2xl font-bold tracking-tight text-white/60">GOD CHASER</span></div>
            <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-white/40" /><span className="cf-heading text-2xl font-bold tracking-tight text-white/60">SIMA</span><span className="text-sm text-white/40 font-medium">Global</span></div>
          </div>
          <p className="text-sm text-white/20 mt-6">…and growing every day</p>
        </div>
      </section>

      {/* CORE VALUE */}
      <section id="product" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn><div className="text-center mb-16">
            <h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">Everything happens automatically<br />after your session ends</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94A3B8" }}>CoachForge handles the admin so you stay fully present with your clients.</p>
          </div></FadeIn>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Video className="w-6 h-6" />, title: "Record sessions automatically", desc: "Video or audio. One click to start. AI captures everything.", color: "#2563EB" },
              { icon: <Brain className="w-6 h-6" />, title: "AI writes professional notes", desc: "Summaries, key themes, breakthroughs, and coaching techniques — instantly.", color: "#06B6D4" },
              { icon: <Mail className="w-6 h-6" />, title: "Follow-up emails sent for you", desc: "Personalized, warm, referencing specific moments. Sent automatically.", color: "#10B981" },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Client progress tracked", desc: "Mood, energy, engagement. Patterns surfaced. Nothing falls through cracks.", color: "#F59E0B" },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-5 group-hover:scale-110 transition" style={{ color: item.color }}>{item.icon}</div>
                  <h3 className="cf-heading text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="py-24 relative">
        <div className="cf-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <FadeIn><div className="text-center mb-12">
            <h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">See everything in one place</h2>
            <p className="text-lg" style={{ color: "#94A3B8" }}>Watch a full session lifecycle in 60 seconds</p>
          </div></FadeIn>
          <FadeIn delay={200}><EmbeddedDemo /></FadeIn>
        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="py-24 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-6">Stop doing admin forever</h2>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: "rgba(255,255,255,0.4)" }}>You became a coach to change lives — not to write notes, organize documents, and send follow-ups at night. CoachForge removes the busywork so you can focus fully on your clients.</p>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="grid md:grid-cols-3 gap-8">
              {[{ val: "10+", label: "Hours saved per week", icon: <Clock className="w-5 h-5" /> }, { val: "100%", label: "Follow-up email rate", icon: <Mail className="w-5 h-5" /> }, { val: "2 min", label: "Setup time", icon: <Zap className="w-5 h-5" /> }].map((s, i) => (
                <div key={i} className="p-8 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>{s.icon}</div>
                  <div className="cf-heading text-3xl font-bold text-white mb-1">{s.val}</div>
                  <div className="text-sm" style={{ color: "#94A3B8" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn><div className="text-center mb-12"><h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">Built for coaches.<br />Not generic meeting software.</h2></div></FadeIn>
          <FadeIn delay={150}>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-5 bg-white/[0.03] border-b border-white/[0.06] px-6 py-4">
                <div className="text-sm font-semibold" style={{ color: "#94A3B8" }}>Feature</div>
                <div className="text-sm font-bold text-center" style={{ color: "#2563EB" }}>CoachForge</div>
                <div className="text-sm font-medium text-center" style={{ color: "#94A3B8" }}>Zoom</div>
                <div className="text-sm font-medium text-center" style={{ color: "#94A3B8" }}>Otter</div>
                <div className="text-sm font-medium text-center" style={{ color: "#94A3B8" }}>Notion</div>
              </div>
              {comparisons.map((row, i) => (
                <div key={i} className="grid grid-cols-5 px-6 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition">
                  <div className="text-sm text-white/70">{row.feature}</div>
                  <div className="text-center">{row.cf ? <Check className="w-5 h-5 mx-auto" style={{ color: "#2563EB" }} /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</div>
                  <div className="text-center">{row.zoom ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</div>
                  <div className="text-center">{row.otter ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</div>
                  <div className="text-center">{row.notion ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn><div className="text-center mb-12"><h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">What coaches say</h2></div></FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Mitchell", role: "Executive Coach", quote: "CoachForge saves me over 10 hours every week. I cannot imagine coaching without it. My clients get better follow-ups than I could ever write manually.", initials: "SM" },
              { name: "David Chen", role: "Leadership Coach", quote: "The AI summaries are shockingly good. They capture nuances I would have missed in my own notes. This is the future of coaching.", initials: "DC" },
              { name: "Maria Santos", role: "Life Coach", quote: "My client retention went up 40% since using CoachForge. The automatic follow-ups and accountability nudges make the difference.", initials: "MS" },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(37,99,235,0.2)", color: "#2563EB" }}>{t.initials}</div>
                    <div><div className="text-sm font-semibold text-white">{t.name}</div><div className="text-xs" style={{ color: "#94A3B8" }}>{t.role}</div></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn><div className="text-center mb-12">
            <h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing that scales with you</h2>
            <p className="text-lg" style={{ color: "#94A3B8" }}>Start free. Upgrade when you&apos;re ready.</p>
          </div></FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className={`p-7 rounded-xl border transition-all ${tier.pop ? "border-[#2563EB] ring-1 ring-[#2563EB]/20 scale-[1.02]" : "border-white/[0.06] hover:border-white/[0.1]"}`} style={{ background: tier.pop ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.02)" }}>
                  {tier.pop && <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#2563EB" }}>Most Popular</div>}
                  <h3 className="cf-heading text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm mb-5" style={{ color: "#94A3B8" }}>{tier.desc}</p>
                  <div className="mb-6"><span className="cf-heading text-4xl font-bold">${tier.price}</span><span className="text-sm" style={{ color: "#94A3B8" }}>/mo</span></div>
                  <Link href="/signup" className="block w-full py-3 rounded-lg text-center text-sm font-semibold transition" style={{ background: tier.pop ? "#2563EB" : "rgba(255,255,255,0.05)", color: "white", boxShadow: tier.pop ? "0 8px 32px rgba(37,99,235,0.25)" : "none" }}>{tier.cta}</Link>
                  <div className="mt-6 space-y-3">
                    {tier.feats.map((f, j) => (
                      <div key={j} className="flex items-center gap-2.5 text-sm text-white/60"><Check className="w-4 h-4 flex-shrink-0" style={{ color: tier.pop ? "#2563EB" : "rgba(255,255,255,0.3)" }} />{f}</div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-24 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.2))" }}>
                <span className="cf-heading text-4xl font-bold text-white">EE</span>
              </div>
              <div>
                <h2 className="cf-heading text-3xl font-bold tracking-tight mb-4">Built by coaches, for coaches</h2>
                <p className="leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>CoachForge was created to solve the biggest hidden problem in coaching — admin work draining time, energy, and focus. As a Tony Robbins-trained transformational coach, I experienced this firsthand.</p>
                <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Every feature exists because a real coach needed it. This platform removes the friction so coaches can operate at their highest level — fully present, fully impactful.</p>
                <p className="text-sm mt-4 font-medium" style={{ color: "#94A3B8" }}>— Evan Evans, Founder</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn><h2 className="cf-heading text-3xl font-bold tracking-tight text-center mb-12">Frequently asked questions</h2></FadeIn>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition">
                    <span className="text-sm font-semibold pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} style={{ color: "#94A3B8" }} />
                  </button>
                  {faqOpen === i && <div className="px-5 pb-5"><p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p></div>}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="cf-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <FadeIn>
            <h2 className="cf-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">Run your coaching business<br />like a professional company</h2>
            <p className="text-lg mb-8" style={{ color: "#94A3B8" }}>Start your free trial today. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm" style={{ background: "#2563EB", boxShadow: "0 8px 32px rgba(37,99,235,0.25)" }}>Start Free Trial <ArrowRight className="w-4 h-4" /></Link>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#2563EB" }}><span className="font-bold text-white text-xs">C</span></div>
              <span className="cf-heading font-bold text-sm tracking-tight text-white/70">CoachForge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <a href="#product" className="hover:text-white/60 transition">Product</a>
              <a href="#pricing" className="hover:text-white/60 transition">Pricing</a>
              <a href="#compare" className="hover:text-white/60 transition">Compare</a>
              <Link href="/login" className="hover:text-white/60 transition">Login</Link>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/20">
              <span>Privacy</span><span>Terms</span><span>&copy; {new Date().getFullYear()} CoachForge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
