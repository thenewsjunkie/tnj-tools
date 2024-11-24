import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAPID_API_KEY = Deno.env.get('RAPID_API_KEY')
const RAPID_API_HOST = 'youtube-mp36.p.rapidapi.com'

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

    const response = await fetch(`https://${RAPID_API_HOST}/dl?id=${videoId}`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    })

    console.log('RapidAPI response status:', response.status)
    const data = await response.json()
    console.log('RapidAPI response data:', data)

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${data.msg || 'Unknown error'}`)
    }

    if (data.status === 'ok' && data.link) {
      return new Response(
        JSON.stringify({ downloadUrl: data.link }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(data.msg || 'Failed to convert video')
    }
  } catch (error) {
    console.error('Error in youtube-to-mp3 function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})