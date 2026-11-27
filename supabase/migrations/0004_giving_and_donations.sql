-- Cru-VSU Step 7: Centralized Cru Eastern Visayas (Cru EV) Giving & Donation Tracking

-- 1. Cru EV Giving Channels (bank accounts & e-wallets managed by admins)
CREATE TABLE IF NOT EXISTS public.giving_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('bank', 'ewallet')),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  qr_image_url TEXT,
  instructions TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giving_channels_active_order
  ON public.giving_channels (is_active, display_order, created_at);

-- 2. Donations Tracking Table (records transfers designated to General Fund or specific person)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation_type TEXT NOT NULL CHECK (designation_type IN ('general_fund', 'specific_person')),
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_custom_name TEXT,
  amount_php NUMERIC(12, 2) NOT NULL CHECK (amount_php > 0),
  channel_id UUID REFERENCES public.giving_channels(id) ON DELETE SET NULL,
  channel_name_snapshot TEXT NOT NULL,
  reference_number TEXT,
  receipt_storage_path TEXT,
  donor_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  donor_email TEXT,
  donor_phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'distributed')),
  admin_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT donations_designation_consistency CHECK (
    designation_type = 'general_fund'
    OR recipient_profile_id IS NOT NULL
    OR (recipient_custom_name IS NOT NULL AND length(trim(recipient_custom_name)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_donations_status_created
  ON public.donations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donations_recipient_profile
  ON public.donations (recipient_profile_id)
  WHERE recipient_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_channel_id
  ON public.donations (channel_id)
  WHERE channel_id IS NOT NULL;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.giving_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Public can view active Cru EV channels on /give
CREATE POLICY "Public can view active giving channels"
  ON public.giving_channels FOR SELECT
  USING (is_active = true);

-- Admins have full access to giving_channels
CREATE POLICY "Admins can view all giving channels"
  ON public.giving_channels FOR SELECT
  USING ((SELECT public.is_admin()));

CREATE POLICY "Admins can insert giving channels"
  ON public.giving_channels FOR INSERT
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update giving channels"
  ON public.giving_channels FOR UPDATE
  USING ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete giving channels"
  ON public.giving_channels FOR DELETE
  USING ((SELECT public.is_admin()));

-- Public can submit a pending donation record (cannot spoof verified/distributed)
CREATE POLICY "Anyone can submit a pending donation"
  ON public.donations FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND verified_by IS NULL
    AND verified_at IS NULL
  );

-- Only admins can view or update donation records
CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING ((SELECT public.is_admin()));

CREATE POLICY "Admins can update donations"
  ON public.donations FOR UPDATE
  USING ((SELECT public.is_admin()));

-- 4. Storage Buckets for QR codes (public) and donor receipts (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'giving-qr-codes',
    'giving-qr-codes',
    true,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'giving-receipts',
    'giving-receipts',
    false,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: giving-qr-codes (public read, admin write/delete)
CREATE POLICY "Public can view giving QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'giving-qr-codes');

CREATE POLICY "Admins can upload giving QR codes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'giving-qr-codes' AND (SELECT public.is_admin()));

CREATE POLICY "Admins can update giving QR codes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'giving-qr-codes' AND (SELECT public.is_admin()));

CREATE POLICY "Admins can delete giving QR codes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'giving-qr-codes' AND (SELECT public.is_admin()));

-- Storage Policies: giving-receipts (anyone can upload a receipt, only admins can read/delete)
CREATE POLICY "Anyone can upload a donation receipt"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'giving-receipts');

CREATE POLICY "Admins can view donation receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'giving-receipts' AND (SELECT public.is_admin()));

CREATE POLICY "Admins can delete donation receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'giving-receipts' AND (SELECT public.is_admin()));
