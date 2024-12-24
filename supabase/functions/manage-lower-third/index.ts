import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // GET request to fetch all lower thirds
    if (req.method === 'GET') {
      console.log('[manage-lower-third] Fetching all lower thirds');
      
      const { data, error } = await supabaseClient
        .from('lower_thirds')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST request to set active lower third
    if (req.method === 'POST') {
      const { id } = await req.json();
      console.log(`[manage-lower-third] Setting active lower third: ${id}`);

      // First, deactivate all lower thirds
      const { error: deactivateError } = await supabaseClient
        .from('lower_thirds')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deactivateError) throw deactivateError;

      // Then, activate the specified lower third
      if (id) {
        const { error: activateError } = await supabaseClient
          .from('lower_thirds')
          .update({ is_active: true })
          .eq('id', id);

        if (activateError) throw activateError;
      }

      return new Response(
        JSON.stringify({ success: true, message: id ? 'Lower third activated' : 'All lower thirds deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE request to clear all active lower thirds
    if (req.method === 'DELETE') {
      console.log('[manage-lower-third] Deactivating all lower thirds');
      
      const { error } = await supabaseClient
        .from('lower_thirds')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'All lower thirds deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[manage-lower-third] Error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});