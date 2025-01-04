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
      alert_queue: {
        Row: {
          alert_id: string
          created_at: string
          gift_count: number | null
          id: string
          played_at: string | null
          status: string
          username: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string
          gift_count?: number | null
          id?: string
          played_at?: string | null
          status?: string
          username?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string
          gift_count?: number | null
          id?: string
          played_at?: string | null
          status?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_queue_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          font_size: number | null
          gift_count_animation_speed: number | null
          gift_count_color: string | null
          gift_text_color: string | null
          id: string
          is_gift_alert: boolean | null
          media_type: string
          media_url: string
          message_enabled: boolean | null
          message_text: string | null
          title: string
        }
        Insert: {
          created_at?: string
          font_size?: number | null
          gift_count_animation_speed?: number | null
          gift_count_color?: string | null
          gift_text_color?: string | null
          id?: string
          is_gift_alert?: boolean | null
          media_type: string
          media_url: string
          message_enabled?: boolean | null
          message_text?: string | null
          title: string
        }
        Update: {
          created_at?: string
          font_size?: number | null
          gift_count_animation_speed?: number | null
          gift_count_color?: string | null
          gift_text_color?: string | null
          id?: string
          is_gift_alert?: boolean | null
          media_type?: string
          media_url?: string
          message_enabled?: boolean | null
          message_text?: string | null
          title?: string
        }
        Relationships: []
      }
      bot_instances: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_heartbeat: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_heartbeat?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_heartbeat?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fritz_contestants: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string | null
          position: number | null
          score: number | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          position?: number | null
          score?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          position?: number | null
          score?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      fritz_default_contestants: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fritz_yearly_scores: {
        Row: {
          contestant_name: string
          created_at: string | null
          id: string
          total_score: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          contestant_name: string
          created_at?: string | null
          id?: string
          total_score?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          contestant_name?: string
          created_at?: string | null
          id?: string
          total_score?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      gift_history: {
        Row: {
          alert_queue_id: string | null
          created_at: string | null
          gift_count: number
          gifter_username: string
          id: string
        }
        Insert: {
          alert_queue_id?: string | null
          created_at?: string | null
          gift_count: number
          gifter_username: string
          id?: string
        }
        Update: {
          alert_queue_id?: string | null
          created_at?: string | null
          gift_count?: number
          gifter_username?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_history_alert_queue_id_fkey"
            columns: ["alert_queue_id"]
            isOneToOne: false
            referencedRelation: "alert_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_stats: {
        Row: {
          created_at: string | null
          id: string
          is_test_data: boolean
          last_gift_date: string | null
          monthly_gifts: Json | null
          total_gifts: number | null
          updated_at: string | null
          username: string
          yearly_gifts: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_test_data?: boolean
          last_gift_date?: string | null
          monthly_gifts?: Json | null
          total_gifts?: number | null
          updated_at?: string | null
          username: string
          yearly_gifts?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_test_data?: boolean
          last_gift_date?: string | null
          monthly_gifts?: Json | null
          total_gifts?: number | null
          updated_at?: string | null
          username?: string
          yearly_gifts?: Json | null
        }
        Relationships: []
      }
      instructions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lower_thirds: {
        Row: {
          created_at: string | null
          display_order: number
          guest_image_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_text: string | null
          secondary_text: string | null
          show_time: boolean | null
          style_config: Json | null
          ticker_text: string | null
          title: string
          type: Database["public"]["Enums"]["lower_third_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          guest_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_text?: string | null
          secondary_text?: string | null
          show_time?: boolean | null
          style_config?: Json | null
          ticker_text?: string | null
          title: string
          type?: Database["public"]["Enums"]["lower_third_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          guest_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_text?: string | null
          secondary_text?: string | null
          show_time?: boolean | null
          style_config?: Json | null
          ticker_text?: string | null
          title?: string
          type?: Database["public"]["Enums"]["lower_third_type"]
          updated_at?: string | null
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
      news_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          status: string | null
          timezone: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          status?: string | null
          timezone?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          status?: string | null
          timezone?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          genre: string | null
          id: string
          image_urls: string[] | null
          rating: number
          title: string
          type: Database["public"]["Enums"]["review_type"]
        }
        Insert: {
          content: string
          created_at?: string | null
          genre?: string | null
          id?: string
          image_urls?: string[] | null
          rating: number
          title: string
          type: Database["public"]["Enums"]["review_type"]
        }
        Update: {
          content?: string
          created_at?: string | null
          genre?: string | null
          id?: string
          image_urls?: string[] | null
          rating?: number
          title?: string
          type?: Database["public"]["Enums"]["review_type"]
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
          target: string
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
          target?: string
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
          target?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      triggers: {
        Row: {
          created_at: string
          id: string
          link: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          title?: string
        }
        Relationships: []
      }
      twitch_channel_emotes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          urls: Json
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          urls: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          urls?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_contestant_score: {
        Args: {
          p_contestant_name: string
          p_increment: boolean
          p_current_version: number
        }
        Returns: {
          success: boolean
          new_score: number
          new_version: number
        }[]
      }
    }
    Enums: {
      call_status: "waiting" | "connected" | "ended"
      employment_status:
        | "full_time"
        | "part_time"
        | "self_employed"
        | "unemployed"
        | "student"
        | "retired"
      income_bracket:
        | "under_25k"
        | "25k_50k"
        | "50k_75k"
        | "75k_100k"
        | "100k_150k"
        | "over_150k"
      lower_third_type: "news" | "guest" | "topic" | "breaking"
      marital_status:
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "separated"
        | "domestic_partnership"
      review_type: "television" | "movie" | "food" | "product"
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
