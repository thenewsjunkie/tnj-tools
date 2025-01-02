export interface QueueStateValue {
  isPaused: boolean;
}

export interface AlertQueueItem {
  id: string;
  alert: {
    title: string;
    is_gift_alert?: boolean;
    gift_count_animation_speed?: number;
  };
  username?: string;
  gift_count?: number;
}