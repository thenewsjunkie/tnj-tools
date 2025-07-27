-- Create a cron job to process alert queue every 3 seconds
SELECT cron.schedule(
  'process-alert-queue-every-3-seconds',
  '*/3 * * * * *',
  $$
  SELECT net.http_post(
    url:='https://gpmandlkcdompmdvethh.supabase.co/functions/v1/process-alert-queue',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWFuZGxrY2RvbXBtZHZldGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQ2MzY2NywiZXhwIjoyMDQ4MDM5NjY3fQ.EIVqe_U_dTOLYrKM_K3wdMRbEHh7lsDQKlZOKkYnFjo"}'::jsonb,
    body:='{"trigger": "cron"}'::jsonb
  ) as request_id;
  $$
);