-- ═══════════════════════════════════════════════
-- CoachForge — Database Schema v1.0
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══ PROFILES ═══
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'coach' CHECK (role IN ('coach', 'admin')),
  timezone TEXT DEFAULT 'UTC',
  coaching_type TEXT,
  brand_color TEXT DEFAULT '#0D7377',
  brand_logo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency')),
  subscription_status TEXT DEFAULT 'active',
  session_count_this_month INTEGER DEFAULT 0,
  team_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ TEAMS ═══
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  max_coaches INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- ═══ CLIENTS ═══
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  coaching_type TEXT,
  goals TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  portal_token TEXT UNIQUE DEFAULT uuid_generate_v4()::text,
  intake_notes TEXT,
  session_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  next_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ SESSIONS ═══
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  session_number INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'processing', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  room_name TEXT,
  room_url TEXT,
  recording_url TEXT,
  audio_storage_path TEXT,
  transcript_raw JSONB,
  transcript_text TEXT,
  summary TEXT,
  summary_structured JSONB,
  mood_score INTEGER CHECK (mood_score IS NULL OR (mood_score BETWEEN 1 AND 100)),
  energy_score INTEGER CHECK (energy_score IS NULL OR (energy_score BETWEEN 1 AND 100)),
  engagement_score INTEGER CHECK (engagement_score IS NULL OR (engagement_score BETWEEN 1 AND 100)),
  breakthrough_flagged BOOLEAN DEFAULT false,
  ai_notes JSONB,
  followup_email_body TEXT,
  followup_email_sent BOOLEAN DEFAULT false,
  followup_email_sent_at TIMESTAMPTZ,
  prep_brief TEXT,
  prep_brief_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ ACTION ITEMS ═══
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  task TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  nudge_sent BOOLEAN DEFAULT false,
  nudge_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ NUDGES ═══
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  action_item_id UUID REFERENCES action_items(id),
  type TEXT CHECK (type IN ('action_reminder', 'check_in', 'encouragement', 'milestone')),
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ CLIENT PROGRESS ═══
CREATE TABLE client_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  session_id UUID REFERENCES sessions(id),
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('mood', 'energy', 'milestone', 'goal_progress', 'note')),
  value INTEGER,
  label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ SUBSCRIPTIONS ═══
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ INDEXES ═══
CREATE INDEX idx_clients_coach ON clients(coach_id);
CREATE INDEX idx_clients_status ON clients(coach_id, status);
CREATE INDEX idx_sessions_coach ON sessions(coach_id);
CREATE INDEX idx_sessions_client ON sessions(client_id);
CREATE INDEX idx_sessions_status ON sessions(coach_id, status);
CREATE INDEX idx_actions_session ON action_items(session_id);
CREATE INDEX idx_actions_client ON action_items(client_id);
CREATE INDEX idx_actions_open ON action_items(client_id, completed) WHERE NOT completed;
CREATE INDEX idx_nudges_scheduled ON nudges(scheduled_for) WHERE NOT sent;
CREATE INDEX idx_progress_client ON client_progress(client_id, date);
CREATE INDEX idx_clients_portal ON clients(portal_token);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients: coaches see only their clients
CREATE POLICY "Coaches own clients" ON clients FOR ALL USING (coach_id = auth.uid());

-- Sessions: coaches see only their sessions
CREATE POLICY "Coaches own sessions" ON sessions FOR ALL USING (coach_id = auth.uid());

-- Action items: scoped to coach
CREATE POLICY "Coaches own actions" ON action_items FOR ALL USING (coach_id = auth.uid());

-- Nudges: coaches see nudges for their clients
CREATE POLICY "Coaches own nudges" ON nudges FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid())
);

-- Progress: coaches see progress for their clients
CREATE POLICY "Coaches own progress" ON client_progress FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid())
);

-- Subscriptions: users see their own
CREATE POLICY "Users own subscriptions" ON subscriptions FOR ALL USING (profile_id = auth.uid());

-- ═══ FUNCTION: Auto-create profile on signup ═══
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══ FUNCTION: Update updated_at timestamp ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
