
import { useState, useEffect, useRef } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { supabase } from '@/integrations/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from '@/components/ui/use-toast'
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection'
import { Json } from '@/integrations/supabase/types/helpers'
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

type AudioConversation = {
  id: string;
  question_text: string;
  answer_text: string;
  conversation_state: string;
  created_at: string;
  display_start_time?: string;
  display_end_time?: string;
  has_been_displayed?: boolean;
  display_count?: number;
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

// Connection status enum
enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected'
}

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING)
  const [displaySettings, setDisplaySettings] = useState<{
    isActive: boolean;
    isContinuous: boolean;
  }>({ isActive: false, isContinuous: false })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // References to store important state for background checks
  const currentConversationRef = useRef<{
    question_text?: string;
    answer_text?: string;
    id?: string;
  } | null>(null)
  const connectionStatusRef = useRef<ConnectionStatus>(ConnectionStatus.CONNECTING)
  const displaySettingsRef = useRef<{isActive: boolean; isContinuous: boolean}>({ isActive: false, isContinuous: false })
  const lastFetchTimeRef = useRef<Date | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef<boolean>(true)
  
  // Update refs when state changes
  useEffect(() => {
    currentConversationRef.current = currentConversation ? {...currentConversation} : null;
  }, [currentConversation])
  
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus])
  
  useEffect(() => {
    displaySettingsRef.current = displaySettings;
  }, [displaySettings])

  // Subscribe to conversation changes
  const { channel: conversationChannel } = useRealtimeConnection(
    'tnj-ai-conversations',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'audio_conversations'
    },
    (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
      console.log('[TNJAiOBSPage] Received conversation update:', payload)
      if (!mountedRef.current) return
      
      handleConversationEvent(payload)
      // Successful realtime event means we're connected
      if (connectionStatusRef.current !== ConnectionStatus.CONNECTED) {
        setConnectionStatus(ConnectionStatus.CONNECTED)
        setRetryCount(0)
        console.log('[TNJAiOBSPage] Realtime connection confirmed working')
      }
    }
  )

  // Subscribe to display settings changes
  const { channel: settingsChannel } = useRealtimeConnection(
    'tnj-ai-settings',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'system_settings'
    },
    (payload: RealtimePostgresChangesPayload<SystemSettings>) => {
      console.log('[TNJAiOBSPage] Received settings update:', payload)
      if (!mountedRef.current) return
      
      // Make sure payload.new exists and has the expected shape
      if (payload.new && 'key' in payload.new && payload.new.key === 'tnj_ai_obs_mode' && 'value' in payload.new) {
        const settingsValue = payload.new.value;
        if (isOBSModeSettings(settingsValue)) {
          console.log('[TNJAiOBSPage] Updated OBS mode settings:', settingsValue)
          setDisplaySettings(settingsValue)
          
          // If display is turned off, clear current conversation
          if (!settingsValue.isActive) {
            setCurrentConversation(null)
          } else if (!currentConversation) {
            // If we're activating display but don't have a conversation, fetch one
            fetchCurrentConversation()
          }
        }
      }
      
      // Successful realtime event means we're connected
      if (connectionStatusRef.current !== ConnectionStatus.CONNECTED) {
        setConnectionStatus(ConnectionStatus.CONNECTED)
        setRetryCount(0)
        console.log('[TNJAiOBSPage] Realtime connection confirmed working')
      }
    }
  )

  // Function to run auto-complete function manually to ensure stale conversations are cleaned up
  const runAutoComplete = async () => {
    try {
      await supabase.rpc('auto_complete_displayed_conversations')
      console.log('[TNJAiOBSPage] Successfully ran auto-complete function')
    } catch (error) {
      console.error('[TNJAiOBSPage] Error running auto-complete function:', error)
    }
  }

  // Setup connection health monitor
  useEffect(() => {
    // First run auto-complete at startup to clean up any stale conversations
    runAutoComplete()
    
    // Heartbeat function to check connection health
    const checkConnectionHealth = async () => {
      if (!mountedRef.current) return
      
      // If we're in a connected state, verify by checking last ping time
      if (connectionStatusRef.current === ConnectionStatus.CONNECTED) {
        const now = new Date()
        const lastFetch = lastFetchTimeRef.current
        
        // If we haven't received any data in 30 seconds, consider connection stale
        if (lastFetch && now.getTime() - lastFetch.getTime() > 30000) {
          console.log('[TNJAiOBSPage] Connection appears stale, checking status...')
          try {
            // Try a manual fetch to verify connection
            const result = await fetchCurrentConversation(false)
            if (!result && displaySettingsRef.current.isActive) {
              console.log('[TNJAiOBSPage] Connection health check failed, initiating reconnection')
              setConnectionStatus(ConnectionStatus.RECONNECTING)
              scheduleReconnect()
            }
          } catch (error) {
            console.error('[TNJAiOBSPage] Health check failed:', error)
            setConnectionStatus(ConnectionStatus.RECONNECTING)
            scheduleReconnect()
          }
        }
      }
      
      // Run auto-complete every minute to clean up stale conversations
      runAutoComplete()
    }
    
    // Set up heartbeat interval
    const heartbeatInterval = setInterval(checkConnectionHealth, 60000) // Every minute
    
    return () => {
      clearInterval(heartbeatInterval)
    }
  }, [])

  // Initialize on component mount
  useEffect(() => {
    mountedRef.current = true
    console.log('[TNJAiOBSPage] Component mounted, initializing...')
    
    const initialize = async () => {
      try {
        setConnectionStatus(ConnectionStatus.CONNECTING)
        
        // Clean up any stale connections in the database
        await runAutoComplete()
        
        // Fetch initial data
        await fetchInitialData()
        
        // Start polling as a fallback mechanism
        startPolling()
        
        setConnectionStatus(ConnectionStatus.CONNECTED)
      } catch (error) {
        console.error('[TNJAiOBSPage] Initialization error:', error)
        setConnectionStatus(ConnectionStatus.RECONNECTING)
        scheduleReconnect()
      }
    }
    
    initialize()
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    }
  }, [])
  
  // Function to schedule a reconnection attempt
  const scheduleReconnect = () => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    
    const delay = Math.min(5000 * (retryCount + 1), 30000) // Exponential backoff, max 30s
    console.log(`[TNJAiOBSPage] Scheduling reconnection in ${delay}ms (retry #${retryCount + 1})`)
    
    reconnectTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      
      console.log(`[TNJAiOBSPage] Attempting reconnection (retry #${retryCount + 1})`)
      
      // Attempt to reconnect by fetching initial data
      fetchInitialData()
        .then(() => {
          if (!mountedRef.current) return
          setConnectionStatus(ConnectionStatus.CONNECTED)
          setRetryCount(0)
          console.log('[TNJAiOBSPage] Reconnection successful')
        })
        .catch((error) => {
          if (!mountedRef.current) return
          console.error('[TNJAiOBSPage] Reconnection failed:', error)
          setRetryCount(prev => prev + 1)
          setConnectionStatus(ConnectionStatus.RECONNECTING)
          scheduleReconnect()
        })
    }, delay)
  }
  
  // Fallback polling mechanism
  const startPolling = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    
    console.log('[TNJAiOBSPage] Starting fallback polling mechanism')
    
    // Poll every 10 seconds
    pollTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return
      
      // Only use polling if we're not in a good connection state
      if (connectionStatusRef.current !== ConnectionStatus.CONNECTED || 
          (displaySettingsRef.current.isActive && !currentConversationRef.current)) {
        console.log('[TNJAiOBSPage] Polling for current conversation')
        fetchCurrentConversation(false).catch(error => {
          console.error('[TNJAiOBSPage] Polling error:', error)
        })
      }
    }, 10000)
  }

  const fetchInitialData = async () => {
    console.log('[TNJAiOBSPage] Fetching initial data...')
    
    // Fetch current display settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'tnj_ai_obs_mode')
      .maybeSingle()
    
    if (settingsError) {
      console.error('[TNJAiOBSPage] Error fetching display settings:', settingsError)
      throw settingsError
    }
    
    if (settingsData?.value) {
      const settingsValue = settingsData.value;
      if (isOBSModeSettings(settingsValue)) {
        console.log('[TNJAiOBSPage] Initial OBS mode settings:', settingsValue)
        setDisplaySettings(settingsValue)
        
        // Only fetch conversation if display is active
        if (settingsValue.isActive) {
          await fetchCurrentConversation()
        }
      }
    }
    
    // Update last fetch time
    lastFetchTimeRef.current = new Date()
    setLastUpdated(lastFetchTimeRef.current)
    return true
  }

  const handleConversationEvent = (payload: RealtimePostgresChangesPayload<AudioConversation>) => {
    // Type guard to ensure payload.new exists and has expected shape
    if (!payload.new || typeof payload.new !== 'object') {
      console.error('[TNJAiOBSPage] Invalid payload received:', payload)
      return
    }

    const newConversation = payload.new as AudioConversation
    
    console.log('[TNJAiOBSPage] Processing conversation event:', {
      eventType: payload.eventType,
      new: newConversation,
      currentState: newConversation.conversation_state,
      displaySettings
    })
    
    // Update last fetch time
    lastFetchTimeRef.current = new Date()
    setLastUpdated(lastFetchTimeRef.current)
    
    // Handle any conversation that's now displaying
    if (newConversation.conversation_state === 'displaying') {
      console.log('[TNJAiOBSPage] Found displaying conversation:', newConversation)
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
      console.log('[TNJAiOBSPage] Conversation no longer displaying:', newConversation)
      setCurrentConversation(null)
    }
  }

  const fetchCurrentConversation = async (showToast: boolean = true) => {
    if (!mountedRef.current) return false
    
    console.log('[TNJAiOBSPage] Fetching current conversation...')
    
    try {
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('*')
        .eq('conversation_state', 'displaying')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('[TNJAiOBSPage] Fetch result:', { data, error })

      if (error) {
        throw error
      }
      
      // Update last fetch time
      lastFetchTimeRef.current = new Date()
      setLastUpdated(lastFetchTimeRef.current)

      if (data && data.conversation_state === 'displaying') {
        console.log('[TNJAiOBSPage] Found displaying conversation:', data)
        setCurrentConversation({
          question_text: data.question_text,
          answer_text: data.answer_text
        })
        return true
      } else {
        console.log('[TNJAiOBSPage] No displaying conversation found')
        if (connectionStatusRef.current === ConnectionStatus.CONNECTED && currentConversationRef.current) {
          // If we're connected but no conversation is displaying, clear current
          setCurrentConversation(null)
        }
        return false
      }
    } catch (error) {
      console.error('[TNJAiOBSPage] Error fetching conversation:', error)
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to fetch current conversation',
          variant: 'destructive',
        })
      }
      return false
    }
  }

  // Function to manually trigger a reconnection
  const handleManualReconnect = async () => {
    console.log('[TNJAiOBSPage] Manual reconnection triggered')
    setConnectionStatus(ConnectionStatus.RECONNECTING)
    
    try {
      // Run cleanup first
      await runAutoComplete()
      
      // Try to reconnect
      await fetchInitialData()
      
      setConnectionStatus(ConnectionStatus.CONNECTED)
      toast({
        title: 'Reconnected',
        description: 'Connection has been reestablished',
      })
    } catch (error) {
      console.error('[TNJAiOBSPage] Manual reconnection failed:', error)
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
      toast({
        title: 'Reconnection Failed',
        description: 'Could not reestablish connection',
        variant: 'destructive',
      })
      
      // Schedule another reconnect attempt
      scheduleReconnect()
    }
  }

  // Render connection status indicator
  const renderConnectionStatus = () => {
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      return (
        <div className="fixed bottom-2 left-2 flex items-center space-x-1 text-xs text-green-500">
          <CheckCircle2 className="h-3 w-3" />
          <span>Connected</span>
          {lastUpdated && <span className="text-[10px] opacity-70">({new Date(lastUpdated).toLocaleTimeString()})</span>}
        </div>
      )
    } else if (connectionStatus === ConnectionStatus.CONNECTING || connectionStatus === ConnectionStatus.RECONNECTING) {
      return (
        <div className="fixed bottom-2 left-2 flex items-center space-x-1 text-xs text-amber-500">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>{connectionStatus === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Reconnecting...'}</span>
        </div>
      )
    } else {
      return (
        <div className="fixed bottom-2 left-2 flex items-center space-x-1 text-xs text-red-500 cursor-pointer" onClick={handleManualReconnect}>
          <AlertCircle className="h-3 w-3" />
          <span>Disconnected (click to reconnect)</span>
        </div>
      )
    }
  }

  return (
    <div>
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
      {renderConnectionStatus()}
    </div>
  )
}

export default TNJAiOBSPage
