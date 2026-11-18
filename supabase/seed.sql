-- Cru-VSU Seed Data
-- Creates the central Jesus root node, sample spiritual generations, and initial campus projects.

-- 1. Central Root Node: Jesus Christ
INSERT INTO public.profiles (
  id,
  full_name,
  college_program,
  testimony,
  favorite_verse,
  role,
  discipler_id,
  generation_depth,
  is_root_jesus
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Jesus Christ',
  'The Cornerstone',
  'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.',
  'John 15:5',
  'admin',
  NULL,
  0,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Generation 1: Campus Staff & Pioneers
INSERT INTO public.profiles (
  id, full_name, college_program, testimony, favorite_verse, role, discipler_id, generation_depth
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Kuya Marco Santos',
  'Campus Staff / VSU Alumni',
  'Called to equip student leaders at Visayas State University to win, build, and send.',
  '2 Timothy 2:2',
  'admin',
  '00000000-0000-0000-0000-000000000000',
  1
),
(
  '22222222-2222-2222-2222-222222222222',
  'Ate Grace Villanueva',
  'Campus Staff / Women''s Ministry',
  'Passionate about walking alongside college women as a spiritual mom on campus.',
  '1 Thessalonians 2:8',
  'discipler',
  '00000000-0000-0000-0000-000000000000',
  1
) ON CONFLICT (id) DO NOTHING;

-- 3. Generation 2: Student Disciplers ("Spiritual Moms & Dads")
INSERT INTO public.profiles (
  id, full_name, college_program, testimony, favorite_verse, role, discipler_id, generation_depth
) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  'Daniel Reyes',
  'BS Computer Science, 4th Year',
  'Found true community in Cru during freshman year; now discipling freshmen in Engineering.',
  'Proverbs 27:17',
  'discipler',
  '11111111-1111-1111-1111-111111111111',
  2
),
(
  '44444444-4444-4444-4444-444444444444',
  'Hannah Mendoza',
  'BS Agriculture, 3rd Year',
  'Experiencing God''s grace through Action Groups and passing it on to my roommates.',
  'Romans 12:1-2',
  'discipler',
  '22222222-2222-2222-2222-222222222222',
  2
) ON CONFLICT (id) DO NOTHING;

-- 4. Generation 3: Disciples
INSERT INTO public.profiles (
  id, full_name, college_program, testimony, favorite_verse, role, discipler_id, generation_depth
) VALUES
(
  '55555555-5555-5555-5555-555555555555',
  'Joshua Lim',
  'BS Civil Engineering, 2nd Year',
  'Growing in daily scripture reading and prayer with my spiritual dad.',
  'Joshua 1:9',
  'disciple',
  '33333333-3333-3333-3333-333333333333',
  3
),
(
  '66666666-6666-6666-6666-666666666666',
  'Sophia Cruz',
  'BS Development Communication, 1st Year',
  'New to VSU and thankful to have a spiritual mom guiding me through college life.',
  'Jeremiah 29:11',
  'disciple',
  '44444444-4444-4444-4444-444444444444',
  3
) ON CONFLICT (id) DO NOTHING;

-- 5. Ministry Projects
INSERT INTO public.ministry_projects (
  title, slug, category, summary, description, schedule, is_active
) VALUES
(
  'College Life Weekly Fellowship',
  'college-life-fellowship',
  'Fellowship',
  'Our weekly large-group gathering for worship, biblical teaching, and authentic campus community.',
  'Join students from every college at VSU for an energizing evening of worship, relevant messages from Scripture, games, and fellowship. A welcoming space whether you are exploring faith or looking for a Christian community on campus.',
  'Thursdays, 6:00 PM @ Student Union Building',
  TRUE
),
(
  'Campus Action Groups',
  'campus-action-groups',
  'Action Groups',
  'Small-group discipleship cohorts led by student moms and dads across dorms and colleges.',
  'Action Groups are where life-on-life discipleship happens. Meet weekly with 4-8 peers in your college or dorm to study the Bible, pray for one another, and navigate university life together.',
  'Various schedules by College & Dormitory',
  TRUE
),
(
  'Freshmen Welcome & Soularium Outreach',
  'freshmen-soularium-outreach',
  'Outreach',
  'Creative spiritual conversations across VSU campus using visual story cards and campus hospitality.',
  'Every semester we set up interactive stations around the VSU Upper and Lower Campus to hear students'' stories, share the hope of Jesus, and invite newcomers into community.',
  'First 3 weeks of each semester',
  TRUE
) ON CONFLICT (slug) DO NOTHING;
