export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      fastener_calculations: {
        Row: {
          construction_type: string | null
          county: string | null
          created_at: string
          engineer_of_record: string | null
          id: string
          inputs_json: Json
          name: string
          notes: string | null
          project_id: string
          qh_asd: number | null
          results_json: Json | null
          status: string | null
          system_type: string | null
          updated_at: string
          user_id: string
          version: number | null
          warnings_json: Json | null
          wind_speed_mph: number | null
        }
        Insert: {
          construction_type?: string | null
          county?: string | null
          created_at?: string
          engineer_of_record?: string | null
          id?: string
          inputs_json?: Json
          name?: string
          notes?: string | null
          project_id: string
          qh_asd?: number | null
          results_json?: Json | null
          status?: string | null
          system_type?: string | null
          updated_at?: string
          user_id: string
          version?: number | null
          warnings_json?: Json | null
          wind_speed_mph?: number | null
        }
        Update: {
          construction_type?: string | null
          county?: string | null
          created_at?: string
          engineer_of_record?: string | null
          id?: string
          inputs_json?: Json
          name?: string
          notes?: string | null
          project_id?: string
          qh_asd?: number | null
          results_json?: Json | null
          status?: string | null
          system_type?: string | null
          updated_at?: string
          user_id?: string
          version?: number | null
          warnings_json?: Json | null
          wind_speed_mph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fastener_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pe_credentials: {
        Row: {
          certificate_expires_at: string | null
          certificate_fingerprint: string | null
          certificate_generated_at: string | null
          certificate_public_key: string | null
          created_at: string | null
          credentials_certified_at: string | null
          credentials_certified_ip: string | null
          encrypted_private_key_blob: string | null
          encrypted_private_key_iv: string | null
          encrypted_private_key_salt: string | null
          engineering_discipline: string | null
          firm_address: string | null
          firm_email: string | null
          firm_name: string | null
          firm_phone: string | null
          full_legal_name: string | null
          id: string
          license_status: string | null
          license_verified: boolean | null
          license_verified_at: string | null
          pe_license_number: string | null
          pe_state: string
          seal_image_path: string | null
          seal_uploaded_at: string | null
          signature_image_path: string | null
          signature_uploaded_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_expires_at?: string | null
          certificate_fingerprint?: string | null
          certificate_generated_at?: string | null
          certificate_public_key?: string | null
          created_at?: string | null
          credentials_certified_at?: string | null
          credentials_certified_ip?: string | null
          encrypted_private_key_blob?: string | null
          encrypted_private_key_iv?: string | null
          encrypted_private_key_salt?: string | null
          engineering_discipline?: string | null
          firm_address?: string | null
          firm_email?: string | null
          firm_name?: string | null
          firm_phone?: string | null
          full_legal_name?: string | null
          id?: string
          license_status?: string | null
          license_verified?: boolean | null
          license_verified_at?: string | null
          pe_license_number?: string | null
          pe_state?: string
          seal_image_path?: string | null
          seal_uploaded_at?: string | null
          signature_image_path?: string | null
          signature_uploaded_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_expires_at?: string | null
          certificate_fingerprint?: string | null
          certificate_generated_at?: string | null
          certificate_public_key?: string | null
          created_at?: string | null
          credentials_certified_at?: string | null
          credentials_certified_ip?: string | null
          encrypted_private_key_blob?: string | null
          encrypted_private_key_iv?: string | null
          encrypted_private_key_salt?: string | null
          engineering_discipline?: string | null
          firm_address?: string | null
          firm_email?: string | null
          firm_name?: string | null
          firm_phone?: string | null
          full_legal_name?: string | null
          id?: string
          license_status?: string | null
          license_verified?: boolean | null
          license_verified_at?: string | null
          pe_license_number?: string | null
          pe_state?: string
          seal_image_path?: string | null
          seal_uploaded_at?: string | null
          signature_image_path?: string | null
          signature_uploaded_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pe_signing_events: {
        Row: {
          calculation_id: string
          calculation_type: string
          certificate_fingerprint: string
          document_hash: string
          filename: string | null
          id: string
          pe_credentials_id: string
          report_version: number
          revoked: boolean | null
          revoked_at: string | null
          revoked_reason: string | null
          signature_hash: string
          signed_at: string
          signed_document_path: string | null
          signing_ip: string | null
          signing_user_agent: string | null
          user_id: string
        }
        Insert: {
          calculation_id: string
          calculation_type: string
          certificate_fingerprint: string
          document_hash: string
          filename?: string | null
          id?: string
          pe_credentials_id: string
          report_version?: number
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          signature_hash: string
          signed_at?: string
          signed_document_path?: string | null
          signing_ip?: string | null
          signing_user_agent?: string | null
          user_id: string
        }
        Update: {
          calculation_id?: string
          calculation_type?: string
          certificate_fingerprint?: string
          document_hash?: string
          filename?: string | null
          id?: string
          pe_credentials_id?: string
          report_version?: number
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          signature_hash?: string
          signed_at?: string
          signed_document_path?: string | null
          signing_ip?: string | null
          signing_user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pe_signing_events_pe_credentials_id_fkey"
            columns: ["pe_credentials_id"]
            isOneToOne: false
            referencedRelation: "pe_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      product_approvals: {
        Row: {
          approval_number: string | null
          approval_type: string | null
          deck_types: string[] | null
          extrapolation_permitted: boolean | null
          fastener_specs_json: Json | null
          id: string
          lap_width_in: number | null
          manufacturer: string | null
          mdp_zone1_psf: number | null
          notes: string | null
          product_name: string | null
          sheet_width_in: number | null
          system_type: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          approval_number?: string | null
          approval_type?: string | null
          deck_types?: string[] | null
          extrapolation_permitted?: boolean | null
          fastener_specs_json?: Json | null
          id?: string
          lap_width_in?: number | null
          manufacturer?: string | null
          mdp_zone1_psf?: number | null
          notes?: string | null
          product_name?: string | null
          sheet_width_in?: number | null
          system_type?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          approval_number?: string | null
          approval_type?: string | null
          deck_types?: string[] | null
          extrapolation_permitted?: boolean | null
          fastener_specs_json?: Json | null
          id?: string
          lap_width_in?: number | null
          manufacturer?: string | null
          mdp_zone1_psf?: number | null
          notes?: string | null
          product_name?: string | null
          sheet_width_in?: number | null
          system_type?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          license_state: string | null
          license_type: string | null
          pe_license: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          license_state?: string | null
          license_type?: string | null
          pe_license?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          license_state?: string | null
          license_type?: string | null
          pe_license?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strap_calculations: {
        Row: {
          created_at: string
          id: string
          inputs_json: Json
          name: string
          project_id: string | null
          results_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs_json?: Json
          name?: string
          project_id?: string | null
          results_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs_json?: Json
          name?: string
          project_id?: string | null
          results_json?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strap_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tas105_tests: {
        Row: {
          created_at: string
          deck_condition: string | null
          deck_type: string | null
          fastener_calculation_id: string
          id: string
          mcrf_lbf: number | null
          mean_lbf: number | null
          n_samples: number | null
          notes: string | null
          pass_275: boolean | null
          raw_values_lbf: number[] | null
          std_dev_lbf: number | null
          t_factor: number | null
          test_date: string | null
          test_location_description: string | null
          testing_agency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_condition?: string | null
          deck_type?: string | null
          fastener_calculation_id: string
          id?: string
          mcrf_lbf?: number | null
          mean_lbf?: number | null
          n_samples?: number | null
          notes?: string | null
          pass_275?: boolean | null
          raw_values_lbf?: number[] | null
          std_dev_lbf?: number | null
          t_factor?: number | null
          test_date?: string | null
          test_location_description?: string | null
          testing_agency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deck_condition?: string | null
          deck_type?: string | null
          fastener_calculation_id?: string
          id?: string
          mcrf_lbf?: number | null
          mean_lbf?: number | null
          n_samples?: number | null
          notes?: string | null
          pass_275?: boolean | null
          raw_values_lbf?: number[] | null
          std_dev_lbf?: number | null
          t_factor?: number | null
          test_date?: string | null
          test_location_description?: string | null
          testing_agency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tas105_tests_fastener_calculation_id_fkey"
            columns: ["fastener_calculation_id"]
            isOneToOne: false
            referencedRelation: "fastener_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      wind_calculations: {
        Row: {
          created_at: string
          id: string
          inputs_json: Json
          name: string
          notes: string | null
          project_id: string
          results_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs_json?: Json
          name?: string
          notes?: string | null
          project_id: string
          results_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs_json?: Json
          name?: string
          notes?: string | null
          project_id?: string
          results_json?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wind_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
