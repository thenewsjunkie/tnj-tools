-- Add type column to video_resources table for distinguishing links from images
ALTER TABLE public.video_resources ADD COLUMN type TEXT NOT NULL DEFAULT 'link';