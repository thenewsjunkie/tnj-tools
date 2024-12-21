export interface Alert {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  message_text?: string | null;
  message_enabled?: boolean | null;
  font_size?: number | null;
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
  };
  Relationships: [];
}