
-- Add recurring weekly settings and button duration
ALTER TABLE public.timer_settings
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN day_of_week integer NOT NULL DEFAULT 5,  -- 0=Sun, 1=Mon...5=Fri, 6=Sat
  ADD COLUMN time_of_day text NOT NULL DEFAULT '19:00',
  ADD COLUMN timezone text NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN button_duration_minutes integer NOT NULL DEFAULT 60;
