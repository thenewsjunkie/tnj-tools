
-- Create show_songs table
CREATE TABLE public.show_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  audio_url text NOT NULL,
  cover_url text,
  duration double precision,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_songs ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read show_songs" ON public.show_songs
  FOR SELECT USING (true);

-- Authenticated insert
CREATE POLICY "Authenticated can insert show_songs" ON public.show_songs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated update
CREATE POLICY "Authenticated can update show_songs" ON public.show_songs
  FOR UPDATE TO authenticated USING (true);

-- Authenticated delete
CREATE POLICY "Authenticated can delete show_songs" ON public.show_songs
  FOR DELETE TO authenticated USING (true);

-- Updated_at trigger
CREATE TRIGGER update_show_songs_updated_at
  BEFORE UPDATE ON public.show_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('show_songs', 'show_songs', true);

-- Storage RLS policies
CREATE POLICY "Public can read show_songs files" ON storage.objects
  FOR SELECT USING (bucket_id = 'show_songs');

CREATE POLICY "Authenticated can upload show_songs files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'show_songs');

CREATE POLICY "Authenticated can update show_songs files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'show_songs');

CREATE POLICY "Authenticated can delete show_songs files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'show_songs');
