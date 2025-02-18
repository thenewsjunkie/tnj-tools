
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
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 2000 // 2 seconds
    
    const setupRealtimeSubscription = async () => {
      console.log('Setting up realtime subscription...')
      
      try {
        // Set up the channel with broader event monitoring
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'audio_conversations'
            },
            (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
              console.log('Received realtime update:', payload)
              
              // Type guard to ensure payload.new exists and has expected shape
              if (!payload.new || typeof payload.new !== 'object') {
                console.error('Invalid payload received:', payload)
                return
              }

              const newConversation = payload.new as AudioConversation
              const oldConversation = payload.old as Partial<AudioConversation>
              
              // Handle any conversation that's now displaying
              if (newConversation.conversation_state === 'displaying') {
                console.log('Found displaying conversation:', newConversation)
                setCurrentConversation({
                  question_text: newConversation.question_text,
                  answer_text: newConversation.answer_text
                })
                toast({
                  title: 'New Conversation',
                  description: 'Received new conversation to display',
                })
              } 
              // If the current conversation was changed to pending/completed
              else if (
                oldConversation?.conversation_state === 'displaying' &&
                newConversation.conversation_state !== 'displaying'
              ) {
                console.log('Conversation no longer displaying:', newConversation)
                setCurrentConversation(null)
              }
            }
          )
          .subscribe(async (status) => {
            console.log('Subscription status changed:', status)
            setSubscriptionStatus(status)
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to realtime updates')
              retryCount = 0 // Reset retry count on successful subscription
              // Fetch initial state after subscription is confirmed
              await fetchCurrentConversation()
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Channel error occurred')
              toast({
                title: 'Connection Error',
                description: 'Lost connection to realtime updates',
                variant: 'destructive',
              })
              
              // Attempt to reconnect
              if (retryCount < maxRetries) {
                retryCount++
                console.log(`Retrying connection (attempt ${retryCount})...`)
                setTimeout(() => {
                  if (channel) {
                    channel.unsubscribe()
                  }
                  setupRealtimeSubscription()
                }, retryDelay)
              }
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
