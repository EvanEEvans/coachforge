"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, ArrowDown, Video, Mic, MicOff, Phone, Brain,
  Mail, Check, X, ChevronDown, Shield, Zap, Users, Clock, BarChart3,
  FileText, Heart, Briefcase, Target, Compass, Sun, Send
} from "lucide-react";

/* ═══ HOOKS ═══ */
function useReveal(threshold = 0.12) {
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

function useCounter(end: number, duration = 2000) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, end, duration]);
  return [ref, val] as const;
}

/* ═══ SECTION WRAPPER ═══ */
function Section({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  const [ref, visible] = useReveal(0.06);
  return (
    <section ref={ref} id={id} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-4">
      <div className="w-5 h-[1.5px] bg-teal rounded" />
      <span className="text-xs font-bold tracking-[1.5px] uppercase text-teal font-mono">{children}</span>
      <div className="w-5 h-[1.5px] bg-teal rounded" />
    </div>
  );
}

function AnimStat({ end, suffix = "", prefix = "", label }: { end: number; suffix?: string; prefix?: string; label: string }) {
  const [ref, val] = useCounter(end);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl md:text-4xl font-extrabold text-teal leading-none">{prefix}{val}{suffix}</div>
      <div className="text-xs text-stone-400 mt-1.5">{label}</div>
    </div>
  );
}

