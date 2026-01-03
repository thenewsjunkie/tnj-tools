-- Add storage policies for show_notes_images bucket (bucket already exists and is public)

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload show_notes_images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'show_notes_images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update show_notes_images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'show_notes_images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete show_notes_images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'show_notes_images' AND auth.role() = 'authenticated');