import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRAWPOLL_API_BASE = 'https://api.strawpoll.com/v3';

interface CreatePollRequest {
  action: 'create';
  question: string;
  options: string[];
}

interface GetPollRequest {
  action: 'get';
  poll_id: string;
}

interface DeletePollRequest {
  action: 'delete';
  poll_id: string;
}

type RequestBody = CreatePollRequest | GetPollRequest | DeletePollRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRAWPOLL_API_KEY = Deno.env.get('STRAWPOLL_API_KEY');
    if (!STRAWPOLL_API_KEY) {
      console.error('STRAWPOLL_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Strawpoll API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    console.log('Received request:', JSON.stringify(body));

    switch (body.action) {
      case 'create': {
        const { question, options } = body as CreatePollRequest;
        
        if (!question || !options || options.length < 2) {
          return new Response(
            JSON.stringify({ error: 'Question and at least 2 options are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Creating poll on Strawpoll:', { question, options });

        // Create poll on Strawpoll
        const createResponse = await fetch(`${STRAWPOLL_API_BASE}/polls`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': STRAWPOLL_API_KEY,
          },
          body: JSON.stringify({
            title: question,
            poll_options: options.map(text => ({ value: text })),
            poll_config: {
              is_private: false,
              vote_type: 'default',
              allow_comments: false,
              allow_indeterminate: false,
              allow_other_option: false,
              custom_design_colors: null,
              deadline_at: null,
              duplication_checking: 'ip',
              allow_vpn_users: false,
              edit_vote_permissions: 'nobody',
              force_appearance: null,
              hide_participants: false,
              is_multiple_choice: false,
              multiple_choice_min: null,
              multiple_choice_max: null,
              number_of_winners: 1,
              randomize_options: false,
              require_voter_names: false,
              results_visibility: 'always',
            },
            poll_meta: {
              description: null,
              location: null,
            },
            type: 'multiple_choice',
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Strawpoll API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to create poll on Strawpoll', details: errorText }),
            { status: createResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const pollData = await createResponse.json();
        console.log('Strawpoll created successfully:', pollData);

        // Extract the poll ID and construct URLs
        const strawpollId = pollData.id;
        const strawpollUrl = `https://strawpoll.com/${strawpollId}`;
        const strawpollEmbedUrl = `https://strawpoll.com/embed/${strawpollId}`;

        return new Response(
          JSON.stringify({
            success: true,
            strawpoll_id: strawpollId,
            strawpoll_url: strawpollUrl,
            strawpoll_embed_url: strawpollEmbedUrl,
            poll_data: pollData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        const { poll_id } = body as GetPollRequest;
        
        if (!poll_id) {
          return new Response(
            JSON.stringify({ error: 'poll_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Fetching poll from Strawpoll:', poll_id);

        const getResponse = await fetch(`${STRAWPOLL_API_BASE}/polls/${poll_id}`, {
          method: 'GET',
          headers: {
            'X-API-Key': STRAWPOLL_API_KEY,
          },
        });

        if (!getResponse.ok) {
          const errorText = await getResponse.text();
          console.error('Strawpoll API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch poll from Strawpoll', details: errorText }),
            { status: getResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const pollData = await getResponse.json();
        console.log('Strawpoll fetched successfully:', pollData);

        return new Response(
          JSON.stringify({
            success: true,
            poll_data: pollData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { poll_id } = body as DeletePollRequest;
        
        if (!poll_id) {
          return new Response(
            JSON.stringify({ error: 'poll_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Deleting poll from Strawpoll:', poll_id);

        const deleteResponse = await fetch(`${STRAWPOLL_API_BASE}/polls/${poll_id}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': STRAWPOLL_API_KEY,
          },
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('Strawpoll API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to delete poll from Strawpoll', details: errorText }),
            { status: deleteResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Strawpoll deleted successfully');

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use "create", "get", or "delete"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in strawpoll function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
