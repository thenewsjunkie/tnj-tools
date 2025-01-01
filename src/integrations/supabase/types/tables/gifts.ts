import { Json } from '../helpers';

export interface GiftStats {
  id: string;
  username: string;
  total_gifts: number | null;
  last_gift_date: string | null;
  monthly_gifts: Record<string, number>;
  yearly_gifts: Record<string, number>;
  created_at: string | null;
  updated_at: string | null;
  is_test_data: boolean;
}

export interface GiftHistory {
  id: string;
  gifter_username: string;
  gift_count: number;
  alert_queue_id: string | null;
  created_at: string | null;
}

export interface GiftStatsTable {
  Row: GiftStats;
  Insert: Omit<GiftStats, 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<GiftStats, 'id' | 'created_at' | 'updated_at'>>;
}

export interface GiftHistoryTable {
  Row: GiftHistory;
  Insert: Omit<GiftHistory, 'id' | 'created_at'>;
  Update: Partial<Omit<GiftHistory, 'id' | 'created_at'>>;
}