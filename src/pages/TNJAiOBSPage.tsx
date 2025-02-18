
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type AudioConversation = {
  id: string;
  question_text?: string;
  answer_text?: string;
  conversation_state: string;
  created_at: string;
}

const isAudioConversation = (payload: unknown): payload is AudioConversation => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'conversation_state' in payload &&
    typeof (payload as AudioConversation).conversation_state === 'string'
  )
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch current displaying conversation
  useEffect(() => {
    const fetchCurrentConversation = async () => {
      console.log('Fetching current conversation...')
      
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('*')
        .eq('conversation_state', 'displaying')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('Initial fetch result:', { data, error })

      if (error) {
        console.error('Error fetching current conversation:', error)
        return
      }

      if (data && data.conversation_state === 'displaying') {
        console.log('Found displaying conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
      } else {
        console.log('No displaying conversation found')
        setCurrentConversation(null)
      }
    }

    fetchCurrentConversation()
  }, [])

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription...')
    
    const channel = supabase.channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations'
        },
        (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
          console.log('Realtime change detected:', payload)
          
          if (payload.new && isAudioConversation(payload.new)) {
            console.log('Processing conversation update:', {
              id: payload.new.id,
              state: payload.new.conversation_state,
              created_at: payload.new.created_at
            })
            
            if (payload.new.conversation_state === 'displaying') {
              console.log('Setting new conversation:', {
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
              
              setCurrentConversation({
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
            } else {
              console.log('Clearing conversation display')
              setCurrentConversation(null)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription')
      channel.unsubscribe()
    }
  }, [])

  console.log('Rendering with conversation:', currentConversation)

  return (
    <div>
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
    </div>
  )
}

export default TNJAiOBSPage
