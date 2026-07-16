-- CampusPulse Database Seed Script
-- Run this in your Supabase SQL Editor to populate with realistic data

-- First, let's create some clubs
INSERT INTO clubs (id, name, description, category, status, logo_url, cover_url, contact_email, created_at)
VALUES
  (gen_random_uuid(), 'TechVerse Club', 'A community of tech enthusiasts exploring the latest in AI, Web3, and software development. We host hackathons, coding workshops, and tech talks.', 'technical', 'active', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', 'techverse@campus.edu', NOW() - INTERVAL '180 days'),

  (gen_random_uuid(), 'Creative Arts Society', 'Express yourself through art, music, and creative expression. From painting to digital art, we celebrate all forms of creativity.', 'cultural', 'active', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200', 'arts@campus.edu', NOW() - INTERVAL '150 days'),

  (gen_random_uuid(), 'Sports & Fitness Club', 'Stay active and healthy! We organize sports tournaments, fitness challenges, and outdoor adventures for all skill levels.', 'sports', 'active', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200', 'sports@campus.edu', NOW() - INTERVAL '200 days'),

  (gen_random_uuid(), 'Debate & MUN Society', 'Sharpen your public speaking and argumentation skills. We participate in national Model UN conferences and inter-college debates.', 'academic', 'active', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 'debate@campus.edu', NOW() - INTERVAL '120 days'),

  (gen_random_uuid(), 'Entrepreneurship Cell', 'Turn your startup dreams into reality. We connect aspiring entrepreneurs with mentors, investors, and resources.', 'professional', 'active', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200', 'ecell@campus.edu', NOW() - INTERVAL '90 days'),

  (gen_random_uuid(), 'Photography Club', 'Capture moments that matter. Learn photography techniques, participate in photo walks, and showcase your work in exhibitions.', 'cultural', 'active', 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=200', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200', 'photo@campus.edu', NOW() - INTERVAL '160 days'),

  (gen_random_uuid(), 'Music & Beats', 'From classical to contemporary, we bring music lovers together. Jam sessions, concerts, and music production workshops.', 'cultural', 'active', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200', 'music@campus.edu', NOW() - INTERVAL '140 days'),

  (gen_random_uuid(), 'Environmental Club', 'Join the green revolution! We organize tree plantations, sustainability drives, and environmental awareness campaigns.', 'social', 'active', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200', 'green@campus.edu', NOW() - INTERVAL '100 days'),

  (gen_random_uuid(), 'Robotics & IoT Club', 'Build the future with robots and smart devices. Hands-on workshops, competitions, and innovative projects.', 'technical', 'active', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200', 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200', 'robotics@campus.edu', NOW() - INTERVAL '80 days'),

  (gen_random_uuid(), 'Literary Society', 'For book lovers, writers, and poets. Book discussions, creative writing workshops, and poetry slams await you.', 'academic', 'active', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200', 'literary@campus.edu', NOW() - INTERVAL '170 days');

-- Get club IDs for reference
DO $$
DECLARE
  techverse_id UUID;
  arts_id UUID;
  sports_id UUID;
  debate_id UUID;
  ecell_id UUID;
  photo_id UUID;
  music_id UUID;
  env_id UUID;
  robotics_id UUID;
  literary_id UUID;
BEGIN
  SELECT id INTO techverse_id FROM clubs WHERE name = 'TechVerse Club' LIMIT 1;
  SELECT id INTO arts_id FROM clubs WHERE name = 'Creative Arts Society' LIMIT 1;
  SELECT id INTO sports_id FROM clubs WHERE name = 'Sports & Fitness Club' LIMIT 1;
  SELECT id INTO debate_id FROM clubs WHERE name = 'Debate & MUN Society' LIMIT 1;
  SELECT id INTO ecell_id FROM clubs WHERE name = 'Entrepreneurship Cell' LIMIT 1;
  SELECT id INTO photo_id FROM clubs WHERE name = 'Photography Club' LIMIT 1;
  SELECT id INTO music_id FROM clubs WHERE name = 'Music & Beats' LIMIT 1;
  SELECT id INTO env_id FROM clubs WHERE name = 'Environmental Club' LIMIT 1;
  SELECT id INTO robotics_id FROM clubs WHERE name = 'Robotics & IoT Club' LIMIT 1;
  SELECT id INTO literary_id FROM clubs WHERE name = 'Literary Society' LIMIT 1;

  -- Insert events
  INSERT INTO events (id, title, description, date, time, location, capacity, category, status, image_url, club_id, created_at)
  VALUES
    -- Upcoming Events
    (gen_random_uuid(), 'HackCampus 2024', 'The biggest 48-hour hackathon of the year! Build innovative solutions, win amazing prizes, and network with industry professionals. Food, drinks, and swag included!', (CURRENT_DATE + INTERVAL '7 days')::DATE, '09:00', 'Innovation Hub, Building A', 200, 'technical', 'upcoming', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', techverse_id, NOW() - INTERVAL '14 days'),

    (gen_random_uuid(), 'Annual Art Exhibition', 'Showcasing the best artworks from our talented students. Paintings, sculptures, digital art, and more. Guest artists and live demonstrations.', (CURRENT_DATE + INTERVAL '10 days')::DATE, '14:00', 'Art Gallery, Cultural Center', 150, 'cultural', 'upcoming', 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800', arts_id, NOW() - INTERVAL '10 days'),

    (gen_random_uuid(), 'Inter-College Sports Meet', 'Compete with the best athletes from across the region. Track events, team sports, and individual competitions. Glory awaits!', (CURRENT_DATE + INTERVAL '14 days')::DATE, '08:00', 'University Stadium', 500, 'sports', 'upcoming', 'https://images.unsplash.com/photo-1461896836934- voices-of-the-world?w=800', sports_id, NOW() - INTERVAL '21 days'),

    (gen_random_uuid(), 'Startup Pitch Day', 'Present your startup idea to a panel of investors and industry experts. Top 3 teams win seed funding and mentorship!', (CURRENT_DATE + INTERVAL '5 days')::DATE, '10:00', 'Auditorium B', 100, 'professional', 'upcoming', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', ecell_id, NOW() - INTERVAL '7 days'),

    (gen_random_uuid(), 'AI & Machine Learning Workshop', 'Hands-on workshop on building ML models with Python. From basics to deployment. Laptops required.', (CURRENT_DATE + INTERVAL '3 days')::DATE, '15:00', 'Computer Lab 3, Tech Building', 50, 'workshop', 'upcoming', 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800', techverse_id, NOW() - INTERVAL '5 days'),

    (gen_random_uuid(), 'Golden Hour Photo Walk', 'Capture the magic of sunset across campus. Learn composition, lighting, and mobile photography tricks.', (CURRENT_DATE + INTERVAL '2 days')::DATE, '17:00', 'Main Gate', 30, 'cultural', 'upcoming', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', photo_id, NOW() - INTERVAL '3 days'),

    (gen_random_uuid(), 'Open Mic Night', 'Share your talent! Singing, poetry, stand-up comedy - the stage is yours. Refreshments provided.', (CURRENT_DATE + INTERVAL '4 days')::DATE, '19:00', 'Campus Cafe Stage', 80, 'cultural', 'upcoming', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', music_id, NOW() - INTERVAL '6 days'),

    (gen_random_uuid(), 'Climate Action Summit', 'Join the conversation on sustainability. Expert panels, workshops, and action planning for a greener campus.', (CURRENT_DATE + INTERVAL '8 days')::DATE, '10:00', 'Conference Hall 1', 120, 'seminar', 'upcoming', 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800', env_id, NOW() - INTERVAL '12 days'),

    -- Ongoing Event
    (gen_random_uuid(), 'Robotics Boot Camp', 'A 3-day intensive boot camp on building robots from scratch. Arduino, sensors, and mechanical design.', CURRENT_DATE::DATE, '09:00', 'Robotics Lab, Engineering Block', 40, 'workshop', 'ongoing', 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800', robotics_id, NOW() - INTERVAL '20 days'),

    -- Completed Events
    (gen_random_uuid(), 'Welcome Freshers 2024', 'The grand welcome party for the new batch! Music, dance, games, and a chance to make lifelong friends.', (CURRENT_DATE - INTERVAL '30 days')::DATE, '18:00', 'Main Auditorium', 400, 'social', 'completed', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', NULL, NOW() - INTERVAL '45 days'),

    (gen_random_uuid(), 'Code Sprint Challenge', 'A competitive coding contest with problems ranging from easy to expert level. Prizes worth ₹50,000!', (CURRENT_DATE - INTERVAL '14 days')::DATE, '10:00', 'Computer Lab 1 & 2', 100, 'technical', 'completed', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', techverse_id, NOW() - INTERVAL '30 days'),

    (gen_random_uuid(), 'Annual Debate Championship', 'The most prestigious debate event. Topics covering politics, ethics, and current affairs.', (CURRENT_DATE - INTERVAL '21 days')::DATE, '09:00', 'Seminar Hall 2', 60, 'academic', 'completed', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', debate_id, NOW() - INTERVAL '35 days'),

    (gen_random_uuid(), 'Book Fair & Authors Meet', 'Browse through thousands of books and meet bestselling authors. Special discounts for students!', (CURRENT_DATE - INTERVAL '7 days')::DATE, '11:00', 'Central Library Grounds', 200, 'academic', 'completed', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', literary_id, NOW() - INTERVAL '14 days');

END $$;

-- Create the increment_points function if it doesn't exist
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, points_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Output success message
SELECT 'Database seeded successfully!' AS status;
