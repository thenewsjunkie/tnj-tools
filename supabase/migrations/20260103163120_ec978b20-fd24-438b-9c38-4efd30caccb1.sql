-- Create video_resources table for storing resource links
CREATE TABLE public.video_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_resources ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (utility tool, no auth required)
CREATE POLICY "Enable all operations for video_resources"
ON public.video_resources
FOR ALL
USING (true)
WITH CHECK (true);