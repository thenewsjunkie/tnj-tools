
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type AudioConversation = {
  id: string;
  question_text?: string;
  answer_text?: string;
  conversation_state: string;
  created_at: string;
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch current displaying conversation
  const fetchCurrentConversation = async () => {
    console.log('Fetching current conversation...')
    
    const { data, error } = await supabase
      .from('audio_conversations')
      .select('*')
      .eq('conversation_state', 'displaying')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('Fetch result:', { data, error })

    if (error) {
      console.error('Error fetching current conversation:', error)
      return
    }

    if (data && data.conversation_state === 'displaying') {
      console.log('Found displaying conversation:', data)
      setCurrentConversation({
        question_text: data.question_text,
        answer_text: data.answer_text
      })
    } else {
      console.log('No displaying conversation found')
      setCurrentConversation(null)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCurrentConversation()
  }, [])

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription...')
    
    const channel = supabase.channel('audio_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=displaying'
        },
        (payload) => {
          console.log('Display update detected:', payload)
          fetchCurrentConversation()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_conversations',
          filter: 'conversation_state=pending'
        },
        () => {
          console.log('Conversation hidden, clearing display')
          setCurrentConversation(null)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription')
      channel.unsubscribe()
    }
  }, [])

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
