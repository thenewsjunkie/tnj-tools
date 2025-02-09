
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
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('question_text, answer_text')
        .eq('is_shown_in_obs', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        console.log('Fetched conversation:', data)
        setCurrentConversation(data)
      } else {
        console.log('No active conversation found or error:', error)
        setCurrentConversation(null)
      }
    }

    // Subscribe to ALL changes on the audio_conversations table
    const subscription = supabase
      .channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations'
        },
        async (payload: any) => {
          console.log('Audio conversation change detected:', payload)
          
          // If this is a new conversation starting (only question, no answer)
          if (payload.new?.question_text && !payload.new?.answer_text) {
            console.log('New question detected, setting processing state')
            setIsProcessing(true)
            setCurrentConversation({
              question_text: payload.new.question_text
            })
          }
          
          // If this is an answer being added
          if (payload.new?.is_shown_in_obs === true && payload.new?.answer_text) {
            console.log('Answer received, updating conversation')
            setCurrentConversation({
              question_text: payload.new.question_text,
              answer_text: payload.new.answer_text
            })
            setIsProcessing(false)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Initial fetch
    fetchMostRecentConversation()

    return () => {
      subscription.unsubscribe()
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
