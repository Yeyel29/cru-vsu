-- Cru-VSU Audit Remediation: RLS Privilege Guard, Atomic Admin RPCs, and updated_at Triggers

-- 1. Guard privileged profile columns from non-admin inserts/updates
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_parent_depth INT;
BEGIN
  -- Allow SQL editor, migrations, and service-role operations
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may manage any profile field
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_root_jesus := FALSE;

    -- Discipler adding an unlinked disciple node under themselves
    IF NEW.auth_user_id IS NULL THEN
      NEW.role := 'disciple';
      IF NEW.discipler_id IS NOT NULL THEN
        SELECT COALESCE(generation_depth, 1) + 1
          INTO v_parent_depth
          FROM public.profiles
         WHERE id = NEW.discipler_id;
        NEW.generation_depth := COALESCE(v_parent_depth, 2);
      END IF;
    ELSE
      -- Self-registration: force safe defaults
      IF NEW.role NOT IN ('seeker', 'disciple') THEN
        NEW.role := 'disciple';
      END IF;
      NEW.discipler_id := NULL;
      NEW.generation_depth := 1;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_root_jesus IS DISTINCT FROM OLD.is_root_jesus
       OR NEW.discipler_id IS DISTINCT FROM OLD.discipler_id
       OR NEW.generation_depth IS DISTINCT FROM OLD.generation_depth
       OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
      RAISE EXCEPTION 'Only admins can modify privileged profile fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_privileged_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_privileged_fields();

-- 2. Atomic discipler application review RPC
CREATE OR REPLACE FUNCTION public.review_discipler_application(
  p_application_id UUID,
  p_decision TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_profile_id UUID;
  v_applicant_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid decision: %', p_decision
      USING ERRCODE = '22023';
  END IF;

  SELECT id
    INTO v_admin_profile_id
    FROM public.profiles
   WHERE auth_user_id = auth.uid()
   LIMIT 1;

  UPDATE public.discipler_applications
     SET status = p_decision,
         reviewed_by = v_admin_profile_id,
         reviewed_at = NOW()
   WHERE id = p_application_id
     AND status = 'pending'
   RETURNING applicant_id INTO v_applicant_id;

  IF v_applicant_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or already reviewed.'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE public.profiles
       SET role = 'discipler',
           updated_at = NOW()
     WHERE id = v_applicant_id
       AND role <> 'admin';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.review_discipler_application(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_discipler_application(UUID, TEXT) TO authenticated;

-- 3. Atomic mentorship pairing RPC with cycle detection & downline depth recalculation
CREATE OR REPLACE FUNCTION public.pair_mentorship_request(
  p_request_id UUID,
  p_requester_id UUID,
  p_discipler_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_discipler_depth INT;
  v_new_depth INT;
  v_has_cycle BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_requester_id = p_discipler_id THEN
    RAISE EXCEPTION 'Cannot pair a member with themselves.'
      USING ERRCODE = '22023';
  END IF;

  SELECT generation_depth
    INTO v_discipler_depth
    FROM public.profiles
   WHERE id = p_discipler_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected discipler was not found.'
      USING ERRCODE = 'P0002';
  END IF;

  WITH RECURSIVE ancestors AS (
    SELECT id, discipler_id, 0 AS depth
      FROM public.profiles
     WHERE id = p_discipler_id
    UNION ALL
    SELECT p.id, p.discipler_id, a.depth + 1
      FROM public.profiles p
      INNER JOIN ancestors a ON p.id = a.discipler_id
     WHERE a.depth < 100
  )
  SELECT EXISTS (
    SELECT 1 FROM ancestors WHERE id = p_requester_id
  ) INTO v_has_cycle;

  IF v_has_cycle THEN
    RAISE EXCEPTION 'Cannot pair: selected discipler is in the requester downline.'
      USING ERRCODE = '22023';
  END IF;

  v_new_depth := COALESCE(v_discipler_depth, 1) + 1;

  UPDATE public.profiles
     SET discipler_id = p_discipler_id,
         generation_depth = v_new_depth,
         updated_at = NOW()
   WHERE id = p_requester_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Requester profile was not found.'
      USING ERRCODE = 'P0002';
  END IF;

  WITH RECURSIVE downline AS (
    SELECT id, v_new_depth AS depth
      FROM public.profiles
     WHERE id = p_requester_id
    UNION ALL
    SELECT p.id, d.depth + 1
      FROM public.profiles p
      INNER JOIN downline d ON p.discipler_id = d.id
     WHERE d.depth < 100
  )
  UPDATE public.profiles p
     SET generation_depth = d.depth,
         updated_at = NOW()
    FROM downline d
   WHERE p.id = d.id
     AND p.id <> p_requester_id
     AND p.generation_depth IS DISTINCT FROM d.depth;

  UPDATE public.mentorship_requests
     SET status = 'paired',
         assigned_discipler_id = p_discipler_id
   WHERE id = p_request_id
     AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mentorship request not found or already processed.'
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.pair_mentorship_request(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pair_mentorship_request(UUID, UUID, UUID) TO authenticated;

-- 4. Automatic updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_giving_channels_set_updated_at ON public.giving_channels;
CREATE TRIGGER trg_giving_channels_set_updated_at
  BEFORE UPDATE ON public.giving_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
