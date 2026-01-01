export interface Bullet {
  id: string;
  text: string;
  indent: number;
}

export interface Link {
  id: string;
  url: string;
  title?: string;
}

export interface Topic {
  id: string;
  title: string;
  display_order: number;
  bullets: Bullet[];
  links: Link[];
  images: string[];
}

export interface ShowPrepNotesData {
  id: string;
  date: string;
  topics: Topic[];
  created_at: string;
  updated_at: string;
}
