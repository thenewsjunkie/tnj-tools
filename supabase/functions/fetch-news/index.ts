import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "./cors.ts";
import { scrapeHeadlines } from "./scraper.ts";
import { getTrendingTopics } from "./trends.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type } = await req.json();

    if (type === 'box-office') {
      const response = await fetch('https://www.boxofficemojo.com/weekend/chart/');
      const html = await response.text();
      
      // Parse box office data
      const boxOffice = [];
      const rows = html.match(/<tr[^>]*>.*?<\/tr>/gs);
      
      if (rows) {
        for (const row of rows.slice(1, 11)) { // Get top 10
          const titleMatch = row.match(/>([^<]+)<\/a>/);
          const earningsMatch = row.match(/\$([\d,]+)/);
          
          if (titleMatch?.[1] && earningsMatch?.[1]) {
            const title = titleMatch[1].trim();
            const earnings = earningsMatch[1].replace(/,/g, '');
            boxOffice.push({ title, earnings: parseFloat(earnings) });
          }
        }
      }

      return new Response(
        JSON.stringify({ boxOffice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular news fetch logic
    const [headlines, { googleTrends }] = await Promise.all([
      scrapeHeadlines(),
      getTrendingTopics()
    ]);

    const content = `${headlines}\n\n🔍 Trending on Google:\n${googleTrends.join('\n')}`;

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