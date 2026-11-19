-- Cru-VSU Step 6: Admin Console RLS Policies & Security Helper

-- Helper function to check admin role without recursive RLS evaluation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 1. Admins can update any profile (promote to discipler, assign discipler_id)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 2. Admins can view and update all join inquiries
CREATE POLICY "Admins can view all join inquiries"
  ON public.join_inquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update join inquiries"
  ON public.join_inquiries FOR UPDATE
  USING (public.is_admin());

-- 3. Admins can view and update all mentorship requests
CREATE POLICY "Admins can view all mentorship requests"
  ON public.mentorship_requests FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update mentorship requests"
  ON public.mentorship_requests FOR UPDATE
  USING (public.is_admin());

-- 4. Admins can view and update all discipler applications
CREATE POLICY "Admins can view all discipler applications"
  ON public.discipler_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update discipler applications"
  ON public.discipler_applications FOR UPDATE
  USING (public.is_admin());

-- 5. Admins can manage ministry projects (view all, insert, update, delete)
CREATE POLICY "Admins can view all ministry projects"
  ON public.ministry_projects FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert ministry projects"
  ON public.ministry_projects FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update ministry projects"
  ON public.ministry_projects FOR UPDATE
  USING (public.is_admin());
