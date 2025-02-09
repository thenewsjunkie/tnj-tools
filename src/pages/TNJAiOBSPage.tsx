
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
    // Subscribe to new conversations being shown in OBS
    const subscription = supabase
      .channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'is_shown_in_obs=eq.true'
        },
        (payload) => {
          console.log('New conversation shown in OBS:', payload)
          const { question_text, answer_text } = payload.new
          setCurrentConversation({ question_text, answer_text })
          setIsProcessing(false)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'is_shown_in_obs=eq.true'
        },
        (payload) => {
          console.log('Conversation updated in OBS:', payload)
          const { question_text, answer_text } = payload.new
          setCurrentConversation({ question_text, answer_text })
          setIsProcessing(false)
        }
      )
      .subscribe()

    // Initial fetch of any active conversation
    const fetchActiveConversation = async () => {
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('question_text, answer_text')
        .eq('is_shown_in_obs', true)
        .order('created_at', { ascending: false }) // Changed from shown_in_obs_at to created_at
        .limit(1)
        .single()

      if (data && !error) {
        console.log('Initial active conversation:', data)
        setCurrentConversation(data)
      } else {
        console.log('No active conversation found or error:', error)
        setCurrentConversation(null) // Reset if no conversation found
      }
    }

    fetchActiveConversation()

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
    <div className="h-screen w-screen bg-transparent">
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
    </div>
  )
}

export default TNJAiOBSPage
