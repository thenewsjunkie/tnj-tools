
-- Books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  cover_url text,
  language text DEFAULT 'en',
  tags text[] DEFAULT '{}',
  file_type text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  checksum text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do all on books" ON public.books
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read books" ON public.books
  FOR SELECT USING (true);

-- Reading progress
CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  location text,
  percentage double precision DEFAULT 0,
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(book_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do all on reading_progress" ON public.reading_progress
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read reading_progress" ON public.reading_progress
  FOR SELECT USING (true);

-- Book bookmarks
CREATE TABLE public.book_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  location text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do all on book_bookmarks" ON public.book_bookmarks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read book_bookmarks" ON public.book_bookmarks
  FOR SELECT USING (true);

-- Book highlights
CREATE TABLE public.book_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  cfi_range text NOT NULL,
  color text DEFAULT 'yellow',
  text_excerpt text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do all on book_highlights" ON public.book_highlights
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read book_highlights" ON public.book_highlights
  FOR SELECT USING (true);

-- Book notes
CREATE TABLE public.book_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  cfi_range text,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do all on book_notes" ON public.book_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read book_notes" ON public.book_notes
  FOR SELECT USING (true);

-- Updated_at trigger for books
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for book files (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('book_files', 'book_files', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload book files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book_files');

CREATE POLICY "Authenticated users can read book files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book_files');

CREATE POLICY "Authenticated users can delete book files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book_files');
