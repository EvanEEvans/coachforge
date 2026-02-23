import { SubscriptionTier } from "@/lib/supabase/types";

export const APP_NAME = "CoachForge";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const APP_DOMAIN = "coachforge.pro";

export const COACHING_TYPES = [
  { value: "executive", label: "Executive Coaching" },
  { value: "life", label: "Life Coaching" },
  { value: "career", label: "Career Coaching" },
  { value: "health", label: "Health & Wellness" },
  { value: "faith", label: "Faith-Based Coaching" },
  { value: "group", label: "Group Facilitation" },
  { value: "other", label: "Other" },
] as const;

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
}

export function formatRelative(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function tierBadgeColor(tier: SubscriptionTier) {
  const colors = {
    free: "bg-gray-100 text-gray-600",
    starter: "bg-blue-50 text-blue-600",
    pro: "bg-teal-soft text-teal",
    agency: "bg-terra-soft text-terra",
  };
  return colors[tier];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
