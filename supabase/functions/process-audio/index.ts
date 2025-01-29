import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    
    // Prepare form data for Whisper API
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    // Get transcription from Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      throw new Error(`Whisper API error: ${await whisperResponse.text()}`)
    }

    const { text } = await whisperResponse.json()

    // If streaming, return just the transcription
    if (streaming) {
      return new Response(
        JSON.stringify({ text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI response using streaming
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are TNJ, a helpful and knowledgeable AI assistant. Keep responses concise and natural.'
          },
          { role: 'user', content: text }
        ],
        stream: true,
      }),
    })

    let answer = ''
    const reader = completion.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const data = JSON.parse(line.slice(6))
            answer += data.choices[0].delta.content || ''
          }
        }
      }
    }

    // Store conversation in database
    const { data: conversation, error: dbError } = await supabaseClient
      .from('audio_conversations')
      .insert({
        question_text: text,
        answer_text: answer,
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Generate speech from answer
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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
      throw new Error('Failed to generate speech')
    }

    const audioBuffer = await speechResponse.arrayBuffer()

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