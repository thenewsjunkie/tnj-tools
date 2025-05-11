
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
      const errorText = await ttsResponse.text();
      console.error(`[text-to-speech] OpenAI API error: ${errorText}`);
      throw new Error(`Text-to-speech API error: ${errorText}`)
    }

    // Get the audio as an array buffer
    const audioBuffer = await ttsResponse.arrayBuffer()
    console.log('[text-to-speech] Audio response generated, size:', audioBuffer.byteLength)

    // For larger responses, we need to use a more efficient way to encode to base64
    // that doesn't hit the call stack size limit
    const uint8Array = new Uint8Array(audioBuffer);
    const chunks = [];
    const chunkSize = 8192; // Process in smaller chunks to avoid call stack issues
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, chunk));
    }
    
    const base64Audio = btoa(chunks.join(''));
    console.log('[text-to-speech] Base64 encoding complete, length:', base64Audio.length)

    return new Response(
      JSON.stringify({
        audioData: base64Audio,
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