/* ═══ INTERACTIVE DEMO ═══ */
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
    <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden relative">
      {/* Step indicator */}
      <div className="flex items-center px-6 py-3 bg-stone-50 border-b border-stone-100 gap-1.5">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${i <= step ? "bg-teal text-white" : "bg-stone-200 text-stone-400"} ${i === step ? "ring-4 ring-teal/15" : ""}`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${i === step ? "font-semibold text-teal" : "text-stone-400"}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-teal" : "bg-stone-200"} transition-all`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Dashboard */}
      {step === 0 && (
        <div className="p-7 animate-scale-in">
          <div className="mb-6">
            <h3 className="font-display text-xl font-bold">Good morning, Coach</h3>
            <p className="text-sm text-stone-400">Sarah Mitchell's session is ready</p>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[["5", "Clients", "text-teal bg-teal-soft"], ["12", "This Week", "text-blue-600 bg-blue-50"], ["60%", "Progress", "text-green-600 bg-green-50"], ["14h", "Saved", "text-terra bg-terra-soft"]].map(([v, l, c], i) => (
              <div key={i} className={`p-4 rounded-2xl text-center border border-stone-100 animate-fade-up`} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`font-display text-xl font-extrabold ${c.split(" ")[0]}`}>{v}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-gradient-to-br from-teal-soft to-teal-soft/40 rounded-2xl flex items-center justify-between border border-teal/10 flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold">SM</div>
              <div>
                <div className="font-semibold">Sarah Mitchell</div>
                <div className="text-xs text-stone-400">Session #13 · Career Coaching</div>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
              <Video className="w-4 h-4" /> Start Session
            </button>
          </div>
          <p className="text-center mt-4 text-xs text-teal font-medium animate-breathe">👆 Click "Start Session" to begin the demo</p>
        </div>
      )}

      {/* Step 1: Live Session */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wide">Live</span>
              <span className="font-mono text-sm">{fmt(dur)}</span>
            </div>
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">AI Transcribing</span>
          </div>
          <div className="grid grid-cols-[1fr_260px] min-h-[320px]">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                {[["You", "EV", "teal"], ["Sarah", "SM", "teal-light"]].map(([name, ini], i) => (
                  <div key={i} className="bg-gradient-to-b from-stone-50 to-stone-100/40 rounded-2xl flex flex-col items-center justify-center min-h-[130px] border border-stone-100 relative">
                    <div className="w-12 h-12 rounded-full bg-teal-soft text-teal flex items-center justify-center text-sm font-bold">{ini}</div>
                    <div className="text-sm font-semibold mt-2">{name}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3">
                <button className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"><Mic className="w-[18px] h-[18px]" /></button>
                <button className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"><Video className="w-[18px] h-[18px]" /></button>
                <button onClick={() => setStep(2)} className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30"><Phone className="w-[18px] h-[18px]" /></button>
              </div>
              <p className="text-center mt-3 text-[11px] text-teal font-medium">Watch the transcript, then click 🔴 to end</p>
            </div>
            <div className="border-l border-stone-100 flex flex-col">
              <div className="px-4 py-2.5 border-b border-stone-50 flex items-center gap-2 text-xs font-semibold">
                <BarChart3 className="w-3.5 h-3.5 text-teal" /> Live Transcript
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 max-h-[240px]">
                {live.length === 0 && <p className="text-center text-stone-400 text-xs mt-8 animate-breathe">Listening...</p>}
                {live.map((l, i) => (
                  <div key={i} className="mb-3.5 animate-slide-up">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${l.who === "Coach" ? "text-teal" : "text-terra"}`}>{l.who}</span>
                      <span className="text-[9px] text-stone-400 font-mono">{l.t}</span>
                    </div>
                    <p className="text-[12px] text-stone-500 leading-relaxed">{l.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="p-12 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full border-[3px] border-stone-200 border-t-teal animate-spin mx-auto mb-6" />
          <h3 className="font-display text-xl font-bold mb-1.5">Processing your session...</h3>
          <p className="text-stone-400 text-sm mb-8">Takes ~3 min. We'll fast-forward.</p>
          <div className="inline-flex flex-col gap-2.5 text-left">
            {["Transcribing audio", "Generating summary", "Extracting action items", "Drafting follow-up email", "Updating client progress", "Scheduling nudges"].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${i <= procStep ? "bg-green-50 text-green-500" : "bg-stone-100 text-stone-400"}`}>
                  {i <= procStep ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
                <span className={`text-sm ${i <= procStep ? "font-medium text-stone-800" : "text-stone-400"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div className="p-6 animate-scale-in">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold"><Check className="w-3 h-3" /> Complete</span>
            <span className="text-xs text-stone-400">Session with Sarah Mitchell · 45 min</span>
          </div>

          <div className="p-5 bg-gradient-to-br from-stone-50 to-teal-soft/30 rounded-2xl mb-4 border border-teal/5">
            <div className="text-xs font-bold text-teal mb-2">📝 AI SESSION SUMMARY</div>
            <p className="text-[13px] text-stone-500 leading-relaxed">Sarah reported a successful conversation with her manager about the team lead promotion. Her manager encouraged her to apply for a March opening. We identified imposter syndrome as the primary barrier and began a confidence anchoring exercise. Key breakthrough: Sarah recognized her manager's encouragement is direct evidence of her capability.</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-xs font-bold mb-3">✅ ACTION ITEMS</div>
              {[
                { task: "Complete confidence anchoring journal — daily for 1 week", due: "Feb 27" },
                { task: "Draft internal application for team lead", due: "Mar 1" },
                { task: "List 5 accomplishments with measurable impact", due: "Feb 22" },
              ].map((a, i) => (
                <div key={i} className="flex gap-2 mb-2.5">
                  <div className="w-4 h-4 rounded border-2 border-teal/30 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-medium leading-snug">{a.task}</p>
                    <p className="text-[10px] text-stone-400">{a.due}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold">📧 FOLLOW-UP EMAIL</div>
                <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Auto-Sent</span>
              </div>
              <p className="text-[11px] text-stone-400 mb-2">To: sarah.mitchell@email.com</p>
              <p className="text-[12px] text-stone-500">"Hi Sarah, What a powerful session today!..."</p>
              <p className="text-[11px] text-stone-400 italic mt-2">Includes: summary, actions, encouragement, portal link</p>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="font-display text-lg font-bold mb-1.5">Session over. Everything done. You wrote nothing.</p>
            <p className="text-sm text-stone-400 mb-5">Sarah already has her email. You're free.</p>
            <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">
              Replay Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ PRICING ═══ */
const tiers = [
  { name: "Free", price: "0", period: "forever", desc: "Try it with real clients", feats: ["2 sessions/month", "AI session summaries", "Basic action items", "1 client", "Email support"], cta: "Start Free", pop: false },
  { name: "Starter", price: "49", period: "/mo", desc: "Drop the admin. Keep the magic.", feats: ["15 sessions/month", "Full AI outputs", "Auto follow-up emails", "Session Prep Briefs", "15 clients", "Email + chat support"], cta: "Get Started", pop: false },
  { name: "Pro", price: "97", period: "/mo", desc: "The complete coaching OS.", feats: ["40 sessions/month", "Everything in Starter", "Client Progress Dashboard", "Branded Client Portal", "Transformation Reports", "Accountability Nudges", "Custom branding", "Priority support"], cta: "Go Pro", pop: true },
  { name: "Agency", price: "197", period: "/mo", desc: "Scale to a coaching business.", feats: ["Unlimited sessions", "Everything in Pro", "Multi-coach (up to 5)", "Team dashboard", "Content Engine", "White-label option", "Dedicated success manager"], cta: "Scale Now", pop: false },
];

const faqs = [
  { q: "Won't the AI emails sound robotic?", a: "No. CoachForge builds emails from your actual session — the words your client used, the emotions they expressed, the commitments they made. Clients consistently rate them as warm and personal." },
  { q: "I'm not technical. Is this complicated?", a: "If you can click a button and have a conversation, you can use CoachForge. Client joins via a link. You hit End Session when you're done. No software to install, no configuration." },
  { q: "What about client confidentiality?", a: "End-to-end encrypted. Transcripts are private to your account. Client data is never used to train AI models. We're building toward HIPAA compliance." },
  { q: "Can I try it before paying?", a: "Yes. The Free tier gives you 2 sessions per month, forever, with no credit card required." },
  { q: "What if my client doesn't want to be recorded?", a: "Consent is built into the flow. When your client joins, they see a clear notice. They can opt out. Transparency is non-negotiable." },
  { q: "How is this different from Fathom or Otter?", a: "Those are general meeting tools. CoachForge is built specifically for coaching — action items with accountability, client portals, progress tracking, re-enrollment reports, prep briefs." },
];

/* ═══ MAIN PAGE ═══ */
export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="bg-brand-bg overflow-x-hidden">
      <div className="grain" />

      {/* NAV */}
      <nav className={`flex justify-between items-center px-8 max-w-[1200px] mx-auto sticky top-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-brand-bg/85 backdrop-blur-xl border-b border-stone-100 rounded-b-2xl" : "py-5"}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-teal flex items-center justify-center shadow-teal">
            <span className="font-display font-black text-white text-base">C</span>
          </div>
          <span className="font-display text-xl font-bold -tracking-wide">CoachForge</span>
        </Link>
        <div className="flex gap-6 items-center">
          {["Demo", "Features", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-stone-500 hover:text-teal transition font-medium">{l}</a>
          ))}
          <Link href="/login" className="text-sm text-stone-500 hover:text-teal transition font-medium">Log in</Link>
          <Link href="/signup" className="px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition">Start Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-16 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-teal-soft/60 via-transparent to-transparent pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(230,244,244,0.6), transparent)" }} />
        <div className="max-w-[760px] mx-auto text-center relative z-10">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-soft text-teal text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Coaching Platform
            </span>
          </div>
          <h1 className="font-display text-[clamp(38px,5.5vw,62px)] font-black leading-[1.08] -tracking-wider mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Hang up the call.<br />
            <span className="text-teal relative">
              Everything else is done.
              <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-teal/30 to-transparent rounded-full" />
            </span>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-[580px] mx-auto mb-9 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            CoachForge records, transcribes, and generates session summaries, action items, and follow-up emails — automatically. Be fully present. Never write a note again.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap mb-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <a href="#demo" className="flex items-center gap-2 px-9 py-4 rounded-2xl bg-teal text-white text-base font-semibold hover:shadow-teal transition">
              <ArrowDown className="w-4 h-4" /> Try the Interactive Demo
            </a>
            <a href="#pricing" className="flex items-center gap-2 px-7 py-4 rounded-2xl border-[1.5px] border-stone-200 text-stone-700 text-base font-semibold hover:border-teal hover:text-teal transition">
              View Pricing
            </a>
          </div>
          <p className="text-xs text-stone-400 animate-fade-up" style={{ animationDelay: "0.5s" }}>Free forever · No credit card · 2 sessions/month</p>
        </div>
      </section>

      {/* LOGO BAR + STATS */}
      <Section className="bg-brand-bg-warm py-12 px-8">
        <div className="max-w-[900px] mx-auto">
          <p className="text-center text-xs text-stone-400 font-medium tracking-wide uppercase mb-6">Trusted by coaches at</p>
          <div className="flex justify-center gap-10 flex-wrap mb-10 opacity-30">
            {["Tony Robbins Research", "BetterUp", "ICF Certified", "Noomii", "Coach.me", "Satori"].map(n => (
              <span key={n} className="font-display text-base font-bold -tracking-wide whitespace-nowrap">{n}</span>
            ))}
          </div>
          <div className="flex justify-center gap-16 flex-wrap">
            <AnimStat end={2} suffix="+ hrs" label="saved per client/week" />
            <AnimStat end={3} prefix="< " suffix=" min" label="post-session delivery" />
            <AnimStat end={93} suffix="%" label="client retention rate" />
            <AnimStat end={49} suffix="/5" label="coach satisfaction" />
          </div>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="py-24 px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide leading-tight mb-5">You didn't become a coach<br />to write session notes at 9pm</h2>
          <p className="text-lg text-stone-500 leading-relaxed mb-10">Every session generates 30–60 minutes of admin — notes, emails, follow-ups, spreadsheet updates. The admin isn't just costing you time — it's costing you presence, reputation, and revenue.</p>
          <div className="grid grid-cols-3 gap-4">
            {[["10+", "hrs/week", "spent on session admin", "text-terra"], ["48", "hours", "avg. follow-up delay", "text-red-500"], ["$6K+", "/ month", "in lost billable time", "text-blue-600"]].map(([v, u, l, c], i) => (
              <div key={i} className="bg-white rounded-2xl p-5 text-center border border-stone-100 shadow-soft">
                <div className={`font-display text-3xl font-black leading-none ${c}`}>{v}</div>
                <div className={`text-sm font-semibold opacity-70 mt-0.5 ${c}`}>{u}</div>
                <div className="text-xs text-stone-400 mt-2">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* BEFORE / AFTER */}
      <Section className="bg-brand-bg-soft py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Before vs After</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">The old way vs. the CoachForge way</h2>
          </div>
          <div className="grid grid-cols-[1fr_56px_1fr] gap-0 items-start">
            <div className="bg-white rounded-2xl p-7 border border-stone-200 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><X className="w-4 h-4" /></div>
                <span className="font-display text-lg font-bold text-red-500">Without CoachForge</span>
              </div>
              {["Frantically scribble notes during session", "Spend 45 min writing up session summary", "Forget to send follow-up email (or send it 2 days late)", "Can't remember what client said last week", "Manually track goals in a spreadsheet", "Lose clients because follow-through feels weak", "Work until 9pm catching up on admin", "Re-enrollment conversations feel awkward"].map((item, i) => (
                <div key={i} className="flex gap-2.5 mb-3 items-start">
                  <div className="w-[18px] h-[18px] rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><span className="text-red-500 text-[10px]">✕</span></div>
                  <span className="text-sm text-stone-500 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center h-full pt-16">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white shadow-teal">
                <ArrowRight className="w-[18px] h-[18px]" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-teal/20 shadow-teal">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><Check className="w-4 h-4" /></div>
                <span className="font-display text-lg font-bold text-teal">With CoachForge</span>
              </div>
              {["Be 100% present — AI captures everything", "Full session summary ready in under 3 minutes", "Client gets a warm follow-up email immediately", "Prep brief before every session — always know context", "Progress dashboard tracks goals automatically", "Clients feel held and seen between sessions", "Session ends → you're done. Evening is yours.", "Transformation Reports make re-enrollment effortless"].map((item, i) => (
                <div key={i} className="flex gap-2.5 mb-3 items-start">
                  <div className="w-[18px] h-[18px] rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-[10px] h-[10px] text-green-600" /></div>
                  <span className="text-sm text-stone-500 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* DEMO */}
      <Section id="demo" className="py-24 px-8 bg-gradient-to-b from-teal-soft to-brand-bg">
        <div className="max-w-[860px] mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>Interactive Demo</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide mb-2.5">See it work. Right now.</h2>
            <p className="text-stone-500">Click through a real coaching session and watch the AI handle everything after.</p>
          </div>
          <EmbeddedDemo />
          <div className="mt-8 text-center p-8 bg-white rounded-2xl shadow-medium border border-stone-100">
            <p className="font-display text-xl font-bold mb-2">Imagine that after every single session.</p>
            <p className="text-stone-500 text-sm mb-5">No notes. No typing. No follow-up emails to write. Just coaching — and then freedom.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-semibold hover:shadow-teal transition">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="py-24 px-8">
        <div className="max-w-[880px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">Four steps. Two minutes to start.</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { n: "01", t: "Start", d: "Click a button. Your client joins via a simple link.", icon: Zap, color: "text-teal bg-teal-soft" },
              { n: "02", t: "Coach", d: "AI transcribes in real-time. You stay fully present.", icon: Mic, color: "text-terra bg-terra-soft" },
              { n: "03", t: "Hang up", d: "Walk away. The AI generates everything in < 3 min.", icon: Brain, color: "text-purple-600 bg-purple-50" },
              { n: "04", t: "Done", d: "Client gets a warm email, action items, and portal access.", icon: Mail, color: "text-green-600 bg-green-50" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all">
                <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3.5`}><s.icon className="w-5 h-5" /></div>
                <div className="font-mono text-xs font-semibold text-teal mb-1.5 tracking-wide">{s.n}</div>
                <div className="font-display text-lg font-bold mb-2">{s.t}</div>
                <p className="text-[13px] text-stone-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHO IT'S FOR */}
      <Section className="py-24 px-8 bg-teal-soft">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Who It's For</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">Built for every kind of coach</h2>
            <p className="text-stone-500 mt-2">If you have conversations that change lives, CoachForge is for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Briefcase, t: "Executive Coaches", d: "Corporate clients expect polished follow-ups. CoachForge delivers boardroom-quality recaps.", color: "text-teal" },
              { icon: Heart, t: "Life & Relationship Coaches", d: "Emotional sessions need careful handling. The AI captures nuance and breakthroughs.", color: "text-terra" },
              { icon: Target, t: "Career & Business Coaches", d: "Track goals, milestones, and accountability. Transformation Reports write the success story.", color: "text-blue-600" },
              { icon: Sun, t: "Health & Wellness Coaches", d: "Monitor energy, mood patterns, and habit streaks. The progress dashboard speaks for itself.", color: "text-green-600" },
              { icon: Compass, t: "Faith-Based Coaches", d: "Ministry requires deep presence. Stop splitting attention between listening and note-taking.", color: "text-purple-600" },
              { icon: Users, t: "Group Facilitators", d: "Captures every voice, identifies individual breakthroughs, and generates personalized follow-ups.", color: "text-amber-600" },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all">
                <div className={`w-11 h-11 rounded-xl bg-stone-50 flex items-center justify-center mb-4 ${c.color}`}><c.icon className="w-5 h-5" /></div>
                <div className="font-display text-base font-bold mb-2">{c.t}</div>
                <p className="text-sm text-stone-500 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features" className="py-24 px-8 bg-brand-bg-peach">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Features</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">Everything a coaching practice needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Video, t: "Built-in Video Calls", d: "Client joins via link. No downloads. Real-time AI transcription." },
              { icon: Zap, t: "Instant Session Outputs", d: "Summaries, action items, and follow-up emails within 3 minutes." },
              { icon: Mail, t: "Auto Follow-Up Emails", d: "Warm, personal emails sent immediately. They sound like you." },
              { icon: FileText, t: "Session Prep Briefs", d: "One-page recap before every session — always know the context." },
              { icon: Users, t: "Client Progress Dashboard", d: "Visual timeline of goals, milestones, moods, and streaks." },
              { icon: Brain, t: "Coaching Insights AI", d: "Patterns across sessions — engagement trends, breakthroughs, flags." },
              { icon: BarChart3, t: "Transformation Reports", d: "One-click PDF of a client's journey. The best re-enrollment tool." },
              { icon: Shield, t: "Accountability Nudges", d: "Automated check-ins between sessions based on commitments." },
              { icon: Sparkles, t: "Branded Client Portal", d: "Each client gets their own portal with your brand." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-soft to-teal-soft/50 flex items-center justify-center text-teal mb-4"><f.icon className="w-5 h-5" /></div>
                <div className="font-display text-base font-bold mb-2">{f.t}</div>
                <p className="text-sm text-stone-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="py-24 px-8">
        <div className="max-w-[1040px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">What coaches are saying</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: "Dr. Lisa Park", r: "Executive Coach · 8 years", q: "I was spending 90 minutes a day on notes. Now I hang up and my client has a better recap than I could've written.", ini: "LP", c: "border-t-teal" },
              { n: "Marcus Johnson", r: "Business Coach · $25K/mo", q: "A client was about to leave. I sent her a Transformation Report — she re-enrolled for another year. That one click saved $15,000.", ini: "MJ", c: "border-t-terra" },
              { n: "Elena Torres", r: "Life Coach & Facilitator", q: "I run group workshops and 1-on-1s. The AI catches everything — who had the breakthrough, who's struggling. I'm a better coach now.", ini: "ET", c: "border-t-purple-500" },
              { n: "Rev. David Kim", r: "Faith-Based Coach · 12 years", q: "CoachForge lets me be more present with people, not less. My congregants feel more heard because I'm not distracted by note-taking.", ini: "DK", c: "border-t-amber-500" },
              { n: "Priya Sharma", r: "Health & Wellness Coach", q: "When clients see their mood trending upward over 8 weeks, they don't need me to convince them the work is working.", ini: "PS", c: "border-t-green-500" },
              { n: "James Wright", r: "Career Coach · Solo Practice", q: "I went from 12 clients to 20 without hiring an assistant. My wife noticed the difference before my clients did.", ini: "JW", c: "border-t-blue-500" },
            ].map((t, i) => (
              <div key={i} className={`bg-white rounded-2xl p-7 border border-stone-100 shadow-soft border-t-4 ${t.c} hover:shadow-medium transition relative`}>
                <div className="absolute top-5 right-6 font-display text-5xl font-black text-stone-100 leading-none">"</div>
                <div className="flex gap-1 mb-4 text-amber-400">{[1,2,3,4,5].map(s => <span key={s} className="text-sm">★</span>)}</div>
                <p className="text-[15px] text-stone-500 leading-relaxed mb-5 relative z-10">"{t.q}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">{t.ini}</div>
                  <div><div className="text-sm font-semibold">{t.n}</div><div className="text-xs text-stone-400">{t.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="py-24 px-8 bg-brand-bg-warm">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">Simple, transparent pricing</h2>
            <p className="text-stone-500 mt-2">Start free. Upgrade when CoachForge pays for itself — usually week one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((t, i) => (
              <div key={i} className={`rounded-3xl p-7 flex flex-col relative transition-all hover:-translate-y-1 ${t.pop ? "bg-gradient-to-b from-teal to-teal-dark text-white shadow-xl hover:shadow-2xl scale-[1.01]" : "bg-white border border-stone-100 shadow-soft hover:shadow-medium"}`}>
                {t.pop && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-terra to-terra-light text-white px-5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg">Most Popular</div>}
                <div className={`text-xs font-semibold tracking-wider uppercase font-mono mb-2.5 ${t.pop ? "text-white/50" : "text-stone-400"}`}>{t.name}</div>
                <div className="flex items-baseline gap-0.5 mb-1"><span className="font-display text-5xl font-black leading-none">${t.price}</span><span className={`text-sm ${t.pop ? "text-white/50" : "text-stone-400"}`}>{t.period}</span></div>
                <p className={`text-sm italic mb-6 ${t.pop ? "text-white/60" : "text-stone-400"}`}>{t.desc}</p>
                <div className="flex flex-col gap-2.5 mb-7 flex-1">
                  {t.feats.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-[13px] ${t.pop ? "text-white/85" : "text-stone-600"}`}>
                      <Check className={`w-3.5 h-3.5 shrink-0 ${t.pop ? "text-white/60" : "text-green-500"}`} /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/signup" className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition ${t.pop ? "bg-white text-teal hover:shadow-xl" : "bg-teal-soft text-teal hover:shadow-medium"}`}>{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-24 px-8">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-12"><SectionLabel>FAQ</SectionLabel><h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-extrabold -tracking-wide">Common questions</h2></div>
          {faqs.map((item, i) => (
            <div key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="cursor-pointer mb-2.5">
              <div className={`p-5 bg-white rounded-2xl border transition-all ${faqOpen === i ? "border-teal/30 shadow-medium" : "border-stone-100 shadow-soft"}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold transition ${faqOpen === i ? "text-teal" : ""}`}>{item.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all ${faqOpen === i ? "bg-teal-soft text-teal rotate-180" : "bg-stone-100 text-stone-400"}`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
                {faqOpen === i && <p className="text-[15px] text-stone-500 leading-relaxed mt-4 pt-4 border-t border-stone-100 animate-slide-up">{item.a}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TRUST */}
      <Section className="py-11 px-8 bg-brand-bg-sage">
        <div className="flex justify-center gap-11 flex-wrap max-w-[900px] mx-auto">
          {[
            { icon: Shield, label: "End-to-End Encrypted" },
            { icon: Zap, label: "Live in 2 Minutes" },
            { icon: Users, label: "Built for Coaches" },
            { icon: Check, label: "14-Day Money Back" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-soft flex items-center justify-center text-teal"><item.icon className="w-5 h-5" /></div>
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-teal to-teal-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.3), transparent)" }} />
        <div className="max-w-[640px] mx-auto text-center text-white relative z-10">
          <h2 className="font-display text-[clamp(28px,4vw,42px)] font-extrabold leading-tight mb-4">Ready to get your<br />evenings back?</h2>
          <p className="text-lg opacity-75 leading-relaxed mb-9">Try one session. Hang up. Watch the AI do in 3 minutes what used to take you an hour. Then decide.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-teal text-lg font-semibold hover:shadow-2xl transition">
            Start Free — No Credit Card <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs opacity-40 mt-5">Free forever · 2 sessions/month · Upgrade anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-bg-dark text-white/50 pt-16 pb-8 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center"><span className="font-display font-black text-white text-base">C</span></div>
                <span className="font-display text-xl font-bold text-white -tracking-wide">CoachForge</span>
              </div>
              <p className="text-sm leading-relaxed mb-5 max-w-[280px]">The AI-powered coaching platform that handles your admin so you can focus on what matters — your clients.</p>
              <p className="text-xs font-semibold text-white/70 mb-2.5">Stay in the loop</p>
              <div className="flex gap-2">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal" />
                <button className="px-4 py-2.5 rounded-lg bg-teal text-white"><Send className="w-4 h-4" /></button>
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Demo", "Roadmap", "Changelog"] },
              { title: "Resources", links: ["Blog", "Help Center", "API Docs", "Community", "Templates"] },
              { title: "Company", links: ["About", "Careers", "Privacy", "Terms", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <div className="text-xs font-bold text-white/70 tracking-wider uppercase mb-4">{col.title}</div>
                {col.links.map(l => <div key={l} className="text-sm mb-2.5 cursor-pointer hover:text-white transition">{l}</div>)}
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex justify-between items-center flex-wrap gap-4">
            <div className="text-xs">An AIONIQS Product · © 2026 CoachForge. All rights reserved.</div>
            <div className="flex gap-3">
              {["Twitter", "LinkedIn", "YouTube", "Instagram"].map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
