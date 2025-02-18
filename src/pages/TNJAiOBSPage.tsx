
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type AudioConversation = {
  question_text?: string;
  answer_text?: string;
  conversation_state: string;
}

// Type guard to check if the payload is an AudioConversation
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
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('question_text, answer_text')
        .eq('conversation_state', 'displaying')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('Initial fetch result:', { data, error })

      if (error) {
        console.error('Error fetching current conversation:', error)
        return
      }

      if (data) {
        console.log('Setting initial conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
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
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=eq.displaying'
        },
        (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
          console.log('Realtime change detected:', payload)
          
          if (payload.new && isAudioConversation(payload.new)) {
            console.log('New conversation state:', payload.new.conversation_state)
            
            if (payload.new.conversation_state === 'displaying') {
              console.log('Setting new conversation:', {
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
              
              setCurrentConversation({
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=eq.pending'
        },
        () => {
          console.log('Conversation set to pending, clearing display')
          setCurrentConversation(null)
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
