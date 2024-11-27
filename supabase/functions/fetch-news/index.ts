import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set')
      throw new Error('OPENAI_API_KEY is not set')
    }
    console.log('OPENAI_API_KEY is configured')

    console.log('Fetching news summary from OpenAI...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const newsContent = aiResponse.choices[0].message.content
    console.log('Received news summary from OpenAI')

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      throw new Error('Missing Supabase credentials')
    }
    console.log('Supabase credentials configured')

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Storing news in database...')
    const { data, error } = await supabase
      .from('news_roundups')
      .insert([
        {
          content: newsContent,
          sources: [{ source: 'OpenAI GPT-4' }]
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