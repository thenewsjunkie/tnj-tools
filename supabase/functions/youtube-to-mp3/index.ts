import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAPID_API_KEY = Deno.env.get('RAPID_API-KEY')
const RAPID_API_HOST = 'youtube-mp36.p.rapidapi.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting YouTube to MP3 conversion request')
    const { url } = await req.json()

    if (!url) {
      console.error('No URL provided')
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!RAPID_API_KEY) {
      console.error('RAPID_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Extract video ID from URL
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]

    if (!videoId) {
      console.error('Invalid YouTube URL:', url)
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Extracted video ID:', videoId)
    console.log('Making request to RapidAPI endpoint')

    const response = await fetch(`https://${RAPID_API_HOST}/dl?id=${videoId}`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    })

    console.log('RapidAPI response status:', response.status)
    const data = await response.json()
    console.log('RapidAPI response data:', JSON.stringify(data))

    // Check if the API key is invalid
    if (response.status === 401 || response.status === 403) {
      console.error('RapidAPI authentication failed')
      return new Response(
        JSON.stringify({ error: 'API authentication failed. Please check your API key.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    if (!response.ok) {
      console.error('RapidAPI request failed:', response.status, data)
      return new Response(
        JSON.stringify({ error: data.msg || 'API request failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    if (data.status === 'ok' && data.link) {
      console.log('Successfully got download link')
      return new Response(
        JSON.stringify({ downloadUrl: data.link }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('Invalid API response:', data)
      return new Response(
        JSON.stringify({ error: data.msg || 'Failed to convert video' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in youtube-to-mp3 function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})