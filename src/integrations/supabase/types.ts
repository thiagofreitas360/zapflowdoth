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
      active_funnels: {
        Row: {
          created_at: string
          current_step_index: number | null
          funnel_id: string
          id: string
          is_completed: boolean | null
          lead_id: string
          remaining_seconds: number | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step_index?: number | null
          funnel_id: string
          id?: string
          is_completed?: boolean | null
          lead_id: string
          remaining_seconds?: number | null
          start_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step_index?: number | null
          funnel_id?: string
          id?: string
          is_completed?: boolean | null
          lead_id?: string
          remaining_seconds?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_funnels_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_funnels_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_steps: {
        Row: {
          content: string
          created_at: string
          delay_minutes: number | null
          file_name: string | null
          file_url: string | null
          funnel_id: string
          id: string
          order_position: number | null
          question_settings: Json | null
          show_typing: boolean | null
          type: Database["public"]["Enums"]["step_type"]
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          delay_minutes?: number | null
          file_name?: string | null
          file_url?: string | null
          funnel_id: string
          id?: string
          order_position?: number | null
          question_settings?: Json | null
          show_typing?: boolean | null
          type?: Database["public"]["Enums"]["step_type"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          delay_minutes?: number | null
          file_name?: string | null
          file_url?: string | null
          funnel_id?: string
          id?: string
          order_position?: number | null
          question_settings?: Json | null
          show_typing?: boolean | null
          type?: Database["public"]["Enums"]["step_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_steps_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          color: string
          conversions: number | null
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
          order_position: number | null
          total_duration_seconds: number | null
          total_sent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          conversions?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          order_position?: number | null
          total_duration_seconds?: number | null
          total_sent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          conversions?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          order_position?: number | null
          total_duration_seconds?: number | null
          total_sent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_label_junction: {
        Row: {
          created_at: string
          id: string
          label_id: string
          lead_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_id: string
          lead_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label_id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_label_junction_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "lead_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_label_junction_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          arrival_date: string | null
          arrival_source: Database["public"]["Enums"]["arrival_source"] | null
          avatar_url: string | null
          created_at: string
          has_purchased: boolean | null
          id: string
          is_pinned: boolean | null
          is_saved: boolean | null
          last_message: string | null
          last_message_time: string | null
          name: string | null
          phone: string
          status: Database["public"]["Enums"]["lead_status"] | null
          unread_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_date?: string | null
          arrival_source?: Database["public"]["Enums"]["arrival_source"] | null
          avatar_url?: string | null
          created_at?: string
          has_purchased?: boolean | null
          id?: string
          is_pinned?: boolean | null
          is_saved?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          name?: string | null
          phone: string
          status?: Database["public"]["Enums"]["lead_status"] | null
          unread_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_date?: string | null
          arrival_source?: Database["public"]["Enums"]["arrival_source"] | null
          avatar_url?: string | null
          created_at?: string
          has_purchased?: boolean | null
          id?: string
          is_pinned?: boolean | null
          is_saved?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          name?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"] | null
          unread_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          file_name: string | null
          file_url: string | null
          id: string
          lead_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          timestamp: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          content: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          file_name?: string | null
          file_url?: string | null
          id?: string
          lead_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          content?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          file_name?: string | null
          file_url?: string | null
          id?: string
          lead_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          timestamp?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          email: string | null
          id: string
          meta_api_key: string | null
          notify_conversions: boolean | null
          notify_new_messages: boolean | null
          notify_weekly_report: boolean | null
          phone_id: string | null
          profile_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          meta_api_key?: string | null
          notify_conversions?: boolean | null
          notify_new_messages?: boolean | null
          notify_weekly_report?: boolean | null
          phone_id?: string | null
          profile_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          meta_api_key?: string | null
          notify_conversions?: boolean | null
          notify_new_messages?: boolean | null
          notify_weekly_report?: boolean | null
          phone_id?: string | null
          profile_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      triggers: {
        Row: {
          action: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      settings_public: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          notify_conversions: boolean | null
          notify_new_messages: boolean | null
          notify_weekly_report: boolean | null
          profile_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          notify_conversions?: boolean | null
          notify_new_messages?: boolean | null
          notify_weekly_report?: boolean | null
          profile_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          notify_conversions?: boolean | null
          notify_new_messages?: boolean | null
          notify_weekly_report?: boolean | null
          profile_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      user_owns_active_funnel: {
        Args: { _active_funnel_id: string }
        Returns: boolean
      }
      user_owns_funnel: { Args: { _funnel_id: string }; Returns: boolean }
      user_owns_funnel_step: { Args: { _step_id: string }; Returns: boolean }
      user_owns_lead: { Args: { _lead_id: string }; Returns: boolean }
      user_owns_lead_label: { Args: { _label_id: string }; Returns: boolean }
      user_owns_message: { Args: { _message_id: string }; Returns: boolean }
    }
    Enums: {
      arrival_source: "meta_ads" | "organic" | "referral"
      lead_status: "hot" | "warm" | "cold"
      message_direction: "sent" | "received"
      message_status: "sent" | "delivered" | "read"
      message_type: "text" | "audio" | "image" | "document"
      step_type: "text" | "audio" | "image" | "document" | "delay" | "question"
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
    Enums: {
      arrival_source: ["meta_ads", "organic", "referral"],
      lead_status: ["hot", "warm", "cold"],
      message_direction: ["sent", "received"],
      message_status: ["sent", "delivered", "read"],
      message_type: ["text", "audio", "image", "document"],
      step_type: ["text", "audio", "image", "document", "delay", "question"],
    },
  },
} as const
