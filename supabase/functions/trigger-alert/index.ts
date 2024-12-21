import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../fetch-news/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { alertSlug } = await req.json()
    console.log('[trigger-alert] Processing alert with slug:', alertSlug)

    // Convert slug to title format for database query
    const alertTitle = alertSlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    // Get the alert from the database
    const { data: alerts, error: alertError } = await supabase
      .from('alerts')
      .select('*')
      .eq('title', alertTitle)
      .limit(1)

    if (alertError || !alerts || alerts.length === 0) {
      console.error('[trigger-alert] Alert not found:', alertError || 'No alert found')
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const alert = alerts[0]

    // Add to queue
    const { error: queueError } = await supabase
      .from('alert_queue')
      .insert({
        alert_id: alert.id,
        status: 'pending'
      })

    if (queueError) {
      console.error('[trigger-alert] Failed to queue alert:', queueError)
      throw new Error('Failed to queue alert')
    }

    console.log('[trigger-alert] Alert queued successfully')
    return new Response(
      JSON.stringify({ success: true, message: 'Alert queued successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[trigger-alert] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})