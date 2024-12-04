import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AccessToken } from 'livekit-server-sdk'

const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY')
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET')

serve(async (req) => {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return new Response(
      JSON.stringify({ error: 'LiveKit credentials not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { callId } = await req.json()
  
  // Create access token
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
    { headers: { 'Content-Type': 'application/json' } },
  )
})