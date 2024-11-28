import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audioData, type } = await req.json()

    if (type === 'transcribe') {
      console.log('Starting audio transcription process')
      
      // Convert base64 to blob
      const base64Data = audioData.split(',')[1]
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      
      // Create form data for Whisper API
      const formData = new FormData()
      
      // Create file with .mp4 extension since we're prioritizing mp4 format
      const audioBlob = new Blob([binaryData], { type: 'audio/mp4' })
      formData.append('file', new File([audioBlob], 'audio.mp4', { type: 'audio/mp4' }))
      formData.append('model', 'whisper-1')
      formData.append('response_format', 'json')

      console.log('Sending audio to Whisper API')
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: formData,
      })

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text()
        console.error('Whisper API error:', errorText)
        throw new Error(`Whisper API error: ${transcriptionResponse.statusText} - ${errorText}`)
      }

      const transcription = await transcriptionResponse.json()
      console.log('Transcription received:', transcription.text)
      
      // Get GPT response
      console.log('Requesting GPT response')
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'user', content: transcription.text }
          ],
        }),
      })

      if (!chatResponse.ok) {
        throw new Error(`GPT API error: ${chatResponse.statusText}`)
      }

      const chatResult = await chatResponse.json()
      const answer = chatResult.choices[0].message.content
      console.log('GPT response received:', answer)

      // Convert answer to speech
      console.log('Converting response to speech')
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
        throw new Error(`Speech API error: ${speechResponse.statusText}`)
      }

      const audioBuffer = await speechResponse.arrayBuffer()
      
      // Store in Supabase
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
      
      const { data, error } = await supabase
        .from('audio_conversations')
        .insert({
          question_text: transcription.text,
          answer_text: answer,
        })
        .select()
        .single()

      if (error) throw error

      console.log('Process completed successfully')
      return new Response(
        JSON.stringify({
          success: true,
          conversation: data,
          audioResponse: Array.from(new Uint8Array(audioBuffer)),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid type specified')
  } catch (error) {
    console.error('Error processing audio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})