-- Cru-VSU Step 5: Member Portal, Mentorship Requests & Discipler Web RLS

-- 1. Mentorship Requests Table (for logged-in members seeking a discipler)
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paired', 'closed')),
  assigned_discipler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for Profiles (Self-registration & Disciplers adding disciples)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Disciplers and admins can add disciple nodes"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS parent
      WHERE parent.id = discipler_id
        AND parent.auth_user_id = auth.uid()
        AND parent.role IN ('discipler', 'admin')
    )
  );

-- 3. RLS Policies for Discipler Applications (Read own)
CREATE POLICY "Users can view their own discipler applications"
  ON public.discipler_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = applicant_id AND auth_user_id = auth.uid()
    )
  );

-- 4. RLS Policies for Mentorship Requests
CREATE POLICY "Users can view their own mentorship requests"
  ON public.mentorship_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = requester_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own mentorship requests"
  ON public.mentorship_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = requester_id AND auth_user_id = auth.uid()
    )
  );
