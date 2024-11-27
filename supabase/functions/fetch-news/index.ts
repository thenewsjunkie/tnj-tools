import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting news fetch...')
    
    const rapidApiKey = Deno.env.get('RAPID_API_KEY')
    if (!rapidApiKey) {
      console.error('RAPID_API_KEY is not set')
      throw new Error('RAPID_API_KEY is not set')
    }
    console.log('RAPID_API_KEY is configured')

    console.log('Fetching news from external API...')
    const response = await fetch('https://news-api14.p.rapidapi.com/top-headlines?country=us&language=en&pageSize=5', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'news-api14.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API response error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`API response error: ${response.status} ${response.statusText}`)
    }

    const newsData = await response.json()
    console.log(`Fetched ${newsData.articles?.length || 0} articles`)

    if (!newsData.articles?.length) {
      console.error('No articles received from API', newsData)
      throw new Error('No articles received from API')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      throw new Error('Missing Supabase credentials')
    }
    console.log('Supabase credentials configured')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Format news content
    const formattedContent = newsData.articles
      .map((article: any) => `${article.title}\n${article.description || ''}\n\n`)
      .join('')

    console.log('Storing news in database...')
    const { data, error } = await supabase
      .from('news_roundups')
      .insert([
        {
          content: formattedContent,
          sources: newsData.articles
        }
      ])

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('News roundup successfully stored')

    return new Response(
      JSON.stringify({ success: true, message: 'News roundup updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})