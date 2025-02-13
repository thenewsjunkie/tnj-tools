
export interface ShowMembersTable {
  Row: {
    id: string
    name: string
    image_url: string | null
    created_at: string | null
    updated_at: string | null
    display_order: number
  }
  Insert: {
    id?: string
    name: string
    image_url?: string | null
    created_at?: string | null
    updated_at?: string | null
    display_order: number
  }
  Update: {
    id?: string
    name?: string
    image_url?: string | null
    created_at?: string | null
    updated_at?: string | null
    display_order?: number
  }
}

export interface ShowMemberSocialsTable {
  Row: {
    id: string
    member_id: string
    platform: 'facebook' | 'instagram' | 'x'
    url: string
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    member_id: string
    platform: 'facebook' | 'instagram' | 'x'
    url: string
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    member_id?: string
    platform?: 'facebook' | 'instagram' | 'x'
    url?: string
    created_at?: string | null
    updated_at?: string | null
  }
}
