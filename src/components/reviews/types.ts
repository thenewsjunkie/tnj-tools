export type ReviewType = 'television' | 'movie' | 'food' | 'product';

export interface Review {
  id: string;
  type: ReviewType;
  title: string;
  rating: number;
  content: string;
  image_urls: string[];
  created_at: string;
  genre: string | null;
}

export interface ReviewsProps {
  reviews?: Review[];
}