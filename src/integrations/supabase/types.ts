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
          completed_at: string | null
          created_at: string
          duration: number | null
          gift_count: number | null
          id: string
          last_heartbeat: string | null
          max_duration: number | null
          played_at: string | null
          scheduled_for: string | null
          state_changed_at: string | null
          status: string
          username: string | null
        }
        Insert: {
          alert_id: string
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          gift_count?: number | null
          id?: string
          last_heartbeat?: string | null
          max_duration?: number | null
          played_at?: string | null
          scheduled_for?: string | null
          state_changed_at?: string | null
          status?: string
          username?: string | null
        }
        Update: {
          alert_id?: string
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          gift_count?: number | null
          id?: string
          last_heartbeat?: string | null
          max_duration?: number | null
          played_at?: string | null
          scheduled_for?: string | null
          state_changed_at?: string | null
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
      alert_templates: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          content: string
          created_at: string | null
          id: string
          style_config: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          content: string
          created_at?: string | null
          id?: string
          style_config?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          content?: string
          created_at?: string | null
          id?: string
          style_config?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"] | null
          background_color: string | null
          background_gradient: Json | null
          created_at: string
          display_duration: number | null
          effects: Json | null
          font_family: string | null
          font_size: number | null
          gift_count_animation_speed: number | null
          gift_count_color: string | null
          gift_text_color: string | null
          id: string
          is_gift_alert: boolean | null
          is_message_alert: boolean | null
          is_template: boolean | null
          media_type: string
          media_url: string
          message_enabled: boolean | null
          message_text: string | null
          repeat_count: number | null
          repeat_delay: number | null
          text_alignment: string | null
          text_animation: string | null
          text_color: string | null
          text_shadow: Json | null
          title: string
          transition_type: string | null
        }
        Insert: {
          alert_type?: Database["public"]["Enums"]["alert_type"] | null
          background_color?: string | null
          background_gradient?: Json | null
          created_at?: string
          display_duration?: number | null
          effects?: Json | null
          font_family?: string | null
          font_size?: number | null
          gift_count_animation_speed?: number | null
          gift_count_color?: string | null
          gift_text_color?: string | null
          id?: string
          is_gift_alert?: boolean | null
          is_message_alert?: boolean | null
          is_template?: boolean | null
          media_type: string
          media_url: string
          message_enabled?: boolean | null
          message_text?: string | null
          repeat_count?: number | null
          repeat_delay?: number | null
          text_alignment?: string | null
          text_animation?: string | null
          text_color?: string | null
          text_shadow?: Json | null
          title: string
          transition_type?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"] | null
          background_color?: string | null
          background_gradient?: Json | null
          created_at?: string
          display_duration?: number | null
          effects?: Json | null
          font_family?: string | null
          font_size?: number | null
          gift_count_animation_speed?: number | null
          gift_count_color?: string | null
          gift_text_color?: string | null
          id?: string
          is_gift_alert?: boolean | null
          is_message_alert?: boolean | null
          is_template?: boolean | null
          media_type?: string
          media_url?: string
          message_enabled?: boolean | null
          message_text?: string | null
          repeat_count?: number | null
          repeat_delay?: number | null
          text_alignment?: string | null
          text_animation?: string | null
          text_color?: string | null
          text_shadow?: Json | null
          title?: string
          transition_type?: string | null
        }
        Relationships: []
      }
      audio_conversations: {
        Row: {
          answer_text: string
          conversation_state: string
          created_at: string | null
          display_count: number | null
          display_end_time: string | null
          display_start_time: string | null
          has_been_displayed: boolean | null
          id: string
          is_shown_in_obs: boolean | null
          question_text: string
          shown_in_obs_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          answer_text: string
          conversation_state?: string
          created_at?: string | null
          display_count?: number | null
          display_end_time?: string | null
          display_start_time?: string | null
          has_been_displayed?: boolean | null
          id?: string
          is_shown_in_obs?: boolean | null
          question_text: string
          shown_in_obs_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          answer_text?: string
          conversation_state?: string
          created_at?: string | null
          display_count?: number | null
          display_end_time?: string | null
          display_start_time?: string | null
          has_been_displayed?: boolean | null
          id?: string
          is_shown_in_obs?: boolean | null
          question_text?: string
          shown_in_obs_at?: string | null
          status?: string
          updated_at?: string | null
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
          auth_token: string | null
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
          auth_token?: string | null
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
          auth_token?: string | null
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
          activated_at: string | null
          created_at: string | null
          display_order: number
          duration_seconds: number | null
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
          activated_at?: string | null
          created_at?: string | null
          display_order: number
          duration_seconds?: number | null
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
          activated_at?: string | null
          created_at?: string | null
          display_order?: number
          duration_seconds?: number | null
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
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          poll_id: string | null
          text: string
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          poll_id?: string | null
          text: string
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          poll_id?: string | null
          text?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          platform: Database["public"]["Enums"]["voting_platform"]
          poll_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          platform: Database["public"]["Enums"]["voting_platform"]
          poll_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          platform?: Database["public"]["Enums"]["voting_platform"]
          poll_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          question: string
          status: Database["public"]["Enums"]["poll_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question: string
          status?: Database["public"]["Enums"]["poll_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question?: string
          status?: Database["public"]["Enums"]["poll_status"] | null
          updated_at?: string | null
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
      show_member_socials: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          platform: Database["public"]["Enums"]["social_media_platform"]
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          platform: Database["public"]["Enums"]["social_media_platform"]
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          platform?: Database["public"]["Enums"]["social_media_platform"]
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_member_socials_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "show_members"
            referencedColumns: ["id"]
          },
        ]
      }
      show_members: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
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
      video_bytes: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_complete_displayed_conversations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_stale_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_next_alert: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          alert_id: string
          username: string
          scheduled_for: string
        }[]
      }
      get_next_conversation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_poll_option_votes: {
        Args: {
          option_id: string
        }
        Returns: undefined
      }
      manage_conversation_queue: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_contestant_score:
        | {
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
        | {
            Args: {
              p_contestant_name: string
              p_increment: boolean
              p_current_version: number
              p_auth_token: string
            }
            Returns: {
              success: boolean
              new_score: number
              new_version: number
            }[]
          }
    }
    Enums: {
      alert_type: "standard" | "message" | "gift"
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
      poll_status: "draft" | "active" | "completed"
      review_type: "television" | "movie" | "food" | "product" | "message"
      social_media_platform: "facebook" | "instagram" | "x"
      voting_platform: "twitch" | "youtube"
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
