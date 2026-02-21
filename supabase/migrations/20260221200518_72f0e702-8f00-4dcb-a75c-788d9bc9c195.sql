
-- Create public book_covers bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('book_covers', 'book_covers', true);

-- Allow authenticated users to upload covers
CREATE POLICY "Authenticated users can upload book covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book_covers' AND auth.role() = 'authenticated');

-- Allow public read access to covers
CREATE POLICY "Public can read book covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'book_covers');

-- Allow authenticated users to delete covers
CREATE POLICY "Authenticated users can delete book covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'book_covers' AND auth.role() = 'authenticated');
