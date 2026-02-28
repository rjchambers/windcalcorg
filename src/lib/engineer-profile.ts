export interface EngineerProfile {
  display_name: string | null;
  company: string | null;
  pe_license: string | null;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  license_state: string | null;
  license_type: string | null;
}

export const EMPTY_PROFILE: EngineerProfile = {
  display_name: null,
  company: null,
  pe_license: null,
  business_name: null,
  business_address: null,
  business_phone: null,
  business_email: null,
  license_state: 'FL',
  license_type: 'PE',
};
