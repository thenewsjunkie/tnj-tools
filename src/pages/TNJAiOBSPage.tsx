
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from '@/components/ui/use-toast'

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
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    
    const setupRealtimeSubscription = async () => {
      console.log('Setting up realtime subscription...')
      
      try {
        // First test the connection
        const { error: pingError } = await supabase.rpc('notify_ping')
        if (pingError) {
          console.error('Failed to ping database:', pingError)
          toast({
            title: 'Connection Error',
            description: 'Failed to establish realtime connection',
            variant: 'destructive',
          })
          return
        }

        // Then set up the channel
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'audio_conversations',
              filter: 'conversation_state=eq.displaying'
            },
            (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
              console.log('Received realtime update:', payload)
              
              if (payload.eventType === 'UPDATE') {
                const newState = payload.new.conversation_state
                console.log('Conversation state changed to:', newState)
                
                if (newState === 'displaying') {
                  console.log('Setting new displaying conversation')
                  setCurrentConversation({
                    question_text: payload.new.question_text,
                    answer_text: payload.new.answer_text
                  })
                  toast({
                    title: 'New Conversation',
                    description: 'Received new conversation to display',
                  })
                } else if (newState === 'pending') {
                  console.log('Clearing displayed conversation')
                  setCurrentConversation(null)
                }
              }
            }
          )
          .subscribe(async (status) => {
            console.log('Subscription status changed:', status)
            setSubscriptionStatus(status)
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to realtime updates')
              // Fetch initial state after subscription is confirmed
              await fetchCurrentConversation()
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Channel error occurred')
              toast({
                title: 'Connection Error',
                description: 'Lost connection to realtime updates',
                variant: 'destructive',
              })
            }
          })
      } catch (error) {
        console.error('Error setting up realtime:', error)
        toast({
          title: 'Setup Error',
          description: 'Failed to set up realtime updates',
          variant: 'destructive',
        })
      }
    }

    const fetchCurrentConversation = async () => {
      console.log('Fetching current conversation...')
      
      try {
        const { data, error } = await supabase
          .from('audio_conversations')
          .select('*')
          .eq('conversation_state', 'displaying')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        console.log('Fetch result:', { data, error })

        if (error) {
          throw error
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
      } catch (error) {
        console.error('Error fetching conversation:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch current conversation',
          variant: 'destructive',
        })
      }
    }

    // Start the setup
    setupRealtimeSubscription()

    // Cleanup
    return () => {
      console.log('Cleaning up subscription...')
      if (channel) {
        console.log('Unsubscribing from channel...')
        channel.unsubscribe()
      }
    }
  }, []) // Empty dependency array to run only on mount/unmount

  // Debug render
  console.log('Rendering TNJAiOBSPage:', {
    currentConversation,
    subscriptionStatus,
    isProcessing
  })

  return (
    <div>
      {subscriptionStatus === 'SUBSCRIBED' ? (
        <TNJAiOBS
          conversation={currentConversation}
          isProcessing={isProcessing}
        />
      ) : (
        <div className="p-4 text-center">
          <p>Connecting to realtime updates...</p>
        </div>
      )}
    </div>
  )
}

export default TNJAiOBSPage
