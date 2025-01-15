import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Function to convert title to slug
    const titleToSlug = (title: string) => {
      return title.toLowerCase().replace(/\s+/g, '-');
    };

    // Function to format username from URL
    const formatUsername = (username: string) => {
      return username.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    // Get parameters from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const [alertSlug, username, giftCount] = pathParts;

    console.log('[trigger-alert-from-tnj] Processing request:', { alertSlug, username, giftCount });

    if (!alertSlug) {
      throw new Error('Alert slug is required');
    }

    // Get the alert from the database
    const { data: alerts, error: alertError } = await supabase
      .from('alerts')
      .select('*');

    if (alertError) {
      throw alertError;
    }

    const matchingAlert = alerts.find(alert => titleToSlug(alert.title) === alertSlug);
    
    if (!matchingAlert) {
      throw new Error(`No matching alert found for slug: ${alertSlug}`);
    }

    console.log('[trigger-alert-from-tnj] Found matching alert:', matchingAlert.title);

    // Parse gift count if provided and alert is a gift alert
    const parsedGiftCount = matchingAlert.is_gift_alert && giftCount ? 
      parseInt(giftCount, 10) : undefined;

    if (parsedGiftCount && isNaN(parsedGiftCount)) {
      throw new Error('Invalid gift count provided');
    }

    // Add to queue
    const { error: queueError } = await supabase
      .from('alert_queue')
      .insert({
        alert_id: matchingAlert.id,
        username: username ? formatUsername(username) : null,
        gift_count: parsedGiftCount,
        status: 'pending'
      });

    if (queueError) {
      throw queueError;
    }

    console.log('[trigger-alert-from-tnj] Alert queued successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Alert queued successfully',
        details: {
          alertTitle: matchingAlert.title,
          username: username ? formatUsername(username) : null,
          giftCount: parsedGiftCount || null
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[trigger-alert-from-tnj] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})