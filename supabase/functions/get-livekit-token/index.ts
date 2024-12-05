import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@1.2.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received token request");
    const { callId, role } = await req.json();
    
    if (!callId) {
      console.error("Missing callId in request");
      return new Response(
        JSON.stringify({ error: 'callId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('LiveKit credentials not configured');
      return new Response(
        JSON.stringify({ error: 'LiveKit credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Creating access token for call:", callId);

    // Create an access token with a longer TTL for testing
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

    const token = at.toJwt();
    console.log("Generated token successfully");

    return new Response(
      JSON.stringify({ token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});