
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const chunks: string[] = [];
  const chunk_size = 8192;
  const uint8Array = new Uint8Array(buffer);
  
  for (let i = 0; i < uint8Array.length; i += chunk_size) {
    const chunk = uint8Array.slice(i, i + chunk_size);
    chunks.push(String.fromCharCode.apply(null, chunk));
  }
  
  return btoa(chunks.join(''));
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    console.log('[process-audio] Starting audio processing request...')
    const { type, audioData } = await req.json()

    if (type !== 'transcribe') {
      throw new Error(`Unsupported type: ${type}`)
    }

    if (!audioData) {
      throw new Error('No audio data provided')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('[process-audio] Audio data received, preparing for transcription...')

    const base64Data = audioData.split(',')[1]
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const audioBlob = new Blob([binaryData], { type: 'audio/mp4' })

    console.log('[process-audio] Transcribing audio...')
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.mp4')
    formData.append('model', 'whisper-1')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`Whisper API error: ${await transcriptionResponse.text()}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcribedText = transcriptionData.text
    console.log('[process-audio] Transcribed text:', transcribedText)

    console.log('[process-audio] Getting GPT response...')
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for a radio show. Keep your responses concise and radio-friendly, designed to be spoken aloud in 10-15 seconds (approximately 25-40 words). Be conversational, engaging, and get to the point quickly. Avoid complex explanations or lengthy details. Your audience is listening live and needs clear, immediate responses.',
          },
          {
            role: 'user',
            content: transcribedText,
          },
        ],
        max_tokens: 100 // This helps enforce brevity
      }),
    })

    if (!gptResponse.ok) {
      throw new Error(`GPT API error: ${await gptResponse.text()}`)
    }

    const gptData = await gptResponse.json()
    const gptResponseText = gptData.choices[0]?.message?.content
    if (!gptResponseText) {
      throw new Error('No response from GPT')
    }
    console.log('[process-audio] GPT response:', gptResponseText)

    console.log('[process-audio] Converting to speech...')
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: gptResponseText,
        response_format: 'mp3',
      }),
    })

    if (!ttsResponse.ok) {
      throw new Error(`Text-to-speech API error: ${await ttsResponse.text()}`)
    }

    const audioResponse = await ttsResponse.arrayBuffer()
    console.log('[process-audio] Audio response generated')

    const conversation = {
      question_text: transcribedText,
      answer_text: gptResponseText,
      status: 'completed',
      conversation_state: 'pending'
    }

    const base64Audio = arrayBufferToBase64(audioResponse);

    return new Response(
      JSON.stringify({
        conversation: {
          question_text: transcribedText,
          answer_text: gptResponseText,
        },
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
    console.error('[process-audio] Error:', error)
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
