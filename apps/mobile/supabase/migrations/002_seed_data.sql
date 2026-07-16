-- =============================================
-- CAMPUSPULSE SEED DATA
-- =============================================
-- Run this after the initial schema migration
-- to populate the database with sample data

-- =============================================
-- 1. SEED CLUBS
-- =============================================

INSERT INTO public.clubs (id, name, slug, logo_url, description, category, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'GitHub Community GITAM', 'github-community', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'Open source community dedicated to building innovative projects and fostering collaboration among developers.', 'Technical', true),
  ('22222222-2222-2222-2222-222222222222', 'GDGOC GITAM', 'gdgoc', 'https://developers.google.com/community/gdg/images/gdg-logo.png', 'Google Developer Group On Campus - Explore Google technologies and build solutions that matter.', 'Technical', true),
  ('33333333-3333-3333-3333-333333333333', 'GUSAC', 'gusac', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80', 'GITAM University Student Activity Club - Your gateway to cultural events and campus life.', 'Cultural', true),
  ('44444444-4444-4444-4444-444444444444', 'Robotics Club', 'robotics', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&q=80', 'Build robots, compete in challenges, and explore the world of automation and AI.', 'Technical', true),
  ('55555555-5555-5555-5555-555555555555', 'NSS GITAM', 'nss', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=100&q=80', 'National Service Scheme - Dedicated to community service and social welfare.', 'Social', true),
  ('66666666-6666-6666-6666-666666666666', 'Kalakriti Dance', 'kalakriti-dance', 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=100&q=80', 'Express yourself through dance - From classical to contemporary.', 'Cultural', true),
  ('77777777-7777-7777-7777-777777777777', 'IEEE Student Branch', 'ieee', 'https://brand-experience.ieee.org/wp-content/uploads/2013/10/l_rgb.gif', 'IEEE Student Branch GITAM - Connecting students with technology and innovation.', 'Technical', true),
  ('88888888-8888-8888-8888-888888888888', 'ACM Student Chapter', 'acm', 'https://www.acm.org/binaries/content/gallery/acm/ctas/logo-acm.svg', 'Association for Computing Machinery - Advancing computing as a science and profession.', 'Technical', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. SEED EVENTS
-- =============================================

INSERT INTO public.events (id, club_id, title, slug, description, image_url, date, end_date, location, venue, category, price, max_attendees, points, is_featured, is_active) VALUES
  -- GitHub Community Events
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'GIT-A-THON 2025', 'git-a-thon-2025', 'The ultimate 24-hour hackathon! Build innovative projects, compete for prizes, and network with industry experts. Open to all skill levels.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', '2025-01-20 09:00:00+05:30', '2025-01-21 18:00:00+05:30', 'GITAM Visakhapatnam', 'Main Auditorium', 'hackathon', 0, 250, 100, true, true),

  ('e1111112-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Code Warz - Epoch 2025', 'code-warz-2025', 'Test your coding skills in this intense competitive programming challenge. Multiple rounds, increasing difficulty, amazing prizes!', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', '2025-01-19 10:00:00+05:30', '2025-01-19 18:00:00+05:30', 'GITAM Visakhapatnam', 'Computer Lab 301', 'technical', 0, 180, 80, true, true),

  -- GDGOC Events
  ('e2222221-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Gen AI Workshop', 'gen-ai-workshop-2025', 'Hands-on workshop on Generative AI. Learn about LLMs, prompt engineering, and build your first AI-powered application.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', '2025-01-17 15:00:00+05:30', '2025-01-17 18:00:00+05:30', 'ICT, GITAM Visakhapatnam', 'Seminar Hall B', 'workshop', 0, 150, 50, true, true),

  ('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Cloud Study Jams', 'cloud-study-jams-2025', 'Get certified with Google Cloud! Free hands-on labs, mentorship, and swag for top performers.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', '2025-01-25 10:00:00+05:30', '2025-01-25 16:00:00+05:30', 'Online', 'Virtual', 'workshop', 0, 500, 70, false, true),

  -- GUSAC Events
  ('e3333331-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Holi Fiesta 2.0', 'holi-fiesta-2025', 'The most colorful celebration of the year! Music, dance, food stalls, and unlimited fun. Get ready to splash colors!', 'https://images.unsplash.com/photo-1576016770956-debb63d92058?w=800&q=80', '2025-03-14 10:00:00+05:30', '2025-03-14 18:00:00+05:30', 'GITAM Visakhapatnam', 'Main Ground', 'cultural', 250, 1000, 75, true, true),

  ('e3333332-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'GUSAC Carnival 11.0', 'gusac-carnival-2025', 'The biggest campus festival! Live performances, gaming zones, food courts, and celebrity appearances.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', '2025-02-15 16:00:00+05:30', '2025-02-15 23:00:00+05:30', 'GITAM Visakhapatnam', 'Entire Campus', 'cultural', 0, 2000, 100, true, true),

  -- Robotics Club Events
  ('e4444441-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Bot Wars 2025', 'bot-wars-2025', 'Design, build, and battle your robots! Categories include sumo bots, line followers, and custom builds.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', '2025-01-26 09:00:00+05:30', '2025-01-26 17:00:00+05:30', 'GITAM Visakhapatnam', 'Innovation Lab', 'technical', 0, 120, 80, false, true),

  -- NSS Events
  ('e5555551-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Blood Donation Camp', 'blood-donation-jan-2025', 'Save lives by donating blood. Free health checkup for all donors. Refreshments provided.', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80', '2025-01-28 09:00:00+05:30', '2025-01-28 16:00:00+05:30', 'GITAM Visakhapatnam', 'Health Center', 'social', 0, 200, 100, false, true),

  ('e5555552-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'Campus Clean-Up Drive', 'campus-cleanup-jan-2025', 'Join us for a campus-wide cleanup initiative. Every small action counts for a greener campus!', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80', '2025-01-30 07:00:00+05:30', '2025-01-30 11:00:00+05:30', 'GITAM Visakhapatnam', 'Campus Grounds', 'social', 0, 300, 70, false, true),

  -- IEEE Events
  ('e7777771-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', 'IEEE Technical Talk: Future of 5G', 'ieee-5g-talk-2025', 'Expert session on 5G technology, its applications, and the future of telecommunications.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', '2025-01-22 15:00:00+05:30', '2025-01-22 17:00:00+05:30', 'GITAM Visakhapatnam', 'Seminar Hall A', 'seminar', 0, 100, 45, false, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. SEED BADGES
-- =============================================

INSERT INTO public.badges (id, name, slug, description, icon_url, category, points_required, events_required, is_active) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'First Steps', 'first-steps', 'Attended your first campus event. Welcome to the community!', '🎉', 'Beginner', NULL, 1, true),
  ('b2222222-2222-2222-2222-222222222222', 'Event Explorer', 'event-explorer', 'Attended 5 different events. You''re really getting around!', '🔍', 'Progress', NULL, 5, true),
  ('b3333333-3333-3333-3333-333333333333', 'Social Butterfly', 'social-butterfly', 'Attended 10 events. You''re a campus regular now!', '🦋', 'Progress', NULL, 10, true),
  ('b4444444-4444-4444-4444-444444444444', 'Point Master', 'point-master', 'Earned 500 points. You''re climbing the leaderboard!', '⭐', 'Achievement', 500, NULL, true),
  ('b5555555-5555-5555-5555-555555555555', 'Hackathon Hero', 'hackathon-hero', 'Participated in a hackathon. Code warrior status unlocked!', '💻', 'Special', NULL, NULL, true),
  ('b6666666-6666-6666-6666-666666666666', 'Community Champion', 'community-champion', 'Participated in a social service event. Making a difference!', '❤️', 'Special', NULL, NULL, true),
  ('b7777777-7777-7777-7777-777777777777', 'Tech Enthusiast', 'tech-enthusiast', 'Attended 3 technical events. Learning and growing!', '🚀', 'Category', NULL, NULL, true),
  ('b8888888-8888-8888-8888-888888888888', 'Cultural Connoisseur', 'cultural-connoisseur', 'Attended 3 cultural events. Embracing the arts!', '🎭', 'Category', NULL, NULL, true),
  ('b9999999-9999-9999-9999-999999999999', 'Legend', 'legend', 'Earned 2000 points. You''re a campus legend!', '👑', 'Elite', 2000, NULL, true),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Early Bird', 'early-bird', 'Registered for an event within 24 hours of announcement.', '🐦', 'Special', NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE 'Added: 8 clubs, 10 events, 10 badges';
  RAISE NOTICE 'Ready for testing!';
END $$;
