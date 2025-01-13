export interface Alert {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  message_text?: string | null;
  message_enabled?: boolean | null;
  font_size?: number | null;
  is_gift_alert?: boolean | null;
  gift_count_animation_speed?: number | null;
  gift_text_color?: string | null;
  gift_count_color?: string | null;
  display_duration?: number | null;
  created_at: string;
}

export interface AlertQueueTable {
  Row: {
    created_at: string;
    id: string;
    alert_id: string;
    status: string;
    username: string | null;
    played_at: string | null;
  };
  Insert: {
    created_at?: string;
    id?: string;
    alert_id: string;
    status?: string;
    username?: string | null;
    played_at?: string | null;
  };
  Update: {
    created_at?: string;
    id?: string;
    alert_id?: string;
    status?: string;
    username?: string | null;
    played_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "alert_queue_alert_id_fkey";
      columns: ["alert_id"];
      isOneToOne: false;
      referencedRelation: "alerts";
      referencedColumns: ["id"];
    }
  ];
}

export interface AlertsTable {
  Row: {
    created_at: string;
    id: string;
    title: string;
    media_url: string;
    media_type: string;
    message_text: string | null;
    message_enabled: boolean | null;
    font_size: number | null;
    is_gift_alert: boolean | null;
    gift_count_animation_speed: number | null;
    gift_text_color: string | null;
    gift_count_color: string | null;
    display_duration: number | null;
  };
  Insert: {
    created_at?: string;
    id?: string;
    title: string;
    media_url: string;
    media_type: string;
    message_text?: string | null;
    message_enabled?: boolean | null;
    font_size?: number | null;
    is_gift_alert?: boolean | null;
    gift_count_animation_speed?: number | null;
    gift_text_color?: string | null;
    gift_count_color?: string | null;
    display_duration?: number | null;
  };
  Update: {
    created_at?: string;
    id?: string;
    title?: string;
    media_url?: string;
    media_type?: string;
    message_text?: string | null;
    message_enabled?: boolean | null;
    font_size?: number | null;
    is_gift_alert?: boolean | null;
    gift_count_animation_speed?: number | null;
    gift_text_color?: string | null;
    gift_count_color?: string | null;
    display_duration?: number | null;
  };
  Relationships: [];
}