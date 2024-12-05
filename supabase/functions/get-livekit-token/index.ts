import { AccessToken } from 'https://esm.sh/livekit-server-sdk@1.2.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { callId, role } = await req.json()
    
    if (!callId) {
      return new Response(
        JSON.stringify({ error: 'callId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!apiKey || !apiSecret) {
      console.error('LiveKit credentials not configured')
      return new Response(
        JSON.stringify({ error: 'LiveKit credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create an access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: crypto.randomUUID(),
      ttl: 3600 * 24, // 24 hours
    });

    at.addGrant({
      room: callId,
      roomJoin: true,
      canPublish: role === 'publisher',
      canSubscribe: true,
    });

    const token = at.toJwt()
    console.log('Generated LiveKit token for call:', callId)

    return new Response(
      JSON.stringify({ token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})