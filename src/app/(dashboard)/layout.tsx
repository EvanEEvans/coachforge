"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard, Users, Video, Settings, LogOut, CreditCard,
  ChevronRight, BarChart3, Bell, Plus, Loader2, Palette
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils/constants";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/sessions", icon: Video, label: "Sessions" },
  { href: "/dashboard/insights", icon: BarChart3, label: "Insights" },
];

const NAV_BOTTOM = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/settings/billing", icon: CreditCard, label: "Billing" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      let { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

        // If profile doesnt exist yet (race condition after signup), create it
        if (!prof) {
          const { data: newProf } = await supabase
            .from("profiles")
            .insert({ id: user.id, email: user.email })
            .select()
            .single();
          prof = newProf;
        }

      if (prof) {
        setProfile(prof);
        if (!prof.onboarding_completed) {
          router.push("/onboarding");
          return;
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal animate-spin" />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="p-5 border-b border-gray-50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-teal flex items-center justify-center shadow-teal">
              <span className="font-display font-black text-white text-sm">C</span>
            </div>
            <span className="font-display text-lg font-bold -tracking-wide">CoachForge</span>
          </Link>
        </div>

        {/* Quick action */}
        <div className="p-4">
          <Link
            href="/dashboard/sessions?new=true"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition"
          >
            <Plus className="w-4 h-4" /> New Session
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link",
                isActive(item.href) && "active"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-2 space-y-1 border-t border-gray-50 pt-2">
          {NAV_BOTTOM.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link", isActive(item.href) && "active")}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="sidebar-link w-full text-gray-400 hover:text-red-500 hover:bg-red-50">
            <LogOut className="w-[18px] h-[18px]" />
            <span>Log out</span>
          </button>
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
              {profile ? getInitials(profile.full_name) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{profile?.subscription_tier} plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-brand-bg/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="font-display text-xl font-bold capitalize">
                {pathname === "/dashboard" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ")}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-teal hover:border-teal/20 transition">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
