
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
        setIsProcessing(!data.answer_text) // Set processing if we only have a question
      } else {
        console.log('No active conversation found or error:', error)
        setCurrentConversation(null)
        setIsProcessing(false)
      }
    }

    // Subscribe to changes on the audio_conversations table
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
          
          // If this is a new question with is_shown_in_obs = true
          if (payload.new?.is_shown_in_obs && payload.new?.question_text) {
            console.log('New question detected')
            setIsProcessing(true)
            setCurrentConversation({
              question_text: payload.new.question_text,
              answer_text: undefined
            })
          }
          
          // If an answer is added to a shown conversation
          if (payload.new?.is_shown_in_obs && payload.new?.answer_text) {
            console.log('Answer received')
            setCurrentConversation({
              question_text: payload.new.question_text,
              answer_text: payload.new.answer_text
            })
            setIsProcessing(false)
          }

          // If is_shown_in_obs becomes false, clear the conversation
          if (payload.new?.is_shown_in_obs === false) {
            console.log('Conversation hidden from OBS')
            setCurrentConversation(null)
            setIsProcessing(false)
          }
        }
      )
      .subscribe()

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
