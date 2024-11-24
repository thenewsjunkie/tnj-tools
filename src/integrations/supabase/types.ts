export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      follower_history: {
        Row: {
          id: string
          recorded_at: string | null
          total_followers: number
        }
        Insert: {
          id?: string
          recorded_at?: string | null
          total_followers: number
        }
        Update: {
          id?: string
          recorded_at?: string | null
          total_followers?: number
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
    }
    Functions: {
      claim_screen_share_role: {
        Args: {
          p_session_id: string
          p_device_id: string
          p_share_code: string
        }
        Returns: Database['public']['Tables']['screen_share_sessions']['Row']
      }
      create_screen_share_session: {
        Args: {
          p_share_code: string
          p_expires_at: string
        }
        Returns: Database['public']['Tables']['screen_share_sessions']['Row']
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
