-- Phase 1: Complete System Reset (with proper FK handling)
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