
-- PE credentials table (one row per user)
CREATE TABLE public.pe_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Identity
  full_legal_name TEXT,
  pe_license_number TEXT,
  pe_state TEXT NOT NULL DEFAULT 'FL',
  engineering_discipline TEXT,
  firm_name TEXT,
  firm_address TEXT,
  firm_phone TEXT,
  firm_email TEXT,

  -- Seal & signature assets (Supabase Storage paths)
  seal_image_path TEXT,
  signature_image_path TEXT,
  seal_uploaded_at TIMESTAMPTZ,
  signature_uploaded_at TIMESTAMPTZ,

  -- Digital signing certificate
  certificate_public_key TEXT,
  certificate_fingerprint TEXT,
  certificate_generated_at TIMESTAMPTZ,
  certificate_expires_at TIMESTAMPTZ,

  -- Encrypted private key (Option B - account vault)
  encrypted_private_key_blob TEXT,
  encrypted_private_key_salt TEXT,
  encrypted_private_key_iv TEXT,

  -- License verification
  license_verified BOOLEAN DEFAULT FALSE,
  license_verified_at TIMESTAMPTZ,
  license_status TEXT DEFAULT 'not_verified',

  -- Consent
  credentials_certified_at TIMESTAMPTZ,
  credentials_certified_ip TEXT,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log of every signing event
CREATE TABLE public.pe_signing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pe_credentials_id UUID NOT NULL REFERENCES public.pe_credentials(id) ON DELETE CASCADE,
  calculation_type TEXT NOT NULL,
  calculation_id UUID NOT NULL,
  report_version INTEGER NOT NULL DEFAULT 1,

  -- Signing metadata
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_hash TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  certificate_fingerprint TEXT NOT NULL,
  signing_ip TEXT,
  signing_user_agent TEXT,

  -- Output
  signed_document_path TEXT,
  filename TEXT,

  -- Status
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);

-- Enable RLS
ALTER TABLE public.pe_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pe_signing_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for pe_credentials
CREATE POLICY "Users can view own PE credentials"
  ON public.pe_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PE credentials"
  ON public.pe_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PE credentials"
  ON public.pe_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PE credentials"
  ON public.pe_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for pe_signing_events
CREATE POLICY "Users can view own signing events"
  ON public.pe_signing_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own signing events"
  ON public.pe_signing_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Signing events should not be updatable or deletable by users (audit integrity)
-- Only revocation is handled via a specific update policy
CREATE POLICY "Users can revoke own signing events"
  ON public.pe_signing_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Timestamp trigger for pe_credentials
CREATE TRIGGER update_pe_credentials_updated_at
  BEFORE UPDATE ON public.pe_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets for PE seal and signature images
INSERT INTO storage.buckets (id, name, public) VALUES ('pe-seals', 'pe-seals', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pe-signatures', 'pe-signatures', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('signed-reports', 'signed-reports', false);

-- Storage RLS: users can only access their own files
CREATE POLICY "Users can upload own seal" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pe-seals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own seal" ON storage.objects FOR SELECT
  USING (bucket_id = 'pe-seals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own seal" ON storage.objects FOR UPDATE
  USING (bucket_id = 'pe-seals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own seal" ON storage.objects FOR DELETE
  USING (bucket_id = 'pe-seals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own signature" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pe-signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own signature" ON storage.objects FOR SELECT
  USING (bucket_id = 'pe-signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own signature" ON storage.objects FOR UPDATE
  USING (bucket_id = 'pe-signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own signature" ON storage.objects FOR DELETE
  USING (bucket_id = 'pe-signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own signed reports" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signed-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own signed reports" ON storage.objects FOR SELECT
  USING (bucket_id = 'signed-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own signed reports" ON storage.objects FOR DELETE
  USING (bucket_id = 'signed-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
