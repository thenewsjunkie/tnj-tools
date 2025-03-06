
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from '@/components/ui/use-toast'
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection'
import { Json } from '@/integrations/supabase/types/helpers'

type AudioConversation = {
  id: string;
  question_text: string;
  answer_text: string;
  conversation_state: string;
  created_at: string;
}

type SystemSettings = {
  key: string;
  value: Json;
}

// Type guard to check if a value is a valid OBSMode settings object
const isOBSModeSettings = (value: any): value is { isActive: boolean, isContinuous: boolean } => {
  return value && 
    typeof value === 'object' && 
    'isActive' in value && 
    'isContinuous' in value &&
    typeof value.isActive === 'boolean' &&
    typeof value.isContinuous === 'boolean';
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [displaySettings, setDisplaySettings] = useState<{
    isActive: boolean;
    isContinuous: boolean;
  }>({ isActive: false, isContinuous: false })

  // Subscribe to conversation changes
  useRealtimeConnection(
    'tnj-ai-conversations',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'audio_conversations'
    },
    (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
      console.log('Received conversation update:', payload)
      handleConversationEvent(payload)
    }
  )

  // Subscribe to display settings changes
  useRealtimeConnection(
    'tnj-ai-settings',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'system_settings'
    },
    (payload: RealtimePostgresChangesPayload<SystemSettings>) => {
      console.log('Received settings update:', payload)
      if (payload.new && payload.new.key === 'tnj_ai_obs_mode') {
        const settingsValue = payload.new.value;
        if (isOBSModeSettings(settingsValue)) {
          console.log('Updated OBS mode settings:', settingsValue)
          setDisplaySettings(settingsValue)
          
          // If display is turned off, clear current conversation
          if (!settingsValue.isActive) {
            setCurrentConversation(null)
          }
        }
      }
    }
  )

  useEffect(() => {
    let mounted = true
    
    const fetchInitialData = async () => {
      // Fetch current display settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'tnj_ai_obs_mode')
        .maybeSingle()
      
      if (settingsData?.value) {
        const settingsValue = settingsData.value;
        if (isOBSModeSettings(settingsValue)) {
          console.log('Initial OBS mode settings:', settingsValue)
          if (mounted) {
            setDisplaySettings(settingsValue)
          }
          
          // Only fetch conversation if display is active
          if (settingsValue.isActive) {
            await fetchCurrentConversation()
          }
        }
      }
    }

    const setupRealtimeSubscription = async () => {
      console.log('Setting up realtime subscription...')
      setSubscriptionStatus('SUBSCRIBED')
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      mounted = false
    }
  }, [])

  const handleConversationEvent = (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
    // Type guard to ensure payload.new exists and has expected shape
    if (!payload.new || typeof payload.new !== 'object') {
      console.error('Invalid payload received:', payload)
      return
    }

    const newConversation = payload.new as AudioConversation
    
    console.log('Processing conversation event:', {
      eventType: payload.eventType,
      new: newConversation,
      currentState: newConversation.conversation_state,
      displaySettings
    })
    
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
    // If the conversation was changed from displaying to something else
    // Use type assertion to safely check the old conversation state
    else if (
      payload.old && 
      'conversation_state' in payload.old && 
      payload.old.conversation_state === 'displaying' &&
      newConversation.conversation_state !== 'displaying'
    ) {
      console.log('Conversation no longer displaying:', newConversation)
      setCurrentConversation(null)
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
