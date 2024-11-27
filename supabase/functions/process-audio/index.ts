import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
      // Transcribe audio to text using OpenAI Whisper
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: audioData,
      })

      const transcription = await transcriptionResponse.json()
      
      // Get GPT response
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

      const chatResult = await chatResponse.json()
      const answer = chatResult.choices[0].message.content

      // Convert answer to speech
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

      const audioBlob = await speechResponse.blob()
      
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

      return new Response(
        JSON.stringify({
          success: true,
          conversation: data,
          audioResponse: await audioBlob.arrayBuffer(),
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