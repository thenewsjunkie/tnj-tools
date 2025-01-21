import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamlabsTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, pollData } = await req.json();
    const clientId = Deno.env.get('STREAMLABS_CLIENT_ID');
    const clientSecret = Deno.env.get('STREAMLABS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Missing Streamlabs credentials');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different actions
    switch (action) {
      case 'create_poll': {
        // First ensure we have a valid access token
        const tokenResponse = await fetch('https://streamlabs.com/api/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Streamlabs access token');
        }

        const tokenData: StreamlabsTokenResponse = await tokenResponse.json();

        // Create poll in Streamlabs
        const createPollResponse = await fetch('https://streamlabs.com/api/v2.0/polls', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pollData.question,
            options: pollData.options.map((opt: { text: string }) => opt.text),
            duration: 300, // 5 minutes default duration
          }),
        });

        if (!createPollResponse.ok) {
          throw new Error('Failed to create Streamlabs poll');
        }

        const pollResponse = await createPollResponse.json();
        
        return new Response(
          JSON.stringify(pollResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end_poll': {
        // Similar OAuth flow as above
        const tokenResponse = await fetch('https://streamlabs.com/api/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Streamlabs access token');
        }

        const tokenData: StreamlabsTokenResponse = await tokenResponse.json();

        // End poll in Streamlabs
        const endPollResponse = await fetch(`https://streamlabs.com/api/v2.0/polls/${pollData.pollId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!endPollResponse.ok) {
          throw new Error('Failed to end Streamlabs poll');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});