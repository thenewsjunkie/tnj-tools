-- Create storage bucket for resource thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('resource_thumbnails', 'resource_thumbnails', true);

-- Allow public read access
CREATE POLICY "Public read access for resource thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'resource_thumbnails');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload resource thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resource_thumbnails');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update resource thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resource_thumbnails');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete resource thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'resource_thumbnails');