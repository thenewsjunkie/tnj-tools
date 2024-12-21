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