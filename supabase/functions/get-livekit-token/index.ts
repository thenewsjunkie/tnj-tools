import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@1.2.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY')
  const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET')

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return new Response(
      JSON.stringify({ error: 'LiveKit credentials not configured' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }

  try {
    const { callId } = await req.json()
    
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: crypto.randomUUID(),
      ttl: 60 * 60 * 2 // 2 hours
    });
    
    at.addGrant({ 
      room: callId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    });

    return new Response(
      JSON.stringify({ token: at.toJwt() }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }
})