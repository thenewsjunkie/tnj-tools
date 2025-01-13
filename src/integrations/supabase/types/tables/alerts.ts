// Base alert interface with common properties
interface BaseAlert {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  created_at: string;
}

// Alert display properties
interface AlertDisplayConfig {
  message_text?: string | null;
  message_enabled?: boolean | null;
  font_size?: number | null;
  display_duration?: number | null;
}

// Gift-specific alert properties
interface GiftAlertConfig {
  is_gift_alert?: boolean | null;
  gift_count_animation_speed?: number | null;
  gift_text_color?: string | null;
  gift_count_color?: string | null;
}

// Combined alert interface
export interface Alert extends BaseAlert, AlertDisplayConfig, GiftAlertConfig {}

// Database table interfaces
interface BaseAlertTable {
  Row: BaseAlert & AlertDisplayConfig & GiftAlertConfig;
  Insert: Partial<BaseAlert> & {
    title: string;
    media_url: string;
    media_type: string;
  } & Partial<AlertDisplayConfig> & Partial<GiftAlertConfig>;
  Update: Partial<BaseAlert> & Partial<AlertDisplayConfig> & Partial<GiftAlertConfig>;
  Relationships: [];
}

export interface AlertsTable extends BaseAlertTable {}

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