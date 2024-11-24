export interface SocialMediaPlatform {
  id: string;
  platform_name: string;
  handle: string;
  followers: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaUpdate {
  id: string;
  followers: string;
}