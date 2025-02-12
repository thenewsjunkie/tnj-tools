
import { useState, useEffect, useCallback } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'

type AudioConversation = Database['public']['Tables']['audio_conversations']['Row']

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchNewConversation = useCallback(async () => {
    const { data, error } = await supabase
      .from('audio_conversations')
      .select('question_text, answer_text')
      .eq('conversation_state', 'displaying')
      .eq('has_been_displayed', false)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.log('No new conversation found or error:', error)
      setCurrentConversation(null)
      setIsProcessing(false)
      return
    }

    if (data) {
      console.log('New conversation:', data)
      setCurrentConversation({
        question_text: data.question_text,
        answer_text: data.answer_text
      })
      setIsProcessing(false)

      // Mark conversation as displayed
      const { error: updateError } = await supabase
        .from('audio_conversations')
        .update({ 
          has_been_displayed: true,
          display_start_time: new Date().toISOString(),
          display_end_time: new Date(Date.now() + 30000).toISOString() // 30 seconds from now
        })
        .eq('question_text', data.question_text)
        .eq('answer_text', data.answer_text)

      if (updateError) {
        console.error('Error marking conversation as displayed:', updateError)
      }
    }
  }, [])

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase.channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations'
        },
        async (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
          console.log('Conversation change detected:', payload)
          // Only check for new conversations when a change occurs and ensure payload.new exists
          if (payload.new && 
              'conversation_state' in payload.new && 
              'has_been_displayed' in payload.new && 
              payload.new.conversation_state === 'displaying' && 
              !payload.new.has_been_displayed) {
            await fetchNewConversation()
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Initial fetch
    fetchNewConversation()

    return () => {
      channel.unsubscribe()
    }
  }, [fetchNewConversation])

  // Clear conversation after 30 seconds
  useEffect(() => {
    if (currentConversation) {
      const timer = setTimeout(() => {
        setCurrentConversation(null)
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [currentConversation])

  // Log state changes for debugging
  useEffect(() => {
    console.log('TNJ AI OBS: Current state', {
      isProcessing,
      currentConversation
    })
  }, [isProcessing, currentConversation])

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
