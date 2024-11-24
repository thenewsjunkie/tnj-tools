export interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  type: 'youtube' | 'twitter';
  title: string;
}