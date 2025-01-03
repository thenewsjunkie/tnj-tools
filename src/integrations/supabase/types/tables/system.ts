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
}

export interface LeaderboardVisibilityValue {
  isVisible: boolean
}