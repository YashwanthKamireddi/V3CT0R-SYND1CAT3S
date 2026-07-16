-- Future events shouldn't be marked checked_in (demo seed bug)
UPDATE registrations r
SET checked_in = false, check_in_time = NULL
FROM events e
WHERE r.event_id = e.id
  AND e.date > now()
  AND r.checked_in = true;

-- Create app_settings table (admin /settings page queries it)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read settings" ON public.app_settings;
CREATE POLICY "Admins read settings" ON public.app_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','club_admin'))
  );

DROP POLICY IF EXISTS "Admins write settings" ON public.app_settings;
CREATE POLICY "Admins write settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO app_settings (key, value) VALUES
  ('app_name', '"CampusPulse"'),
  ('default_points_per_event', '50'),
  ('max_events_per_day', '10'),
  ('registration_window_hours', '72')
ON CONFLICT (key) DO NOTHING;
