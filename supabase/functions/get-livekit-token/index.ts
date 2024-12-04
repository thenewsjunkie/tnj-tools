import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple JWT token generation without external dependencies
function generateToken(apiKey: string, apiSecret: string, identity: string, roomName: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (2 * 60 * 60); // 2 hours

  const payload = {
    iss: apiKey,
    sub: identity,
    jti: crypto.randomUUID(),
    exp: exp,
    nbf: now,
    iat: now,
    room: roomName,
    video: {
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    }
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const input = `${encodedHeader}.${encodedPayload}`;
  const key = new TextEncoder().encode(apiSecret);
  
  // Create signature
  const signature = crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(input)
  );

  return `${encodedHeader}.${encodedPayload}.${btoa(signature)}`;
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
    const identity = crypto.randomUUID();
    
    const token = generateToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, identity, callId);

    return new Response(
      JSON.stringify({ token }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  } catch (error) {
    console.error('Error generating token:', error);
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