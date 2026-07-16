-- =============================================
-- CAMPUSPULSE DATABASE SCHEMA
-- =============================================
-- Run this SQL in Supabase SQL Editor
-- This creates all tables, views, and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
-- Extends Supabase auth.users with app-specific data

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'club_admin', 'admin')),
  student_id TEXT,
  branch TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 5),
  total_points INTEGER DEFAULT 0,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. CLUBS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  category TEXT,
  email TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  admin_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. EVENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image_url TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  venue TEXT,
  category TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  points INTEGER DEFAULT 10,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ,
  requirements TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. REGISTRATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist')),
  qr_token TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- =============================================
-- 5. ATTENDANCE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0,
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. BADGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  icon_url TEXT,
  category TEXT,
  points_required INTEGER,
  events_required INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. USER BADGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  event_id UUID REFERENCES public.events(id),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- 8. NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. REMINDERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'push',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. LEADERBOARD VIEW
-- =============================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.branch,
  p.year,
  p.total_points,
  RANK() OVER (ORDER BY p.total_points DESC) as rank,
  (SELECT COUNT(*) FROM public.attendance a WHERE a.user_id = p.id) as events_attended,
  (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = p.id) as badges_count
FROM public.profiles p
WHERE p.is_active = true
ORDER BY p.total_points DESC;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CLUBS POLICIES
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Club admins can update their clubs" ON public.clubs
  FOR UPDATE USING (auth.uid() = ANY(admin_ids));

-- EVENTS POLICIES
CREATE POLICY "Active events are viewable by everyone" ON public.events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Club admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clubs c
      WHERE c.id = events.club_id
      AND auth.uid() = ANY(c.admin_ids)
    )
  );

-- REGISTRATIONS POLICIES
CREATE POLICY "Users can view own registrations" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations" ON public.registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- ATTENDANCE POLICIES
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'club_admin')
    )
  );

-- BADGES POLICIES
CREATE POLICY "Badges are viewable by everyone" ON public.badges
  FOR SELECT USING (is_active = true);

-- USER BADGES POLICIES
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can award badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- REMINDERS POLICIES
CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_clubs_slug ON public.clubs(slug);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON public.registrations(qr_token);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON public.attendance(event_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON public.reminders(remind_at) WHERE is_sent = false;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    UPDATE public.events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE public.events
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.events
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for attendee count
DROP TRIGGER IF EXISTS on_registration_change ON public.registrations;
CREATE TRIGGER on_registration_change
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees();

-- Function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = total_points + NEW.points_awarded
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for points
DROP TRIGGER IF EXISTS on_attendance_insert ON public.attendance;
CREATE TRIGGER on_attendance_insert
  AFTER INSERT ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ CampusPulse database schema created successfully!';
  RAISE NOTICE 'Tables created: profiles, clubs, events, registrations, attendance, badges, user_badges, notifications, reminders';
  RAISE NOTICE 'Views created: leaderboard';
  RAISE NOTICE 'RLS policies applied to all tables';
END $$;
