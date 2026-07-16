-- =============================================
-- ALIGN SCHEMA WITH APPLICATION CODE
-- =============================================
-- Adds columns that the application code references but were
-- missing from the original schema. Uses generated columns where
-- possible so the new fields stay in sync with the originals.

-- ---------- EVENTS ----------
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ
    GENERATED ALWAYS AS (date) STORED,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ
    GENERATED ALWAYS AS (end_date) STORED,
  ADD COLUMN IF NOT EXISTS event_date DATE
    GENERATED ALWAYS AS ((date AT TIME ZONE 'UTC')::date) STORED,
  ADD COLUMN IF NOT EXISTS capacity INTEGER
    GENERATED ALWAYS AS (max_attendees) STORED,
  ADD COLUMN IF NOT EXISTS current_registrations INTEGER
    GENERATED ALWAYS AS (current_attendees) STORED,
  ADD COLUMN IF NOT EXISTS points_reward INTEGER
    GENERATED ALWAYS AS (points) STORED,
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Backfill short_description from description
UPDATE public.events
SET short_description = LEFT(description, 140)
WHERE short_description IS NULL AND description IS NOT NULL;

-- Backfill venue_address from location/venue
UPDATE public.events
SET venue_address = COALESCE(location, venue)
WHERE venue_address IS NULL;

-- ---------- CLUBS ----------
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT
    GENERATED ALWAYS AS (banner_url) STORED,
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- ---------- PROFILES ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS events_attended INTEGER DEFAULT 0;

-- Keep events_attended in sync via trigger on attendance
CREATE OR REPLACE FUNCTION public.update_profile_events_attended()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET events_attended = COALESCE(events_attended, 0) + 1
      WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET events_attended = GREATEST(COALESCE(events_attended, 0) - 1, 0)
      WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_attendance_count_change ON public.attendance;
CREATE TRIGGER on_attendance_count_change
  AFTER INSERT OR DELETE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_events_attended();

-- ---------- REGISTRATIONS ----------
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ
    GENERATED ALWAYS AS (created_at) STORED;

-- ---------- ATTENDANCE ----------
-- code expects checked_in_at + checked_in_by; schema has check_in_time + verified_by
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ
    GENERATED ALWAYS AS (check_in_time) STORED,
  ADD COLUMN IF NOT EXISTS checked_in_by UUID
    GENERATED ALWAYS AS (verified_by) STORED;

-- ---------- REMINDERS ----------
-- code expects: sent, sent_at, reminder_type, scheduled_for
-- schema has:   is_sent, (none), type, remind_at
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS sent BOOLEAN
    GENERATED ALWAYS AS (is_sent) STORED,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_type TEXT
    GENERATED ALWAYS AS (type) STORED,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ
    GENERATED ALWAYS AS (remind_at) STORED;

-- ---------- BADGES ----------
-- code expects: icon, color, requirement_type, requirement_value, points_bonus
-- schema has:   icon_url, (none), (none), points_required/events_required, (none)
ALTER TABLE public.badges
  ADD COLUMN IF NOT EXISTS icon TEXT
    GENERATED ALWAYS AS (icon_url) STORED,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS requirement_type TEXT,
  ADD COLUMN IF NOT EXISTS requirement_value INTEGER,
  ADD COLUMN IF NOT EXISTS points_bonus INTEGER DEFAULT 0;

-- Backfill requirement_type/value from points_required/events_required
UPDATE public.badges
SET requirement_type = CASE
    WHEN points_required IS NOT NULL THEN 'points_earned'
    WHEN events_required IS NOT NULL THEN 'events_attended'
    ELSE 'special'
  END,
  requirement_value = COALESCE(points_required, events_required)
WHERE requirement_type IS NULL;

-- ---------- NOTIFICATIONS ----------
-- code expects: icon, color, action_url, event_id
-- schema has:   data JSONB only
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS action_url TEXT;

-- ---------- LEADERBOARD VIEW (rebuild with id alias) ----------
-- code expects `leaderboard.id` (not user_id)
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard AS
SELECT
  p.id,
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  p.branch,
  p.year,
  p.total_points,
  RANK() OVER (ORDER BY p.total_points DESC) AS rank,
  COALESCE(p.events_attended, 0) AS events_attended,
  (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = p.id) AS badges_count
FROM public.profiles p
WHERE p.is_active = true
ORDER BY p.total_points DESC;

DO $$ BEGIN
  RAISE NOTICE '✅ Schema aligned with application code';
END $$;
