export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_data: Json | null
          id: string
          ip_address: string | null
          previous_data: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_data?: Json | null
          id?: string
          ip_address?: string | null
          previous_data?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_data?: Json | null
          id?: string
          ip_address?: string | null
          previous_data?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          fixed_subsidy_amount: number | null
          id: string
          logo: string | null
          name: string
          provider_id: string | null
          subsidy_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixed_subsidy_amount?: number | null
          id?: string
          logo?: string | null
          name: string
          provider_id?: string | null
          subsidy_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixed_subsidy_amount?: number | null
          id?: string
          logo?: string | null
          name?: string
          provider_id?: string | null
          subsidy_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      lunch_options: {
        Row: {
          available: boolean | null
          category_id: string | null
          created_at: string | null
          description: string
          id: string
          image: string
          is_extra: boolean | null
          menu_type: string | null
          name: string
          price: number
          provider_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          image: string
          is_extra?: boolean | null
          menu_type?: string | null
          name: string
          price: number
          provider_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          is_extra?: boolean | null
          menu_type?: string | null
          name?: string
          price?: number
          provider_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lunch_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lunch_options_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_components: {
        Row: {
          component_option_id: string
          created_at: string | null
          id: string
          lunch_option_id: string
          updated_at: string | null
        }
        Insert: {
          component_option_id: string
          created_at?: string | null
          id?: string
          lunch_option_id: string
          updated_at?: string | null
        }
        Update: {
          component_option_id?: string
          created_at?: string | null
          id?: string
          lunch_option_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_components_component_option_id_fkey"
            columns: ["component_option_id"]
            isOneToOne: false
            referencedRelation: "lunch_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_components_lunch_option_id_fkey"
            columns: ["lunch_option_id"]
            isOneToOne: false
            referencedRelation: "lunch_options"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          provider_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          provider_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          provider_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_extras: {
        Row: {
          created_at: string | null
          id: string
          lunch_option_id: string
          order_id: string
          price: number
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lunch_option_id: string
          order_id: string
          price: number
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lunch_option_id?: string
          order_id?: string
          price?: number
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_extras_lunch_option_id_fkey"
            columns: ["lunch_option_id"]
            isOneToOne: false
            referencedRelation: "lunch_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_extras_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_by: string | null
          company_id: string
          created_at: string | null
          date: string
          id: string
          lunch_option_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          company_id: string
          created_at?: string | null
          date: string
          id?: string
          lunch_option_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string | null
          company_id?: string
          created_at?: string | null
          date?: string
          id?: string
          lunch_option_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_lunch_option_id_fkey"
            columns: ["lunch_option_id"]
            isOneToOne: false
            referencedRelation: "lunch_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          beta_features: boolean
          created_at: string | null
          dark_mode: boolean
          default_language: string
          email_notifications: boolean
          id: string
          multi_factor_auth: boolean
          order_updates: boolean
          password_policy: string
          provider_id: string | null
          security_alerts: boolean
          session_timeout: number
          system_name: string
          updated_at: string | null
          user_registration_alerts: boolean
        }
        Insert: {
          beta_features?: boolean
          created_at?: string | null
          dark_mode?: boolean
          default_language?: string
          email_notifications?: boolean
          id?: string
          multi_factor_auth?: boolean
          order_updates?: boolean
          password_policy?: string
          provider_id?: string | null
          security_alerts?: boolean
          session_timeout?: number
          system_name?: string
          updated_at?: string | null
          user_registration_alerts?: boolean
        }
        Update: {
          beta_features?: boolean
          created_at?: string | null
          dark_mode?: boolean
          default_language?: string
          email_notifications?: boolean
          id?: string
          multi_factor_auth?: boolean
          order_updates?: boolean
          password_policy?: string
          provider_id?: string | null
          security_alerts?: boolean
          session_timeout?: number
          system_name?: string
          updated_at?: string | null
          user_registration_alerts?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          provider_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          provider_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          address_line_1: string | null
          address_line_2: string | null
          business_name: string
          city: string | null
          contact_email: string
          contact_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email_signature: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          logo: string | null
          logo_url: string | null
          rnc: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          business_name: string
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email_signature?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo?: string | null
          logo_url?: string | null
          rnc?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          business_name?: string
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email_signature?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo?: string | null
          logo_url?: string | null
          rnc?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_audit_logs: {
        Row: {
          action: string | null
          changed_data: Json | null
          id: string | null
          ip_address: string | null
          previous_data: Json | null
          record_id: string | null
          table_name: string | null
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_provider_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "provider" | "supervisor" | "employee" | "company"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "provider", "supervisor", "employee", "company"],
    },
  },
} as const
