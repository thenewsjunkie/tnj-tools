
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.11.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    console.log('[process-audio] Audio data received, preparing for transcription...')

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Convert base64 to binary
    const base64Data = audioData.split(',')[1]
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    console.log('[process-audio] Sending audio to OpenAI for transcription...')
    
    // Get transcription from OpenAI
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', new Blob([binaryData], { type: 'audio/webm' }), 'audio.webm')
    transcriptionFormData.append('model', 'whisper-1')
    
    const transcriptionResponse = await openai.createTranscription(
      transcriptionFormData as any,
      'whisper-1'
    )

    if (!transcriptionResponse.data.text) {
      throw new Error('No transcription received')
    }

    console.log('[process-audio] Transcription received, generating response...')
    
    // Get chat completion from OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI talk show co-host. Keep responses concise and engaging.',
        },
        {
          role: 'user',
          content: transcriptionResponse.data.text,
        },
      ],
    })

    if (!completion.data.choices[0].message?.content) {
      throw new Error('No response received')
    }

    console.log('[process-audio] Chat completion received, generating audio response...')
    
    // Convert response to speech
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'tts-1',
        input: completion.data.choices[0].message.content,
        voice: 'alloy',
      }),
    })

    if (!speechResponse.ok) {
      throw new Error('Failed to generate speech')
    }

    const audioBuffer = await speechResponse.arrayBuffer()
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    )

    console.log('[process-audio] Audio response generated, sending response...')

    // Return both the conversation and audio response
    const response = {
      conversation: {
        question_text: transcriptionResponse.data.text,
        answer_text: completion.data.choices[0].message.content,
      },
      audioResponse: audioBase64,
    }

    console.log('[process-audio] Response prepared, sending to client.')

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    console.error('[process-audio] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
