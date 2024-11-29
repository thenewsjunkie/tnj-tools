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
    console.log('Starting news fetch process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch headlines and trends
    const [headlines, { googleTrends }] = await Promise.all([
      scrapeHeadlines(),
      getTrendingTopics()
    ]);

    console.log('Fetching box office data...');
    // Fetch box office data
    const response = await fetch('https://www.boxofficemojo.com/weekend/chart/');
    const html = await response.text();
    
    // Parse box office data
    const boxOffice = [];
    const rows = html.match(/<tr[^>]*>.*?<\/tr>/gs);
    
    if (rows) {
      console.log(`Found ${rows.length} rows in box office data`);
      for (const row of rows.slice(1, 11)) { // Get top 10
        const titleMatch = row.match(/title\/.*?>([^<]+)<\/a>/);
        const earningsMatch = row.match(/\$([\d,]+)/);
        
        if (titleMatch?.[1] && earningsMatch?.[1]) {
          const title = titleMatch[1].trim();
          const earnings = parseInt(earningsMatch[1].replace(/,/g, ''), 10);
          console.log(`Parsed movie: ${title} - $${earnings}`);
          boxOffice.push({ title, earnings });
        }
      }
    }

    console.log('Box office data:', boxOffice);

    const content = `${headlines}\n\n🔍 Trending on Google:\n${googleTrends.join('\n')}`;

    console.log('Inserting data into Supabase...');
    // Insert data with sources including box office data
    const { data, error } = await supabase
      .from('news_roundups')
      .insert([{ 
        content,
        sources: { boxOffice: boxOffice }
      }])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log('Successfully inserted news roundup data:', data);
    return new Response(
      JSON.stringify({ success: true, data }),
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