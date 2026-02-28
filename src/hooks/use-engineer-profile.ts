import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EngineerProfile } from '@/lib/engineer-profile';
import { EMPTY_PROFILE } from '@/lib/engineer-profile';

export function useEngineerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EngineerProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(EMPTY_PROFILE);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('profiles')
      .select('display_name, company, pe_license, business_name, business_address, business_phone, business_email, license_state, license_type')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            display_name: data.display_name,
            company: data.company,
            pe_license: data.pe_license,
            business_name: (data as any).business_name ?? null,
            business_address: (data as any).business_address ?? null,
            business_phone: (data as any).business_phone ?? null,
            business_email: (data as any).business_email ?? null,
            license_state: (data as any).license_state ?? 'FL',
            license_type: (data as any).license_type ?? 'PE',
          });
        }
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
}
