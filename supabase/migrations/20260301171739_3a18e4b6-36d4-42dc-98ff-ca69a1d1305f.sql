
-- Create art_mode storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('art_mode', 'art_mode', true);

-- Allow public read
CREATE POLICY "Public can view art_mode images"
ON storage.objects FOR SELECT
USING (bucket_id = 'art_mode');

-- Allow authenticated upload
CREATE POLICY "Authenticated users can upload art_mode images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'art_mode' AND auth.role() = 'authenticated');

-- Allow authenticated delete
CREATE POLICY "Authenticated users can delete art_mode images"
ON storage.objects FOR DELETE
USING (bucket_id = 'art_mode' AND auth.role() = 'authenticated');
