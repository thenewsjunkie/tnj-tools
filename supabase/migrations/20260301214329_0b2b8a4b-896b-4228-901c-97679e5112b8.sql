
-- ============================================
-- Fix hopper_groups: restrict write to authenticated
-- ============================================
DROP POLICY "Allow public delete on hopper_groups" ON public.hopper_groups;
DROP POLICY "Allow public insert on hopper_groups" ON public.hopper_groups;
DROP POLICY "Allow public update on hopper_groups" ON public.hopper_groups;

CREATE POLICY "Authenticated can insert hopper_groups"
ON public.hopper_groups FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update hopper_groups"
ON public.hopper_groups FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete hopper_groups"
ON public.hopper_groups FOR DELETE TO authenticated
USING (true);

-- ============================================
-- Fix hopper_items: restrict write to authenticated
-- ============================================
DROP POLICY "Allow public delete on hopper_items" ON public.hopper_items;
DROP POLICY "Allow public insert on hopper_items" ON public.hopper_items;
DROP POLICY "Allow public update on hopper_items" ON public.hopper_items;

CREATE POLICY "Authenticated can insert hopper_items"
ON public.hopper_items FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update hopper_items"
ON public.hopper_items FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete hopper_items"
ON public.hopper_items FOR DELETE TO authenticated
USING (true);

-- ============================================
-- Fix video_resources: replace ALL public with authenticated write + public read
-- ============================================
DROP POLICY "Enable all operations for video_resources" ON public.video_resources;

CREATE POLICY "Public can read video_resources"
ON public.video_resources FOR SELECT
USING (true);

CREATE POLICY "Authenticated can insert video_resources"
ON public.video_resources FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update video_resources"
ON public.video_resources FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete video_resources"
ON public.video_resources FOR DELETE TO authenticated
USING (true);
