-- Admins / club_admins can see ALL registrations (not just their own)
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;
CREATE POLICY "Admins can view all registrations" ON public.registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'club_admin')
    )
  );

-- Same for attendance — admin check-in screens see everyone
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
CREATE POLICY "Admins can view all attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'club_admin')
    )
  );

-- Promote demo user to admin so they can use the admin portal
UPDATE public.profiles SET role = 'admin' WHERE email = 'demo@gitam.edu';
