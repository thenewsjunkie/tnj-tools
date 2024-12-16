import { Json } from '../helpers';

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
  Relationships: []
}

export interface TnjLinksTable {
  Row: {
    id: string
    title: string
    url: string
    status: string
    last_checked: string | null
    display_order: number
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    title: string
    url: string
    status?: string
    last_checked?: string | null
    display_order: number
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    title?: string
    url?: string
    status?: string
    last_checked?: string | null
    display_order?: number
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: []
}

export interface ScreenShareSessionsTable {
  Row: {
    id: string
    share_code: string
    created_at: string | null
    expires_at: string
    is_active: boolean | null
    room_id: string | null
    host_connected: boolean | null
    viewer_connected: boolean | null
    host_device_id: string | null
    viewer_device_id: string | null
  }
  Insert: {
    id?: string
    share_code: string
    created_at?: string | null
    expires_at: string
    is_active?: boolean | null
    room_id?: string | null
    host_connected?: boolean | null
    viewer_connected?: boolean | null
    host_device_id?: string | null
    viewer_device_id?: string | null
  }
  Update: {
    id?: string
    share_code?: string
    created_at?: string | null
    expires_at?: string
    is_active?: boolean | null
    room_id?: string | null
    host_connected?: boolean | null
    viewer_connected?: boolean | null
    host_device_id?: string | null
    viewer_device_id?: string | null
  }
  Relationships: []
}