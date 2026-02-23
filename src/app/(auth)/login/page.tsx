"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-soft flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-teal" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
        <button onClick={() => setMagicLinkSent(false)} className="text-teal text-sm font-medium hover:underline">
          Use a different method
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm">Sign in to your CoachForge account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-teal text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-teal transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleMagicLink} disabled={loading}
        className="w-full py-3 rounded-xl bg-teal-soft text-teal font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-medium transition"
      >
        <Mail className="w-4 h-4" /> Sign in with Magic Link
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link href="/signup" className="text-teal font-semibold hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}
