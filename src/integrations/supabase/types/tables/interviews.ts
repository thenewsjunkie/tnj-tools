import { Json } from '../helpers';

export interface InterviewRequestsTable {
  Row: {
    id: string
    guest_email: string
    email_script: string
    status: string
    created_at: string | null
    scheduled_date: string | null
    conversation_history: Json | null
  }
  Insert: {
    id?: string
    guest_email: string
    email_script: string
    status?: string
    created_at?: string | null
    scheduled_date?: string | null
    conversation_history?: Json | null
  }
  Update: {
    id?: string
    guest_email?: string
    email_script?: string
    status?: string
    created_at?: string | null
    scheduled_date?: string | null
    conversation_history?: Json | null
  }
  Relationships: []
}