export interface Bullet {
  id: string;
  text: string;
  indent: number;
  checked?: boolean;
}

export interface Link {
  id: string;
  url: string;
  title?: string;
  thumbnail_url?: string;
  type?: 'link' | 'image';
}

export interface Topic {
  id: string;
  title: string;
  display_order: number;
  bullets: Bullet[];
  links: Link[];
  images: string[];
  completed?: boolean;
  tags?: string[];
  type?: 'topic' | 'link';  // Default is 'topic' for backwards compatibility
  url?: string;             // Only used when type is 'link'
}

export interface HourBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  topics: Topic[];
}

export interface ShowPrepNotesData {
  id: string;
  date: string;
  hours: HourBlock[];
  created_at: string;
  updated_at: string;
}

// Default show hours (11 AM - 3 PM)
export const DEFAULT_SHOW_HOURS: Omit<HourBlock, "topics">[] = [
  { id: "hour-1", startTime: "11:00 AM", endTime: "12:00 PM", label: "Hour 1" },
  { id: "hour-2", startTime: "12:00 PM", endTime: "1:00 PM", label: "Hour 2" },
  { id: "hour-3", startTime: "1:00 PM", endTime: "2:00 PM", label: "Hour 3" },
  { id: "hour-4", startTime: "2:00 PM", endTime: "3:00 PM", label: "Hour 4" },
];
