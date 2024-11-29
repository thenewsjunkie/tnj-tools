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
    try {
      const response = await fetch('https://www.boxofficemojo.com/weekend/chart/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      const boxOffice = [];
      
      // Updated regex pattern to better match the table structure
      const tableRows = html.match(/<tr class="a-text-right[^>]*?>[\s\S]*?<\/tr>/g) || [];
      
      for (let i = 0; i < Math.min(10, tableRows.length); i++) {
        const row = tableRows[i];
        const titleMatch = row.match(/<a[^>]*?>([^<]+)<\/a>/);
        const earningsMatch = row.match(/\$([0-9,]+)/);
        
        if (titleMatch && earningsMatch) {
          const title = titleMatch[1].trim();
          const earnings = parseInt(earningsMatch[1].replace(/,/g, ''), 10);
          
          if (title && !isNaN(earnings)) {
            console.log(`Found movie: ${title} - $${earnings}`);
            boxOffice.push({ title, earnings });
          }
        }
      }

      console.log('Box office data:', boxOffice);

      const content = `${headlines}\n\n🔍 Trending on Google:\n${googleTrends.join('\n')}`;

      console.log('Inserting data into Supabase...');
      const { data, error } = await supabase
        .from('news_roundups')
        .insert([{ 
          content,
          sources: { boxOffice }
        }])
        .select();

      if (error) throw error;

      console.log('Successfully inserted news roundup data:', data);
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error fetching box office data:', error);
      // Continue with empty box office data rather than failing completely
      const content = `${headlines}\n\n🔍 Trending on Google:\n${googleTrends.join('\n')}`;
      
      const { data, error: dbError } = await supabase
        .from('news_roundups')
        .insert([{ 
          content,
          sources: { boxOffice: [] }
        }])
        .select();

      if (dbError) throw dbError;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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