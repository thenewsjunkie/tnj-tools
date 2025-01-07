import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  type: 'transcribe'
  audioData: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, audioData } = await req.json() as RequestBody

    if (!audioData) {
      throw new Error('No audio data provided')
    }

    // Convert base64 to blob
    const base64Data = audioData.split(',')[1]
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const audioBlob = new Blob([binaryData], { type: 'audio/mp4' })

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    console.log('[process-audio] Transcribing audio...')
    // Transcribe audio using Whisper
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

    // Get GPT response
    console.log('[process-audio] Getting GPT response...')
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Keep your responses concise and friendly.',
        },
        {
          role: 'user',
          content: transcribedText,
        },
      ],
    })

    const gptResponse = completion.data.choices[0]?.message?.content
    if (!gptResponse) {
      throw new Error('No response from GPT')
    }
    console.log('[process-audio] GPT response:', gptResponse)

    // Convert GPT response to speech
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
        input: gptResponse,
      }),
    })

    if (!ttsResponse.ok) {
      throw new Error(`Text-to-speech API error: ${await ttsResponse.text()}`)
    }

    const audioResponse = await ttsResponse.arrayBuffer()
    console.log('[process-audio] Audio response generated')

    // Save conversation to database
    console.log('[process-audio] Saving conversation...')
    const { error: dbError } = await supabaseClient
      .from('audio_conversations')
      .insert({
        question_text: transcribedText,
        answer_text: gptResponse,
        status: 'completed',
      })

    if (dbError) {
      console.error('[process-audio] Supabase error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify({
        conversation: {
          question_text: transcribedText,
          answer_text: gptResponse,
        },
        audioResponse,
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
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})