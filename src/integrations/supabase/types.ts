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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          processing_started_at: string | null
          scheduled_completion: string | null
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
          processing_started_at?: string | null
          scheduled_completion?: string | null
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
          processing_started_at?: string | null
          scheduled_completion?: string | null
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
          is_detailed: boolean | null
          is_simple: boolean | null
          question_text: string
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
          is_detailed?: boolean | null
          is_simple?: boolean | null
          question_text: string
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
          is_detailed?: boolean | null
          is_simple?: boolean | null
          question_text?: string
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
      digital_client_profiles: {
        Row: {
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          email: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["digital_client_status"] | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["digital_client_status"] | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["digital_client_status"] | null
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
      rejoins: {
        Row: {
          audio_url: string
          color: string
          created_at: string
          display_order: number
          duration: number | null
          id: string
          title: string
          trim_end: number | null
          trim_start: number
          updated_at: string
          volume: number
        }
        Insert: {
          audio_url: string
          color?: string
          created_at?: string
          display_order?: number
          duration?: number | null
          id?: string
          title: string
          trim_end?: number | null
          trim_start?: number
          updated_at?: string
          volume?: number
        }
        Update: {
          audio_url?: string
          color?: string
          created_at?: string
          display_order?: number
          duration?: number | null
          id?: string
          title?: string
          trim_end?: number | null
          trim_start?: number
          updated_at?: string
          volume?: number
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
      scheduled_segments: {
        Row: {
          created_at: string | null
          days: number[]
          hour_block: string
          id: string
          is_active: boolean | null
          name: string
          time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days?: number[]
          hour_block: string
          id?: string
          is_active?: boolean | null
          name: string
          time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days?: number[]
          hour_block?: string
          id?: string
          is_active?: boolean | null
          name?: string
          time?: string
          updated_at?: string | null
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
      show_prep_notes: {
        Row: {
          and_topic: string | null
          created_at: string
          date: string
          from_topic: string | null
          id: string
          last_minute_from: string | null
          to_topic: string | null
          topics: Json
          updated_at: string
        }
        Insert: {
          and_topic?: string | null
          created_at?: string
          date: string
          from_topic?: string | null
          id?: string
          last_minute_from?: string | null
          to_topic?: string | null
          topics?: Json
          updated_at?: string
        }
        Update: {
          and_topic?: string | null
          created_at?: string
          date?: string
          from_topic?: string | null
          id?: string
          last_minute_from?: string | null
          to_topic?: string | null
          topics?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sound_effects: {
        Row: {
          audio_url: string
          color: string
          created_at: string
          display_order: number
          duration: number | null
          id: string
          title: string
          trim_end: number | null
          trim_start: number
          updated_at: string
          volume: number
        }
        Insert: {
          audio_url: string
          color?: string
          created_at?: string
          display_order?: number
          duration?: number | null
          id?: string
          title: string
          trim_end?: number | null
          trim_start?: number
          updated_at?: string
          volume?: number
        }
        Update: {
          audio_url?: string
          color?: string
          created_at?: string
          display_order?: number
          duration?: number | null
          id?: string
          title?: string
          trim_end?: number | null
          trim_start?: number
          updated_at?: string
          volume?: number
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
      tnj_gifs: {
        Row: {
          created_at: string
          gif_url: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gif_url: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gif_url?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
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
      video_resources: {
        Row: {
          created_at: string
          display_order: number
          id: string
          thumbnail_url: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          thumbnail_url?: string | null
          title: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      weekend_segments: {
        Row: {
          am_segment1: string | null
          am_segment2: string | null
          am_segment3: string | null
          am_segment4: string | null
          am_segment5: string | null
          am_segment6: string | null
          am_segment7: string | null
          am_segment8: string | null
          best_of_notes: string | null
          created_at: string | null
          hour1_segment1: string | null
          hour1_segment2: string | null
          hour1_segment3: string | null
          id: string
          updated_at: string | null
          week_start: string
        }
        Insert: {
          am_segment1?: string | null
          am_segment2?: string | null
          am_segment3?: string | null
          am_segment4?: string | null
          am_segment5?: string | null
          am_segment6?: string | null
          am_segment7?: string | null
          am_segment8?: string | null
          best_of_notes?: string | null
          created_at?: string | null
          hour1_segment1?: string | null
          hour1_segment2?: string | null
          hour1_segment3?: string | null
          id?: string
          updated_at?: string | null
          week_start: string
        }
        Update: {
          am_segment1?: string | null
          am_segment2?: string | null
          am_segment3?: string | null
          am_segment4?: string | null
          am_segment5?: string | null
          am_segment6?: string | null
          am_segment7?: string | null
          am_segment8?: string | null
          best_of_notes?: string | null
          created_at?: string | null
          hour1_segment1?: string | null
          hour1_segment2?: string | null
          hour1_segment3?: string | null
          id?: string
          updated_at?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_complete_displayed_conversations: { Args: never; Returns: undefined }
      cleanup_stale_alerts: { Args: never; Returns: undefined }
      get_next_alert: {
        Args: never
        Returns: {
          alert_id: string
          id: string
          scheduled_for: string
          username: string
        }[]
      }
      get_next_conversation: { Args: never; Returns: string }
      increment_poll_option_votes: {
        Args: { option_id: string }
        Returns: undefined
      }
      is_digital_client_admin: { Args: { _user_id: string }; Returns: boolean }
      manage_conversation_queue: { Args: never; Returns: undefined }
      mark_as_displayed: {
        Args: { conversation_id: string }
        Returns: undefined
      }
      run_queue_management: { Args: never; Returns: undefined }
      update_contestant_score:
        | {
            Args: {
              p_contestant_name: string
              p_current_version: number
              p_increment: boolean
            }
            Returns: {
              new_score: number
              new_version: number
              success: boolean
            }[]
          }
        | {
            Args: {
              p_auth_token: string
              p_contestant_name: string
              p_current_version: number
              p_increment: boolean
            }
            Returns: {
              new_score: number
              new_version: number
              success: boolean
            }[]
          }
    }
    Enums: {
      alert_type: "standard" | "message" | "gift"
      call_status: "waiting" | "connected" | "ended"
      digital_client_status: "active" | "inactive" | "pending"
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
      social_media_platform:
        | "facebook"
        | "instagram"
        | "x"
        | "tiktok"
        | "youtube"
        | "website"
        | "snapchat"
        | "venmo"
        | "cashapp"
      user_role: "admin" | "client"
      voting_platform: "twitch" | "youtube" | "web"
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
      alert_type: ["standard", "message", "gift"],
      call_status: ["waiting", "connected", "ended"],
      digital_client_status: ["active", "inactive", "pending"],
      employment_status: [
        "full_time",
        "part_time",
        "self_employed",
        "unemployed",
        "student",
        "retired",
      ],
      income_bracket: [
        "under_25k",
        "25k_50k",
        "50k_75k",
        "75k_100k",
        "100k_150k",
        "over_150k",
      ],
      lower_third_type: ["news", "guest", "topic", "breaking"],
      marital_status: [
        "single",
        "married",
        "divorced",
        "widowed",
        "separated",
        "domestic_partnership",
      ],
      poll_status: ["draft", "active", "completed"],
      review_type: ["television", "movie", "food", "product", "message"],
      social_media_platform: [
        "facebook",
        "instagram",
        "x",
        "tiktok",
        "youtube",
        "website",
        "snapchat",
        "venmo",
        "cashapp",
      ],
      user_role: ["admin", "client"],
      voting_platform: ["twitch", "youtube", "web"],
    },
  },
} as const
