export interface SystemSettingsTable {
  Row: {
    key: string
    value: Json
    updated_at: string
  }
  Insert: {
    key: string
    value: Json
    updated_at?: string
  }
  Update: {
    key?: string
    value?: Json
    updated_at?: string
  }
}

export interface TnjLinksTable {
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
}