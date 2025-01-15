import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tnj-key',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the TNJ key from headers
    const tnjKey = req.headers.get('x-tnj-key')
    const expectedKey = Deno.env.get('TNJ_SHARED_SECRET')

    // Validate the TNJ key
    if (!tnjKey || tnjKey !== expectedKey) {
      console.error('[trigger-alert-secure] Invalid or missing TNJ key')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get alert details from request body
    const { alertSlug, username, giftCount } = await req.json()
    
    if (!alertSlug) {
      throw new Error('Alert slug is required')
    }

    console.log('[trigger-alert-secure] Received request:', { alertSlug, username, giftCount })

    // Construct URL for internal function call
    const internalUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/trigger-alert-from-tnj/${alertSlug}`
      + (username ? `/${username}` : '')
      + (giftCount ? `/${giftCount}` : '')

    // Forward request to internal function using service role key
    const response = await fetch(internalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      }
    )

  } catch (error) {
    console.error('[trigger-alert-secure] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})