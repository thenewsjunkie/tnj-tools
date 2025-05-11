
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    console.log('[text-to-speech] Starting text-to-speech conversion...')
    const { text } = await req.json()

    if (!text) {
      throw new Error('No text provided')
    }

    console.log('[text-to-speech] Converting text to speech...')
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
        response_format: 'mp3',
      }),
    })

    if (!ttsResponse.ok) {
      throw new Error(`Text-to-speech API error: ${await ttsResponse.text()}`)
    }

    const audioResponse = await ttsResponse.arrayBuffer()
    console.log('[text-to-speech] Audio response generated')

    // Convert to base64 for transmission
    const base64Audio = btoa(
      String.fromCharCode.apply(null, new Uint8Array(audioResponse))
    );

    return new Response(
      JSON.stringify({
        audioResponse: base64Audio,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('[text-to-speech] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
