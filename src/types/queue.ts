export interface QueueStateValue {
  isPaused: boolean;
}

export interface AlertQueueItem {
  id: string;
  alert: {
    title: string;
    media_url: string;
    media_type: string;
    message_text?: string;
    message_enabled?: boolean;
    font_size?: number;
    is_gift_alert?: boolean;
    gift_count_animation_speed?: number;
    gift_text_color?: string;
    gift_count_color?: string;
  };
  username?: string;
  gift_count?: number;
}