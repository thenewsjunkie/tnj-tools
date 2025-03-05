
export interface AudioConversationsTable {
  Row: {
    created_at: string | null
    id: string
    status: string
    title: string | null
    updated_at: string | null
    answer_text: string
    question_text: string
    conversation_state: string
  }
  Insert: {
    created_at?: string | null
    id?: string
    status?: string
    title?: string | null
    updated_at?: string | null
    answer_text: string
    question_text: string
    conversation_state?: string
  }
  Update: {
    created_at?: string | null
    id?: string
    status?: string
    title?: string | null
    updated_at?: string | null
    answer_text?: string
    question_text?: string
    conversation_state?: string
  }
}

export interface CallSessionsTable {
  Row: {
    created_at: string | null
    id: string
    status: string
    title: string | null
    updated_at: string | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    status?: string
    title?: string | null
    updated_at?: string | null
  }
  Update: {
    created_at?: string | null
    id?: string
    status?: string
    title?: string | null
    updated_at?: string | null
  }
}
