export interface GiftStats {
  id: string;
  username: string;
  total_gifts: number;
  last_gift_date: string | null;
  monthly_gifts: Record<string, number>;
  yearly_gifts: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface GiftHistory {
  id: string;
  gifter_username: string;
  gift_count: number;
  alert_queue_id: string | null;
  created_at: string;
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