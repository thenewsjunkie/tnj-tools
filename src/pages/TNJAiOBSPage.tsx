
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
        .select('question_text, answer_text, conversation_state')
        .eq('conversation_state', 'displaying')
        .order('display_start_time', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        console.log('Fetched conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
        setIsProcessing(!data.answer_text)
      } else {
        console.log('No active conversation found or error:', error)
        setCurrentConversation(null)
        setIsProcessing(false)
      }
    }

    // Function to cleanup completed conversations
    const cleanupCompletedConversations = async () => {
      const { error } = await supabase
        .rpc('auto_complete_displayed_conversations')
      
      if (error) {
        console.error('Error cleaning up conversations:', error)
      }
    }

    // Run initial cleanup and fetch
    cleanupCompletedConversations()
    fetchMostRecentConversation()

    // Subscribe to changes on the audio_conversations table
    const subscription = supabase
      .channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=eq.displaying'
        },
        (payload: any) => {
          console.log('Audio conversation change detected:', payload)
          
          if (payload.new) {
            console.log('New conversation state:', payload.new.conversation_state)
            
            if (payload.new.conversation_state === 'displaying') {
              setCurrentConversation({
                question_text: payload.new.question_text,
                answer_text: payload.new.answer_text
              })
              setIsProcessing(!payload.new.answer_text)
            } else {
              setCurrentConversation(null)
              setIsProcessing(false)
            }
          }
        }
      )
      .subscribe()

    // Set up periodic cleanup
    const cleanupInterval = setInterval(cleanupCompletedConversations, 5000)

    return () => {
      subscription.unsubscribe()
      clearInterval(cleanupInterval)
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
