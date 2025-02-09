
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
        async (payload) => {
          console.log('New conversation shown in OBS:', payload)
          // Fetch the most recent conversation instead of using payload directly
          await fetchMostRecentConversation()
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
        async (payload) => {
          console.log('Conversation updated in OBS:', payload)
          // Fetch the most recent conversation instead of using payload directly
          await fetchMostRecentConversation()
          setIsProcessing(false)
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
    <div className="h-screen w-screen bg-transparent">
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
    </div>
  )
}

export default TNJAiOBSPage
