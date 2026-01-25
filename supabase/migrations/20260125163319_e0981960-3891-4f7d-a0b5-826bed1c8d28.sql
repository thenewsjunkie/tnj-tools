-- Create enum for tapestry status
CREATE TYPE public.tapestry_status AS ENUM ('draft', 'published');

-- Create enum for node type
CREATE TYPE public.tapestry_node_type AS ENUM ('character', 'point');

-- Create enum for node side
CREATE TYPE public.tapestry_node_side AS ENUM ('left', 'right', 'neutral');

-- Create enum for point tag type
CREATE TYPE public.point_tag_type AS ENUM ('claim', 'evidence', 'context');

-- Create tapestries table
CREATE TABLE public.tapestries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status tapestry_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  theme_config JSONB DEFAULT '{"leftColor": "#1e3a5f", "rightColor": "#5f1e1e", "dividerColor": "#ffffff"}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tapestry_nodes table
CREATE TABLE public.tapestry_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tapestry_id UUID NOT NULL REFERENCES public.tapestries(id) ON DELETE CASCADE,
  type tapestry_node_type NOT NULL,
  side tapestry_node_side NOT NULL DEFAULT 'neutral',
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  scale FLOAT NOT NULL DEFAULT 1.0,
  rotation FLOAT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  scene_visibility JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tapestry_edges table
CREATE TABLE public.tapestry_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tapestry_id UUID NOT NULL REFERENCES public.tapestries(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.tapestry_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.tapestry_nodes(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{"color": "#ffffff", "animated": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tapestry_scenes table
CREATE TABLE public.tapestry_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tapestry_id UUID NOT NULL REFERENCES public.tapestries(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  name TEXT NOT NULL DEFAULT 'Scene',
  config JSONB NOT NULL DEFAULT '{"zoom": 1, "panX": 0, "panY": 0, "visibleNodes": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_tapestries_status ON public.tapestries(status);
CREATE INDEX idx_tapestries_created_by ON public.tapestries(created_by);
CREATE INDEX idx_tapestry_nodes_tapestry ON public.tapestry_nodes(tapestry_id);
CREATE INDEX idx_tapestry_edges_tapestry ON public.tapestry_edges(tapestry_id);
CREATE INDEX idx_tapestry_scenes_tapestry ON public.tapestry_scenes(tapestry_id);

-- Enable RLS
ALTER TABLE public.tapestries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tapestry_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tapestry_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tapestry_scenes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check tapestry ownership
CREATE OR REPLACE FUNCTION public.owns_tapestry(_user_id UUID, _tapestry_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tapestries
    WHERE id = _tapestry_id
      AND created_by = _user_id
  )
$$;

-- RLS Policies for tapestries
CREATE POLICY "Anyone can view published tapestries"
  ON public.tapestries FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own tapestries"
  ON public.tapestries FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create tapestries"
  ON public.tapestries FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tapestries"
  ON public.tapestries FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tapestries"
  ON public.tapestries FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for tapestry_nodes
CREATE POLICY "Anyone can view nodes of published tapestries"
  ON public.tapestry_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tapestries t
      WHERE t.id = tapestry_id AND t.status = 'published'
    )
  );

CREATE POLICY "Users can view nodes of their tapestries"
  ON public.tapestry_nodes FOR SELECT
  USING (public.owns_tapestry(auth.uid(), tapestry_id));

CREATE POLICY "Users can manage nodes of their tapestries"
  ON public.tapestry_nodes FOR ALL
  USING (public.owns_tapestry(auth.uid(), tapestry_id))
  WITH CHECK (public.owns_tapestry(auth.uid(), tapestry_id));

-- RLS Policies for tapestry_edges
CREATE POLICY "Anyone can view edges of published tapestries"
  ON public.tapestry_edges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tapestries t
      WHERE t.id = tapestry_id AND t.status = 'published'
    )
  );

CREATE POLICY "Users can view edges of their tapestries"
  ON public.tapestry_edges FOR SELECT
  USING (public.owns_tapestry(auth.uid(), tapestry_id));

CREATE POLICY "Users can manage edges of their tapestries"
  ON public.tapestry_edges FOR ALL
  USING (public.owns_tapestry(auth.uid(), tapestry_id))
  WITH CHECK (public.owns_tapestry(auth.uid(), tapestry_id));

-- RLS Policies for tapestry_scenes
CREATE POLICY "Anyone can view scenes of published tapestries"
  ON public.tapestry_scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tapestries t
      WHERE t.id = tapestry_id AND t.status = 'published'
    )
  );

CREATE POLICY "Users can view scenes of their tapestries"
  ON public.tapestry_scenes FOR SELECT
  USING (public.owns_tapestry(auth.uid(), tapestry_id));

CREATE POLICY "Users can manage scenes of their tapestries"
  ON public.tapestry_scenes FOR ALL
  USING (public.owns_tapestry(auth.uid(), tapestry_id))
  WITH CHECK (public.owns_tapestry(auth.uid(), tapestry_id));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_tapestry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tapestries_updated_at
  BEFORE UPDATE ON public.tapestries
  FOR EACH ROW EXECUTE FUNCTION public.update_tapestry_updated_at();

CREATE TRIGGER update_tapestry_nodes_updated_at
  BEFORE UPDATE ON public.tapestry_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_tapestry_updated_at();

CREATE TRIGGER update_tapestry_scenes_updated_at
  BEFORE UPDATE ON public.tapestry_scenes
  FOR EACH ROW EXECUTE FUNCTION public.update_tapestry_updated_at();

-- Create storage bucket for tapestry media
INSERT INTO storage.buckets (id, name, public)
VALUES ('tapestry_media', 'tapestry_media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tapestry_media bucket
CREATE POLICY "Anyone can view tapestry media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tapestry_media');

CREATE POLICY "Authenticated users can upload tapestry media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tapestry_media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tapestry_media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tapestry_media' AND auth.uid()::text = (storage.foldername(name))[1]);