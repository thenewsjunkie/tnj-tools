export interface AudioConversationsTable {
  Row: {
    id: string
    question_audio_url: string | null
    answer_audio_url: string | null
    question_text: string | null
    answer_text: string | null
    created_at: string | null
  }
  Insert: {
    id?: string
    question_audio_url?: string | null
    answer_audio_url?: string | null
    question_text?: string | null
    answer_text?: string | null
    created_at?: string | null
  }
  Update: {
    id?: string
    question_audio_url?: string | null
    answer_audio_url?: string | null
    question_text?: string | null
    answer_text?: string | null
    created_at?: string | null
  }
  Relationships: []
}

export interface CallSessionsTable {
  Row: {
    id: string
    caller_name: string
    topic: string | null
    status: "waiting" | "connected" | "ended" | null
    is_muted: boolean | null
    started_at: string | null
    ended_at: string | null
    connection_quality: string | null
    created_at: string | null
  }
  Insert: {
    id?: string
    caller_name: string
    topic?: string | null
    status?: "waiting" | "connected" | "ended" | null
    is_muted?: boolean | null
    started_at?: string | null
    ended_at?: string | null
    connection_quality?: string | null
    created_at?: string | null
  }
  Update: {
    id?: string
    caller_name?: string
    topic?: string | null
    status?: "waiting" | "connected" | "ended" | null
    is_muted?: boolean | null
    started_at?: string | null
    ended_at?: string | null
    connection_quality?: string | null
    created_at?: string | null
  }
  Relationships: []
}