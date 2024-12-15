import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../fetch-news/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const alertSlug = pathParts[pathParts.length - 2]
    const username = pathParts[pathParts.length - 1]

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
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const alert = alerts[0]

    // Add to queue instead of broadcasting directly
    const { error: queueError } = await supabase
      .from('alert_queue')
      .insert({
        alert_id: alert.id,
        username: username ? username.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') : null,
        status: 'pending'
      })

    if (queueError) {
      throw new Error('Failed to queue alert')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Alert queued successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})