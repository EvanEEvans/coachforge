"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Target, Clock, Zap, TrendingUp } from "lucide-react";

export default function PortalPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/${token}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-teal animate-spin" />
    </div>
  );

  if (!data?.client) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center"><p className="font-display text-xl font-bold mb-2">Portal not found</p><p className="text-stone-400 text-sm">This link may have expired or is invalid.</p></div>
    </div>
  );

  const { client, sessions, actions, coach } = data;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="grain" />
      <header className="py-6 px-8 border-b border-stone-100 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Your Coaching Portal</p>
            <h1 className="font-display text-xl font-bold">{client.full_name}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Coach: {coach?.full_name}</p>
            <p className="text-xs text-stone-400">{client.session_count} sessions · {client.current_streak} week streak 🔥</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        {/* Goals */}
        {client.goals?.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-teal" /> Your Goals</h2>
            <div className="space-y-2">{client.goals.map((g: string, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm"><Target className="w-3.5 h-3.5 text-teal shrink-0" /> {g}</div>
            ))}</div>
          </div>
        )}

        {/* Open Actions */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-teal" /> Action Items</h2>
          {actions?.length > 0 ? (
            <div className="space-y-3">{actions.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 ${a.completed ? "bg-teal border-teal" : "border-stone-300"} flex items-center justify-center`}>
                  {a.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${a.completed ? "line-through text-stone-400" : ""}`}>{a.task}</p>
                  {a.due_date && <p className="text-xs text-stone-400 mt-0.5">{a.due_date}</p>}
                </div>
              </div>
            ))}</div>
          ) : <p className="text-sm text-stone-400">All caught up! 🎉</p>}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-teal" /> Session History</h2>
          {sessions?.length > 0 ? (
            <div className="space-y-4">{sessions.map((s: any) => (
              <div key={s.id} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Session #{s.session_number}</span>
                  <span className="text-xs text-stone-400">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                {s.summary && <p className="text-sm text-stone-500 leading-relaxed">{s.summary}</p>}
                {s.breakthrough_flagged && <span className="inline-flex items-center gap-1 text-xs text-terra font-semibold mt-2"><Zap className="w-3 h-3" /> Breakthrough moment</span>}
              </div>
            ))}</div>
          ) : <p className="text-sm text-stone-400">No sessions yet.</p>}
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-stone-400">
        Powered by <span className="font-semibold">CoachForge</span> · coachforge.pro
      </footer>
    </div>
  );
}
