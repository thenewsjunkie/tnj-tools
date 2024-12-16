export interface CodeImplementationsTable {
  Row: {
    id: string
    filename: string
    code: string
    target_page: string
    prompt: string
    created_at: string | null
    status: string | null
  }
  Insert: {
    id?: string
    filename: string
    code: string
    target_page: string
    prompt: string
    created_at?: string | null
    status?: string | null
  }
  Update: {
    id?: string
    filename?: string
    code?: string
    target_page?: string
    prompt?: string
    created_at?: string | null
    status?: string | null
  }
  Relationships: []
}

export interface CodeVersionsTable {
  Row: {
    id: string
    commit_hash: string
    commit_message: string
    changes: Json
    created_at: string | null
    status: string | null
    prompt: string
    branch_name: string
  }
  Insert: {
    id?: string
    commit_hash: string
    commit_message: string
    changes: Json
    created_at?: string | null
    status?: string | null
    prompt: string
    branch_name: string
  }
  Update: {
    id?: string
    commit_hash?: string
    commit_message?: string
    changes?: Json
    created_at?: string | null
    status?: string | null
    prompt?: string
    branch_name?: string
  }
  Relationships: []
}