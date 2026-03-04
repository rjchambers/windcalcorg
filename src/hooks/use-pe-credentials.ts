import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PECredentials {
  id: string;
  full_legal_name: string;
  pe_license_number: string;
  pe_state: string;
  engineering_discipline: string | null;
  firm_name: string | null;
  firm_address: string | null;
  firm_phone: string | null;
  firm_email: string | null;
  seal_image_path: string | null;
  signature_image_path: string | null;
  certificate_fingerprint: string | null;
  certificate_generated_at: string | null;
  certificate_expires_at: string | null;
  encrypted_private_key_blob: string | null;
  encrypted_private_key_salt: string | null;
  encrypted_private_key_iv: string | null;
  credentials_certified_at: string | null;
}

export function usePECredentials() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<PECredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCredentials(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('pe_credentials')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          const cred = data as any as PECredentials;
          setCredentials(cred);
          // Load signed URLs for seal and signature
          if (cred.seal_image_path) {
            const { data: urlData } = await supabase.storage.from('pe-seals').createSignedUrl(cred.seal_image_path, 3600);
            if (urlData?.signedUrl) setSealUrl(urlData.signedUrl);
          }
          if (cred.signature_image_path) {
            const { data: urlData } = await supabase.storage.from('pe-signatures').createSignedUrl(cred.signature_image_path, 3600);
            if (urlData?.signedUrl) setSignatureUrl(urlData.signedUrl);
          }
        }
        setLoading(false);
      });
  }, [user]);

  const isReady = !!(
    credentials?.full_legal_name &&
    credentials?.pe_license_number &&
    credentials?.seal_image_path &&
    credentials?.signature_image_path &&
    credentials?.certificate_fingerprint &&
    credentials?.encrypted_private_key_blob
  );

  return { credentials, loading, isReady, sealUrl, signatureUrl };
}
