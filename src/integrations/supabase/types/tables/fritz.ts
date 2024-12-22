export interface FritzContestant {
  id: string;
  name: string | null;
  score: number | null;
  image_url: string | null;
  position: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FritzContestantsTable {
  Row: FritzContestant;
  Insert: {
    id?: string;
    name?: string | null;
    score?: number | null;
    image_url?: string | null;
    position?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    name?: string | null;
    score?: number | null;
    image_url?: string | null;
    position?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Relationships: [];
}