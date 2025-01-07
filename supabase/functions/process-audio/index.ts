import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[process-audio] Starting audio processing')
    const { audioData, type } = await req.json()

    if (type === 'transcribe') {
      console.log('[process-audio] Processing transcription request')
      
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openAIApiKey) {
        console.error('[process-audio] OpenAI API key not configured')
        throw new Error('OpenAI API key is not configured')
      }

      // Convert base64 to blob
      const base64Data = audioData.split(',')[1]
      if (!base64Data) {
        console.error('[process-audio] Invalid audio data format')
        throw new Error('Invalid audio data format')
      }

      try {
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        // Create form data for Whisper API
        const formData = new FormData()
        console.log('[process-audio] Preparing audio data for Whisper API')
        
        const audioBlob = new Blob([binaryData], { type: 'audio/mp4' })
        formData.append('file', new File([audioBlob], 'audio.mp4', { type: 'audio/mp4' }))
        formData.append('model', 'whisper-1')
        formData.append('response_format', 'json')

        // Transcribe audio
        console.log('[process-audio] Sending request to Whisper API')
        const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
          },
          body: formData,
        })

        if (!transcriptionResponse.ok) {
          const errorText = await transcriptionResponse.text()
          console.error('[process-audio] Whisper API error:', errorText)
          throw new Error(`Whisper API error: ${transcriptionResponse.statusText} - ${errorText}`)
        }

        const transcription = await transcriptionResponse.json()
        console.log('[process-audio] Transcription received:', transcription.text)
        
        // Get GPT response
        console.log('[process-audio] Requesting GPT response')
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'user', content: transcription.text }
            ],
          }),
        })

        if (!chatResponse.ok) {
          const errorText = await chatResponse.text()
          console.error('[process-audio] GPT API error:', errorText)
          throw new Error(`GPT API error: ${chatResponse.statusText} - ${errorText}`)
        }

        const chatResult = await chatResponse.json()
        const answer = chatResult.choices[0].message.content
        console.log('[process-audio] GPT response received:', answer)

        // Convert answer to speech
        console.log('[process-audio] Converting response to speech')
        const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: answer,
            voice: 'alloy',
          }),
        })

        if (!speechResponse.ok) {
          const errorText = await speechResponse.text()
          console.error('[process-audio] Speech API error:', errorText)
          throw new Error(`Speech API error: ${speechResponse.statusText} - ${errorText}`)
        }

        const audioBuffer = await speechResponse.arrayBuffer()
        console.log('[process-audio] Speech conversion successful, buffer size:', audioBuffer.byteLength)

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseKey) {
          console.error('[process-audio] Supabase credentials missing')
          throw new Error('Supabase credentials are not configured')
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Store conversation in Supabase
        console.log('[process-audio] Storing conversation in Supabase')
        const { data: conversationData, error: conversationError } = await supabase
          .from('audio_conversations')
          .insert({
            question_text: transcription.text,
            answer_text: answer,
            status: 'completed'
          })
          .select()
          .single()

        if (conversationError) {
          console.error('[process-audio] Supabase error:', conversationError)
          throw conversationError
        }

        console.log('[process-audio] Process completed successfully')
        return new Response(
          JSON.stringify({
            success: true,
            conversation: conversationData,
            audioResponse: Array.from(new Uint8Array(audioBuffer)),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('[process-audio] Error processing audio:', error)
        throw error
      }
    }

    throw new Error('Invalid type specified')
  } catch (error) {
    console.error('[process-audio] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})