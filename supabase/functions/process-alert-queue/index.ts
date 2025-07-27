import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[process-alert-queue] Starting alert queue processing...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process pending alerts
    const pendingResult = await processPendingAlerts(supabase);
    
    // Complete expired alerts
    const completedResult = await completeExpiredAlerts(supabase);
    
    // Clean up stale alerts
    const cleanupResult = await cleanupStaleAlerts(supabase);

    console.log('[process-alert-queue] Processing complete:', {
      pending: pendingResult,
      completed: completedResult,
      cleanup: cleanupResult
    });

    return new Response(JSON.stringify({
      success: true,
      pending: pendingResult,
      completed: completedResult,
      cleanup: cleanupResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[process-alert-queue] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function processPendingAlerts(supabase: any) {
  console.log('[process-alert-queue] Processing pending alerts...');
  
  // Get pending alerts that haven't been processed yet
  const { data: pendingAlerts, error: fetchError } = await supabase
    .from('alert_queue')
    .select(`
      *,
      alert:alerts(
        id,
        title,
        media_url,
        media_type,
        display_duration
      )
    `)
    .eq('status', 'pending')
    .is('processing_started_at', null)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('[process-alert-queue] Error fetching pending alerts:', fetchError);
    throw fetchError;
  }

  if (!pendingAlerts || pendingAlerts.length === 0) {
    console.log('[process-alert-queue] No pending alerts to process');
    return { processed: 0 };
  }

  console.log(`[process-alert-queue] Found ${pendingAlerts.length} pending alerts`);

  let processed = 0;
  for (const alertItem of pendingAlerts) {
    try {
      const duration = alertItem.alert?.display_duration || 5; // Default 5 seconds
      const now = new Date();
      const scheduledCompletion = new Date(now.getTime() + (duration * 1000));

      // Update alert to playing status with completion schedule
      const { error: updateError } = await supabase
        .from('alert_queue')
        .update({
          status: 'playing',
          processing_started_at: now.toISOString(),
          scheduled_completion: scheduledCompletion.toISOString(),
          state_changed_at: now.toISOString()
        })
        .eq('id', alertItem.id)
        .eq('status', 'pending'); // Ensure it's still pending

      if (updateError) {
        console.error(`[process-alert-queue] Error updating alert ${alertItem.id}:`, updateError);
        continue;
      }

      console.log(`[process-alert-queue] Started processing alert ${alertItem.id}, will complete at ${scheduledCompletion.toISOString()}`);
      processed++;

    } catch (error) {
      console.error(`[process-alert-queue] Error processing alert ${alertItem.id}:`, error);
    }
  }

  return { processed };
}

async function completeExpiredAlerts(supabase: any) {
  console.log('[process-alert-queue] Completing expired alerts...');
  
  const now = new Date();
  
  // Complete alerts that have passed their scheduled completion time
  const { data: expiredAlerts, error: updateError } = await supabase
    .from('alert_queue')
    .update({
      status: 'completed',
      completed_at: now.toISOString()
    })
    .eq('status', 'playing')
    .not('scheduled_completion', 'is', null)
    .lt('scheduled_completion', now.toISOString())
    .select('id');

  if (updateError) {
    console.error('[process-alert-queue] Error completing expired alerts:', updateError);
    throw updateError;
  }

  const completedCount = expiredAlerts?.length || 0;
  if (completedCount > 0) {
    console.log(`[process-alert-queue] Completed ${completedCount} expired alerts`);
    
    // Broadcast completion event for each completed alert
    for (const alert of expiredAlerts) {
      await supabase
        .channel('alert-completed')
        .send({
          type: 'broadcast',
          event: 'alert-completed',
          payload: { alertId: alert.id }
        });
    }
  }

  return { completed: completedCount };
}

async function cleanupStaleAlerts(supabase: any) {
  console.log('[process-alert-queue] Cleaning up stale alerts...');
  
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  // Mark alerts as completed if they've been playing for more than 15 minutes
  const { data: staleAlerts, error: cleanupError } = await supabase
    .from('alert_queue')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('status', 'playing')
    .lt('processing_started_at', fifteenMinutesAgo.toISOString())
    .select('id');

  if (cleanupError) {
    console.error('[process-alert-queue] Error cleaning up stale alerts:', cleanupError);
    throw cleanupError;
  }

  const cleanedCount = staleAlerts?.length || 0;
  if (cleanedCount > 0) {
    console.log(`[process-alert-queue] Cleaned up ${cleanedCount} stale alerts`);
  }

  return { cleaned: cleanedCount };
}