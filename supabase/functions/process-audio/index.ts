import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, streaming } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0))
    
    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    console.log('Converting audio to WAV format...')
    
    // Prepare form data for Whisper API
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/wav' }) // Changed to WAV format
    formData.append('file', blob, 'audio.wav') // Changed file extension
    formData.append('model', 'whisper-1')

    console.log('Sending audio to Whisper API...')
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text()
      console.error('Whisper API error:', errorText)
      throw new Error(`Whisper API error: ${errorText}`)
    }

    const { text } = await whisperResponse.json()
    console.log('Transcribed text:', text)

    // If streaming, return just the transcription
    if (streaming) {
      return new Response(
        JSON.stringify({ text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI response
    console.log('Getting AI response...')
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are TNJ, a helpful and knowledgeable AI assistant. Keep responses concise and natural.'
          },
          { role: 'user', content: text }
        ],
      }),
    })

    if (!completion.ok) {
      const errorText = await completion.text()
      console.error('OpenAI Chat API error:', errorText)
      throw new Error(`OpenAI Chat API error: ${errorText}`)
    }

    const completionData = await completion.json()
    const answer = completionData.choices[0].message.content
    console.log('AI response:', answer)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store conversation in database
    console.log('Storing conversation...')
    const { data: conversation, error: dbError } = await supabaseClient
      .from('audio_conversations')
      .insert({
        question_text: text,
        answer_text: answer,
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    // Generate speech from answer
    console.log('Generating speech...')
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: answer,
        voice: 'alloy',
        response_format: 'mp3',
      }),
    })

    if (!speechResponse.ok) {
      const errorText = await speechResponse.text()
      console.error('Speech API error:', errorText)
      throw new Error('Failed to generate speech')
    }

    const audioBuffer = await speechResponse.arrayBuffer()
    console.log('Speech generated successfully')

    return new Response(
      JSON.stringify({
        conversation: {
          question_text: text,
          answer_text: answer
        },
        audioResponse: Array.from(new Uint8Array(audioBuffer))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})