export interface ProfilesTable {
  Row: {
    id: string
    email: string | null
    created_at: string | null
    approved_at: string | null
    status: string | null
    role: string | null
    timezone: string
  }
  Insert: {
    id: string
    email?: string | null
    created_at?: string | null
    approved_at?: string | null
    status?: string | null
    role?: string | null
    timezone?: string
  }
  Update: {
    id?: string
    email?: string | null
    created_at?: string | null
    approved_at?: string | null
    status?: string | null
    role?: string | null
    timezone?: string
  }
  Relationships: []
}

export interface ReviewsTable {
  Row: {
    id: string
    type: "television" | "movie" | "food" | "product"
    title: string
    rating: number
    content: string
    created_at: string | null
    genre: string | null
    image_urls: string[] | null
  }
  Insert: {
    id?: string
    type: "television" | "movie" | "food" | "product"
    title: string
    rating: number
    content: string
    created_at?: string | null
    genre?: string | null
    image_urls?: string[] | null
  }
  Update: {
    id?: string
    type?: "television" | "movie" | "food" | "product"
    title?: string
    rating?: number
    content?: string
    created_at?: string | null
    genre?: string | null
    image_urls?: string[] | null
  }
  Relationships: []
}