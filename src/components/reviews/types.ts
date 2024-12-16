export type ReviewType = 'television' | 'movie' | 'food' | 'product';

export interface Review {
  id: string;
  type: ReviewType;
  title: string;
  rating: number;
  content: string;
  image_url: string | null;
  created_at: string;
}