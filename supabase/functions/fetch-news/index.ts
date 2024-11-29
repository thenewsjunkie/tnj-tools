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
      console.log('Received HTML response. Length:', html.length);
      
      const boxOffice = [];
      
      // First, find the main table containing box office data
      const tableMatch = html.match(/<table[^>]*?mojo-body-table[^>]*?>[\s\S]*?<\/table>/);
      if (!tableMatch) {
        console.log('Could not find main box office table');
        throw new Error('Box office table not found');
      }
      
      const table = tableMatch[0];
      console.log('Found box office table. Length:', table.length);
      
      // Extract rows from the table
      const rows = table.match(/<tr[^>]*?>[\s\S]*?<\/tr>/g) || [];
      console.log('Found number of rows:', rows.length);
      
      // Skip header row, process next 10 rows
      for (let i = 1; i < Math.min(11, rows.length); i++) {
        const row = rows[i];
        console.log(`Processing row ${i}:`, row.substring(0, 100) + '...');
        
        // Look for title in an anchor tag
        const titleMatch = row.match(/<a[^>]*?>([^<]+)<\/a>/);
        // Look for weekend earnings (should be in the second cell)
        const earningsMatch = row.match(/<td[^>]*?>\$([\d,]+)/);
        
        if (titleMatch && earningsMatch) {
          const title = titleMatch[1].trim();
          const earnings = parseInt(earningsMatch[1].replace(/,/g, ''), 10);
          
          console.log(`Found movie data - Title: ${title}, Earnings: $${earnings}`);
          
          if (title && !isNaN(earnings)) {
            boxOffice.push({ title, earnings });
          }
        } else {
          console.log('Could not extract title or earnings from row');
        }
      }

      console.log('Final box office data:', boxOffice);

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