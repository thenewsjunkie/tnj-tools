export interface NewsRoundupsTable {
  Row: {
    id: string
    content: string
    sources: Json | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    content: string
    sources?: Json | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    content?: string
    sources?: Json | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: []
}

export interface NewsSourcesTable {
  Row: {
    id: string
    name: string
    url: string
    is_active: boolean | null
    created_at: string | null
  }
  Insert: {
    id?: string
    name: string
    url: string
    is_active?: boolean | null
    created_at?: string | null
  }
  Update: {
    id?: string
    name?: string
    url?: string
    is_active?: boolean | null
    created_at?: string | null
  }
  Relationships: []
}

export interface ShowNotesTable {
  Row: {
    id: string
    type: string
    content: string | null
    title: string | null
    url: string | null
    created_at: string | null
  }
  Insert: {
    id?: string
    type: string
    content?: string | null
    title?: string | null
    url?: string | null
    created_at?: string | null
  }
  Update: {
    id?: string
    type?: string
    content?: string | null
    title?: string | null
    url?: string | null
    created_at?: string | null
  }
  Relationships: []
}