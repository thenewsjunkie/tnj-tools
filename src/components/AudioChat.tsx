
import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Mic, Square, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { AudioControls } from './audio/AudioControls'
import { ConversationDisplay } from './audio/ConversationDisplay'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'
import { useTheme } from '@/components/theme/ThemeProvider'

const TNJAi = () => {
  const { toast } = useToast()
  const { theme } = useTheme()
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isDisplayingInOBS, setIsDisplayingInOBS] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  
  // Check initial state on mount
  useEffect(() => {
    const checkCurrentState = async () => {
      // First check if there's an active display status
      const { data: displayStatus, error: displayError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'tnj_ai_obs_mode')
        .maybeSingle()
      
      if (displayStatus?.value && typeof displayStatus.value === 'object') {
        // Type assertion for TypeScript
        const typedValue = displayStatus.value as { isActive: boolean, isContinuous: boolean }
        setIsDisplayingInOBS(typedValue.isActive)
        setContinuousMode(typedValue.isContinuous)
      }
      
      // Then check if there's an active conversation
      const { data, error } = await supabase
        .from('audio_conversations')
        .select('id, conversation_state')
        .eq('conversation_state', 'displaying')
        .maybeSingle()
      
      console.log('Initial OBS state check:', { data, error, displayStatus })
      if (data) {
        setCurrentConversationId(data.id)
        setIsDisplayingInOBS(true)
      }
    }
    
    checkCurrentState()
  }, [])
  
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  } = useAudioRecording({
    onProcessingComplete: async (data) => {
      console.log('Processing complete, saving conversation:', data.conversation)
      setCurrentConversation(data.conversation)
      
      // Insert conversation into database
      const { data: insertedData, error } = await supabase
        .from('audio_conversations')
        .insert({
          question_text: data.conversation.question_text,
          answer_text: data.conversation.answer_text,
          status: 'completed',
          conversation_state: 'pending',
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving conversation:', error)
        toast({
          title: 'Error',
          description: 'Failed to save conversation',
          variant: 'destructive',
        })
        return
      }

      console.log('Successfully saved conversation:', insertedData)
      setCurrentConversationId(insertedData.id)

      // If continuous mode is active, auto-display in OBS
      if (continuousMode && isDisplayingInOBS) {
        await displayConversationInOBS(insertedData.id)
      }

      if (audioPlayer.current) {
        audioPlayer.current.src = URL.createObjectURL(
          new Blob([data.audioResponse], { type: 'audio/mpeg' })
        )
        audioPlayer.current.volume = volume[0]
        audioPlayer.current.play()
        setIsPlaying(true)
        setIsPaused(false)
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const {
    isPlaying,
    isPaused,
    volume,
    audioPlayer,
    setIsPlaying,
    setIsPaused,
    handlePlaybackEnded,
    handleVolumeChange,
    togglePlayPause
  } = useAudioPlayback()

  // Function to display conversation in OBS
  const displayConversationInOBS = async (conversationId: string) => {
    // First, update all displaying conversations to completed state
    await supabase
      .from('audio_conversations')
      .update({ conversation_state: 'completed' })
      .eq('conversation_state', 'displaying')
    
    // Use our mark_as_displayed function to set this conversation as displaying
    const { error } = await supabase.rpc('mark_as_displayed', {
      conversation_id: conversationId
    })
      
    if (error) {
      console.error('Error updating conversation state:', error)
      toast({
        title: 'Error',
        description: 'Failed to update conversation state',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const toggleOBSDisplay = async () => {
    if (!currentConversationId && !isDisplayingInOBS) {
      toast({
        title: 'Error',
        description: 'No conversation available to display',
        variant: 'destructive',
      })
      return
    }

    const newDisplayState = !isDisplayingInOBS
    
    if (newDisplayState) {
      // Display current conversation
      if (currentConversationId) {
        const success = await displayConversationInOBS(currentConversationId)
        if (!success) return
      }
    } else {
      // Hide current conversation
      const { error } = await supabase
        .from('audio_conversations')
        .update({ conversation_state: 'completed' })
        .eq('conversation_state', 'displaying')
        
      if (error) {
        console.error('Error updating conversation state:', error)
        toast({
          title: 'Error',
          description: 'Failed to update conversation state',
          variant: 'destructive',
        })
        return
      }
    }

    // Update the system setting to remember our display state
    const { error: settingsError } = await supabase
      .from('system_settings')
      .upsert({
        key: 'tnj_ai_obs_mode',
        value: { isActive: newDisplayState, isContinuous: newDisplayState ? continuousMode : false },
        updated_at: new Date().toISOString()
      })
      
    if (settingsError) {
      console.error('Error updating system settings:', settingsError)
    }

    setIsDisplayingInOBS(newDisplayState)
    // If we're turning off display, also turn off continuous mode
    if (!newDisplayState) {
      setContinuousMode(false)
    }

    toast({
      title: newDisplayState ? 'Showing in OBS' : 'Hidden from OBS',
      description: newDisplayState ? 'Conversation is now visible in OBS' : 'Conversation is now hidden from OBS',
    })
  }

  const toggleContinuousMode = async () => {
    if (!isDisplayingInOBS) {
      toast({
        title: 'Note',
        description: 'Please enable OBS display first',
      })
      return
    }

    const newContinuousMode = !continuousMode
    
    // Update the system setting
    const { error: settingsError } = await supabase
      .from('system_settings')
      .upsert({
        key: 'tnj_ai_obs_mode',
        value: { isActive: isDisplayingInOBS, isContinuous: newContinuousMode },
        updated_at: new Date().toISOString()
      })
      
    if (settingsError) {
      console.error('Error updating system settings:', settingsError)
      toast({
        title: 'Error',
        description: 'Failed to update continuous mode setting',
        variant: 'destructive',
      })
      return
    }

    setContinuousMode(newContinuousMode)
    toast({
      title: newContinuousMode ? 'Auto-Display Enabled' : 'Auto-Display Disabled',
      description: newContinuousMode 
        ? 'New conversations will automatically appear in OBS' 
        : 'New conversations will need to be manually displayed',
    })
  }

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50'

  return (
    <div className={`rounded-lg ${bgColor} text-card-foreground shadow-sm border border-gray-200 dark:border-white/10`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold tnj-ai-title">TNJ AI</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleOBSDisplay}
              className={`transition-colors ${
                isDisplayingInOBS 
                  ? 'text-neon-red hover:text-tnj-light' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isDisplayingInOBS ? "Hide from OBS" : "Show in OBS"}
            >
              {isDisplayingInOBS ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </Button>
            
            {isDisplayingInOBS && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleContinuousMode}
                className={`transition-colors text-xs ${
                  continuousMode 
                    ? 'bg-neon-red/10 text-neon-red hover:bg-neon-red/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={continuousMode ? "Turn off auto-display" : "Enable auto-display for new conversations"}
              >
                {continuousMode ? "Auto" : "Manual"}
              </Button>
            )}
            
            <a 
              href="/tnj-ai-obs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neon-red hover:text-tnj-light transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="dark:bg-background dark:text-white dark:hover:bg-accent light:bg-white light:text-tnj-dark light:hover:bg-accent border-2 border-tnj-dark dark:border-white"
            >
              {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
          </div>
          
          <AudioControls
            isPaused={isPaused}
            isPlaying={isPlaying}
            volume={volume}
            onPlayPause={togglePlayPause}
            onVolumeChange={handleVolumeChange}
          />

          <ConversationDisplay conversation={currentConversation} />
          
          <audio
            ref={audioPlayer}
            onEnded={handlePlaybackEnded}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}

export default TNJAi
