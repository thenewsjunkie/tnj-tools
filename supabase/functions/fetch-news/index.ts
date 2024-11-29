import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { scrapeNews } from "./scraper.ts";
import { getTrends } from "./trends.ts";
import { corsHeaders } from "./cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type } = await req.json();

    if (type === 'box-office') {
      const response = await fetch('https://www.boxofficemojo.com/weekend/chart/');
      const html = await response.text();
      
      // Simple parsing to extract box office data
      const boxOffice = [];
      const rows = html.match(/<tr[^>]*>.*?<\/tr>/gs);
      
      if (rows) {
        for (const row of rows.slice(1, 11)) { // Get top 10
          const title = row.match(/>([^<]+)<\/a>/)?.[1] || '';
          const earnings = row.match(/\$[\d,]+/)?.[0] || '';
          
          if (title && earnings) {
            boxOffice.push({ title, earnings });
          }
        }
      }

      return new Response(
        JSON.stringify({ boxOffice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular news fetch logic
    const [news, trends] = await Promise.all([
      scrapeNews(),
      getTrends()
    ]);

    const content = `${news}\n\n🔍 Trending on Google:\n${trends}`;

    const { error } = await supabase
      .from('news_roundups')
      .insert([{ content }]);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});