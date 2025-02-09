
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
        .select('question_text, answer_text, is_shown_in_obs')
        .eq('is_shown_in_obs', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        console.log('Fetched conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
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
          table: 'audio_conversations',
          filter: 'is_shown_in_obs=eq.true'
        },
        (payload: any) => {
          console.log('Audio conversation change detected:', payload)
          
          // Handle inserts and updates
          if (payload.new) {
            if (payload.new.is_shown_in_obs) {
              console.log('New conversation or update:', payload.new)
              setCurrentConversation({
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
              setIsProcessing(!payload.new.answer_text)
            } else {
              // Conversation is no longer shown in OBS
              console.log('Conversation hidden from OBS')
              setCurrentConversation(null)
              setIsProcessing(false)
            }
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
