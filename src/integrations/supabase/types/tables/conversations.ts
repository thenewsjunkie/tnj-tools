export interface AudioConversationsTable {
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