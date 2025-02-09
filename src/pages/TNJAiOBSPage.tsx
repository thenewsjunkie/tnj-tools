
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Function to fetch the most recent active conversation
    const fetchMostRecentConversation = async () => {
      // Call manage_conversation_queue() to handle state transitions
      await supabase.rpc('manage_conversation_queue')
      
      // Then fetch the current displaying conversation
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('question_text, answer_text')
        .eq('conversation_state', 'displaying')
        .maybeSingle()

      if (data) {
        console.log('Current displaying conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
        setIsProcessing(false)
      } else {
        console.log('No active conversation found or error:', error)
        setCurrentConversation(null)
        setIsProcessing(false)
      }
    }

    // Run initial fetch
    fetchMostRecentConversation()

    // Set up realtime subscription
    const channel = supabase.channel('audio_conversations_changes')

    // Subscribe to all relevant changes
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations'
        },
        async (payload: any) => {
          console.log('Conversation change detected:', payload)
          
          // Refetch the current state when any change occurs
          await fetchMostRecentConversation()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Set up periodic queue management
    const queueInterval = setInterval(fetchMostRecentConversation, 5000)

    return () => {
      channel.unsubscribe()
      clearInterval(queueInterval)
    }
  }, [])

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
