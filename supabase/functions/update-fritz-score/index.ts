import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { contestant, increment } = await req.json();
    console.log(`Updating score for ${contestant}, increment: ${increment}`);

    if (!contestant) {
      return new Response(JSON.stringify({ error: 'Contestant name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Format contestant name to match database format
    const formattedName = contestant === 'c-lane' ? 'C-Lane' : 
      contestant === 'custom' ? 'Custom' :
      contestant.charAt(0).toUpperCase() + contestant.slice(1);

    // Get current contestant data for version
    const { data: contestantData, error: fetchError } = await supabase
      .from('fritz_contestants')
      .select('version')
      .eq('name', formattedName)
      .single();

    if (fetchError) {
      console.error('Error fetching contestant:', fetchError);
      return new Response(JSON.stringify({ error: 'Contestant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update score using the database function
    const { data, error } = await supabase
      .rpc('update_contestant_score', {
        p_contestant_name: formattedName,
        p_increment: increment,
        p_current_version: contestantData.version
      });

    if (error) {
      console.error('Error updating score:', error);
      return new Response(JSON.stringify({ error: 'Failed to update score' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get first row of the result
    const result = data[0];
    
    return new Response(JSON.stringify({
      success: result.success,
      newScore: result.new_score,
      newVersion: result.new_version
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});