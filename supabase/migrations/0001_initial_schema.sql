-- Cru-VSU Initial Database Schema
-- Aligns with dev-brain/wiki/projects/cru/dev/cru-vsu-web-architecture.md

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Extends auth.users or standalone for seeded/root nodes)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  college_program TEXT,
  testimony TEXT,
  favorite_verse TEXT,
  role TEXT NOT NULL DEFAULT 'disciple' CHECK (role IN ('seeker', 'disciple', 'discipler', 'admin')),
  discipler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  generation_depth INT NOT NULL DEFAULT 1,
  is_root_jesus BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent circular self-referencing in strict single-parent tree
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_no_self_discipler CHECK (id <> discipler_id);

-- 2. Ministry Projects Table
CREATE TABLE IF NOT EXISTS public.ministry_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  schedule TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Join Cru Inquiries Table
CREATE TABLE IF NOT EXISTS public.join_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college_course_year TEXT,
  spiritual_interest TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'paired', 'closed')),
  assigned_discipler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Discipler Applications Table
CREATE TABLE IF NOT EXISTS public.discipler_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipler_applications ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Discipleship graph is public testimony)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Active ministry projects are viewable by everyone"
  ON public.ministry_projects FOR SELECT
  USING (is_active = true);

-- Public Insert Policy for Join Cru intake
CREATE POLICY "Anyone can submit a join inquiry"
  ON public.join_inquiries FOR INSERT
  WITH CHECK (true);

-- Authenticated User Policies
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Members can submit discipler applications"
  ON public.discipler_applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = applicant_id AND auth_user_id = auth.uid()
    )
  );
