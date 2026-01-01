-- Create table for Weekend Edition segments
CREATE TABLE weekend_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  hour1_segment1 TEXT DEFAULT '',
  hour1_segment2 TEXT DEFAULT '',
  hour1_segment3 TEXT DEFAULT '',
  am_segment1 TEXT DEFAULT '',
  am_segment2 TEXT DEFAULT '',
  am_segment3 TEXT DEFAULT '',
  am_segment4 TEXT DEFAULT '',
  am_segment5 TEXT DEFAULT '',
  am_segment6 TEXT DEFAULT '',
  am_segment7 TEXT DEFAULT '',
  am_segment8 TEXT DEFAULT '',
  best_of_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weekend_segments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage weekend segments"
  ON weekend_segments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read access
CREATE POLICY "Public can read weekend segments"
  ON weekend_segments FOR SELECT USING (true);