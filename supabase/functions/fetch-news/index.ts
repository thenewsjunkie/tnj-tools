import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getTrendingTopics() {
  try {
    const response = await fetch('https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-480&geo=US', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Google Trends response not OK:', response.status, response.statusText);
      return { googleTrends: [] };
    }

    const text = await response.text();
    // Remove the safety prefix from Google's response
    const data = JSON.parse(text.substring(5));
    
    if (!data?.default?.trendingSearchesDays?.[0]?.trendingSearches) {
      console.error('Unexpected Google Trends data structure:', data);
      return { googleTrends: [] };
    }

    const trends = data.default.trendingSearchesDays[0].trendingSearches
      .slice(0, 5)
      .map((trend: any) => trend.title.query)
      .filter(Boolean);

    return { googleTrends: trends };
  } catch (error) {
    console.error('Error fetching trends:', error);
    return { googleTrends: [] };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting news fetch...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting check
    const { data: recentNews, error: dbError } = await supabase
      .from('news_roundups')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (recentNews?.[0]) {
      const lastRequestTime = new Date(recentNews[0].created_at);
      const timeSinceLastRequest = Date.now() - lastRequestTime.getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;
      
      if (timeSinceLastRequest < FIVE_MINUTES) {
        return new Response(
          JSON.stringify({ 
            error: `Please wait ${Math.ceil((FIVE_MINUTES - timeSinceLastRequest) / 1000)} seconds before requesting new news` 
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Fetch trending topics
    console.log('Fetching trending topics...');
    const trends = await getTrendingTopics();
    console.log('Trends fetched:', trends);

    // Get news summary from OpenAI
    console.log('Requesting OpenAI summary...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a news curator. Create a brief news roundup of the most important current events. Format it as 4-5 short bullet points, each 1-2 sentences long. Focus on significant global and tech news.'
          },
          {
            role: 'user',
            content: 'Please provide today\'s news roundup.'
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, response.statusText, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const newsContent = aiResponse.choices[0].message.content;

    // Format the complete content with trending topics
    const formattedContent = `${newsContent}\n\n🔍 Trending on Google:\n${trends.googleTrends.map(trend => `• ${trend}`).join('\n')}`;

    // Store in database
    const { error: insertError } = await supabase
      .from('news_roundups')
      .insert([
        {
          content: formattedContent,
          sources: [
            { source: 'OpenAI GPT-3.5' },
            { source: 'Google Trends' }
          ]
        }
      ]);

    if (insertError) {
      throw new Error(`Failed to store news in database: ${insertError.message}`);
    }

    console.log('News roundup successfully updated');
    return new Response(
      JSON.stringify({ success: true, message: 'News roundup updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});