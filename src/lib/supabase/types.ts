export type SubscriptionTier = "free" | "starter" | "pro" | "agency";
export type CoachingType = "executive" | "life" | "career" | "health" | "faith" | "group" | "other";
export type SessionStatus = "scheduled" | "in_progress" | "processing" | "completed" | "cancelled";
export type ClientStatus = "active" | "paused" | "completed" | "archived";
export type Priority = "high" | "medium" | "low";
export type NudgeType = "action_reminder" | "check_in" | "encouragement" | "milestone";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "coach" | "admin";
  timezone: string;
  coaching_type: CoachingType | null;
  brand_color: string;
  brand_logo_url: string | null;
  onboarding_completed: boolean;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  session_count_this_month: number;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  coach_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  coaching_type: CoachingType | null;
  goals: string[];
  status: ClientStatus;
  portal_token: string;
  intake_notes: string | null;
  session_count: number;
  current_streak: number;
  last_session_at: string | null;
  next_session_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  coach_id: string;
  client_id: string;
  session_number: number;
  status: SessionStatus;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  room_name: string | null;
  room_url: string | null;
  recording_url: string | null;
  audio_storage_path: string | null;
  transcript_raw: TranscriptEntry[] | null;
  transcript_text: string | null;
  summary: string | null;
  summary_structured: SessionSummaryStructured | null;
  mood_score: number | null;
  energy_score: number | null;
  engagement_score: number | null;
  breakthrough_flagged: boolean;
  ai_notes: any | null;
  followup_email_body: string | null;
  followup_email_sent: boolean;
  followup_email_sent_at: string | null;
  prep_brief: string | null;
  prep_brief_generated_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
}

export interface TranscriptEntry {
  timestamp: string;
  speaker: "coach" | "client";
  text: string;
}

export interface SessionSummaryStructured {
  overview: string;
  key_themes: string[];
  breakthroughs: string[];
  concerns: string[];
  coaching_techniques_used: string[];
}

export interface ActionItem {
  id: string;
  session_id: string;
  client_id: string;
  coach_id: string;
  task: string;
  priority: Priority;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  nudge_sent: boolean;
  nudge_sent_at: string | null;
  created_at: string;
}

export interface Nudge {
  id: string;
  client_id: string;
  action_item_id: string | null;
  type: NudgeType;
  message: string;
  channel: "email" | "sms";
  scheduled_for: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface ClientProgress {
  id: string;
  client_id: string;
  session_id: string | null;
  date: string;
  type: "mood" | "energy" | "milestone" | "goal_progress" | "note";
  value: number | null;
  label: string | null;
  notes: string | null;
  created_at: string;
}
