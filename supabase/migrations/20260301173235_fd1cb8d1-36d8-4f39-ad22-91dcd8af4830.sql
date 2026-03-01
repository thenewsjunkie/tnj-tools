
CREATE TABLE public.studio_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text,
  action_type text NOT NULL,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_type text NOT NULL DEFAULT 'daily',
  scheduled_time time NOT NULL DEFAULT '12:00',
  scheduled_date date,
  day_of_week integer,
  day_of_month integer,
  timezone text NOT NULL DEFAULT 'America/New_York',
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.studio_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read studio_schedules"
  ON public.studio_schedules FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert studio_schedules"
  ON public.studio_schedules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated can update studio_schedules"
  ON public.studio_schedules FOR UPDATE
  USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated can delete studio_schedules"
  ON public.studio_schedules FOR DELETE
  USING (auth.role() = 'authenticated'::text);

CREATE TRIGGER update_studio_schedules_updated_at
  BEFORE UPDATE ON public.studio_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
