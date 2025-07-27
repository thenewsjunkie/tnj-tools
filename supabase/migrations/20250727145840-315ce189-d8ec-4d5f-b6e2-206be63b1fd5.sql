-- Phase 1: Complete System Reset
-- Clean up all stuck alerts and reset system state
UPDATE alert_queue SET 
  status = 'completed',
  completed_at = now(),
  last_heartbeat = NULL
WHERE status != 'completed';

-- Reset queue state 
UPDATE system_settings 
SET value = '{"isPaused": false}'::jsonb, updated_at = now()
WHERE key = 'queue_state';

-- Clean up any orphaned data
DELETE FROM alert_queue 
WHERE created_at < now() - interval '24 hours' 
  AND status = 'completed';