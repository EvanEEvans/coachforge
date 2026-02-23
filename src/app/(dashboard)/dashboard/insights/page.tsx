"use client";
import { BarChart3, Lock } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-teal-soft flex items-center justify-center mx-auto mb-6">
        <BarChart3 className="w-7 h-7 text-teal" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">Coaching Insights</h2>
      <p className="text-stone-500 mb-4">Cross-session patterns, engagement trends, breakthrough frequency, and risk flags — all powered by AI.</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-500 text-sm font-medium">
        <Lock className="w-3.5 h-3.5" /> Available on Pro plan
      </div>
    </div>
  );
}
