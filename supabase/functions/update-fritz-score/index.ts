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

    // Create Supabase client with anon key instead of service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse request body
    const { contestant, increment, action } = await req.json();
    console.log(`[update-fritz-score] Request received:`, { contestant, increment, action });

    // Handle clear action
    if (action === 'clear') {
      const { error: clearError } = await supabase
        .from('fritz_contestants')
        .update({ score: 0 })
        .not('position', 'is', null);

      if (clearError) {
        console.error('[update-fritz-score] Error clearing scores:', clearError);
        return new Response(JSON.stringify({ error: 'Failed to clear scores' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle score update (existing functionality)
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

    console.log('[update-fritz-score] Formatted contestant name:', formattedName);

    // Get current contestant data for version
    const { data: contestantData, error: fetchError } = await supabase
      .from('fritz_contestants')
      .select('version')
      .eq('name', formattedName)
      .single();

    if (fetchError) {
      console.error('[update-fritz-score] Error fetching contestant:', fetchError);
      return new Response(JSON.stringify({ error: 'Contestant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[update-fritz-score] Current contestant version:', contestantData.version);

    // Update score using the database function
    const { data, error } = await supabase
      .rpc('update_contestant_score', {
        p_contestant_name: formattedName,
        p_increment: increment,
        p_current_version: contestantData.version
      });

    if (error) {
      console.error('[update-fritz-score] Error updating score:', error);
      return new Response(JSON.stringify({ error: 'Failed to update score' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get first row of the result
    const result = data[0];
    console.log('[update-fritz-score] Update result:', result);

    return new Response(JSON.stringify({
      success: result.success,
      newScore: result.new_score,
      newVersion: result.new_version
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[update-fritz-score] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});