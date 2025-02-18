
import { useState, useEffect, useCallback } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type AudioConversation = {
  question_text?: string;
  answer_text?: string;
  conversation_state: string;
  display_end_time: string;
}

// Type guard to check if payload is a valid AudioConversation
const isValidConversation = (payload: any): payload is AudioConversation => {
  return (
    payload &&
    typeof payload.conversation_state === 'string' &&
    typeof payload.display_end_time === 'string'
  )
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleNewConversation = useCallback((conversation: AudioConversation) => {
    console.log('New conversation detected:', conversation)
    
    if (conversation.conversation_state === 'displaying') {
      setCurrentConversation({
        question_text: conversation.question_text,
        answer_text: conversation.answer_text
      })

      // Set up auto-dismiss based on display_end_time
      const endTime = new Date(conversation.display_end_time).getTime()
      const now = new Date().getTime()
      const timeRemaining = Math.max(0, endTime - now)

      setTimeout(() => {
        setCurrentConversation(null)
      }, timeRemaining)
    }
  }, [])

  useEffect(() => {
    // Initial fetch of any currently displaying conversation
    const fetchCurrentConversation = async () => {
      const { data: conversation, error } = await supabase
        .from('audio_conversations')
        .select('question_text, answer_text, conversation_state, display_end_time')
        .eq('conversation_state', 'displaying')
        .single()

      if (error) {
        console.log('No active conversation found:', error)
        return
      }

      if (isValidConversation(conversation)) {
        handleNewConversation(conversation)
      }
    }

    fetchCurrentConversation()

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
          
          if (payload.new && isValidConversation(payload.new)) {
            handleNewConversation(payload.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [handleNewConversation])

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
