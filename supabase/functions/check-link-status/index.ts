import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    // Add https:// if not present
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    try {
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'TNJ Link Checker',
        }
      })
      
      clearTimeout(timeout)
      
      return new Response(
        JSON.stringify({
          isUp: response.ok,
          status: response.status,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          isUp: false,
          error: error.message,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})