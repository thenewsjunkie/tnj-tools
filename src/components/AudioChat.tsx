
import { useState, useRef } from 'react'
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
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const [isDisplayingInOBS, setIsDisplayingInOBS] = useState(false)
  
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  } = useAudioRecording({
    onProcessingComplete: async (data) => {
      setCurrentConversation(data.conversation)
      
      // Insert conversation into database without marking it for OBS display
      const { error } = await supabase
        .from('audio_conversations')
        .insert({
          question_text: data.conversation.question_text,
          answer_text: data.conversation.answer_text,
          status: 'completed',
          conversation_state: 'hidden'
        })

      if (error) {
        console.error('Error saving conversation:', error)
        toast({
          title: 'Error',
          description: 'Failed to save conversation',
          variant: 'destructive',
        })
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

  const toggleOBSDisplay = async () => {
    const newState = !isDisplayingInOBS
    setIsDisplayingInOBS(newState)

    const { error } = await supabase
      .from('audio_conversations')
      .update({
        conversation_state: newState ? 'displaying' : 'hidden'
      })
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error updating conversation state:', error)
      toast({
        title: 'Error',
        description: 'Failed to update conversation state',
        variant: 'destructive',
      })
      setIsDisplayingInOBS(!newState) // Revert state on error
      return
    }

    toast({
      title: newState ? 'Showing in OBS' : 'Hidden from OBS',
      description: newState ? 'Conversation is now visible in OBS' : 'Conversation is now hidden from OBS',
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
            >
              {isDisplayingInOBS ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </Button>
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
