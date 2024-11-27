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
      audio_conversations: {
        Row: {
          answer_audio_url: string | null
          answer_text: string | null
          created_at: string | null
          id: string
          question_audio_url: string | null
          question_text: string | null
        }
        Insert: {
          answer_audio_url?: string | null
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_audio_url?: string | null
          question_text?: string | null
        }
        Update: {
          answer_audio_url?: string | null
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_audio_url?: string | null
          question_text?: string | null
        }
        Relationships: []
      }
      interview_requests: {
        Row: {
          conversation_history: Json | null
          created_at: string | null
          email_script: string
          guest_email: string
          id: string
          scheduled_date: string | null
          status: string
        }
        Insert: {
          conversation_history?: Json | null
          created_at?: string | null
          email_script: string
          guest_email: string
          id?: string
          scheduled_date?: string | null
          status?: string
        }
        Update: {
          conversation_history?: Json | null
          created_at?: string | null
          email_script?: string
          guest_email?: string
          id?: string
          scheduled_date?: string | null
          status?: string
        }
        Relationships: []
      }
      news_roundups: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sources: Json | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sources?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sources?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          datetime: string
          id: string
          is_active: boolean | null
          recurring_weekly: boolean | null
          text: string
        }
        Insert: {
          created_at?: string | null
          datetime: string
          id?: string
          is_active?: boolean | null
          recurring_weekly?: boolean | null
          text: string
        }
        Update: {
          created_at?: string | null
          datetime?: string
          id?: string
          is_active?: boolean | null
          recurring_weekly?: boolean | null
          text?: string
        }
        Relationships: []
      }
      screen_share_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          host_connected: boolean | null
          host_device_id: string | null
          id: string
          is_active: boolean | null
          room_id: string | null
          share_code: string
          viewer_connected: boolean | null
          viewer_device_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          host_connected?: boolean | null
          host_device_id?: string | null
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          share_code: string
          viewer_connected?: boolean | null
          viewer_device_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          host_connected?: boolean | null
          host_device_id?: string | null
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          share_code?: string
          viewer_connected?: boolean | null
          viewer_device_id?: string | null
        }
        Relationships: []
      }
      show_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          type: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          type: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      tnj_links: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          last_checked: string | null
          status: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          last_checked?: string | null
          status?: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          last_checked?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_screen_share_role: {
        Args: {
          p_session_id: string
          p_device_id: string
          p_share_code: string
        }
        Returns: {
          created_at: string | null
          expires_at: string
          host_connected: boolean | null
          host_device_id: string | null
          id: string
          is_active: boolean | null
          room_id: string | null
          share_code: string
          viewer_connected: boolean | null
          viewer_device_id: string | null
        }
      }
      create_screen_share_session: {
        Args: {
          p_share_code: string
          p_expires_at: string
        }
        Returns: {
          created_at: string | null
          expires_at: string
          host_connected: boolean | null
          host_device_id: string | null
          id: string
          is_active: boolean | null
          room_id: string | null
          share_code: string
          viewer_connected: boolean | null
          viewer_device_id: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
