
import { useState, useEffect, useCallback } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchMostRecentConversation = useCallback(async () => {
    const { data, error } = await supabase
      .from('audio_conversations')
      .select('question_text, answer_text')
      .eq('conversation_state', 'displaying')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.log('No active conversation found or error:', error)
      setCurrentConversation(null)
      setIsProcessing(false)
      return
    }

    if (data) {
      // Only update state if the data has actually changed
      const hasChanged = JSON.stringify(data) !== JSON.stringify(currentConversation)
      if (hasChanged) {
        console.log('Current displaying conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
        setIsProcessing(false)
      }
    }
  }, [currentConversation]) // Add currentConversation as dependency

  useEffect(() => {
    // Run initial queue management and fetch
    const initializeDisplay = async () => {
      await supabase.rpc('manage_conversation_queue')
      await fetchMostRecentConversation()
    }
    
    initializeDisplay()

    // Set up realtime subscription
    const channel = supabase.channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations'
        },
        async (payload) => {
          console.log('Conversation change detected:', payload)
          // Only manage queue and fetch if the change affects the displaying conversation
          const affectedRow = payload.new || payload.old
          if (affectedRow && affectedRow.conversation_state === 'displaying') {
            await supabase.rpc('manage_conversation_queue')
            await fetchMostRecentConversation()
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Run queue management less frequently as a backup
    const queueInterval = setInterval(async () => {
      await supabase.rpc('manage_conversation_queue')
      await fetchMostRecentConversation()
    }, 10000) // Increased to 10 seconds

    return () => {
      channel.unsubscribe()
      clearInterval(queueInterval)
    }
  }, [fetchMostRecentConversation]) // Add fetchMostRecentConversation as dependency

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
