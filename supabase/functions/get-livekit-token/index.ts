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

    // Create a unique identity for this participant
    const participantIdentity = crypto.randomUUID();

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantIdentity,
        ttl: 14400 // 4 hours
      });

      at.addGrant({
        roomJoin: true,
        room: callId,
        canPublish: role === 'publisher',
        canSubscribe: true,
        roomCreate: true,
        roomList: true
      });

      const token = at.toJwt();
      console.log("Generated token successfully for participant:", participantIdentity);

      return new Response(
        JSON.stringify({ 
          token,
          identity: participantIdentity,
          room: callId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      throw tokenError;
    }
  } catch (error) {
    console.error("Error generating token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});