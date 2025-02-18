
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type AudioConversation = {
  question_text?: string;
  answer_text?: string;
  conversation_state: string;
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase.channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=eq.displaying'
        },
        (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
          console.log('Realtime change detected:', payload)
          
          if (payload.new?.conversation_state === 'displaying') {
            setCurrentConversation({
              question_text: payload.new.question_text,
              answer_text: payload.new.answer_text
            })
          } else if (payload.new?.conversation_state === 'hidden') {
            setCurrentConversation(null)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

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
