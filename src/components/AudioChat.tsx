
import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Mic, Square, ExternalLink } from 'lucide-react'
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
  
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  } = useAudioRecording({
    onProcessingComplete: async (data) => {
      setCurrentConversation(data.conversation)
      
      // Insert conversation into database and mark it for OBS display
      const { error } = await supabase
        .from('audio_conversations')
        .insert({
          question_text: data.conversation.question_text,
          answer_text: data.conversation.answer_text,
          status: 'completed',
          is_shown_in_obs: true
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

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50'

  return (
    <div className={`rounded-lg ${bgColor} text-card-foreground shadow-sm border border-gray-200 dark:border-white/10`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold tnj-ai-title">TNJ AI</h2>
          <a 
            href="/tnj-ai-obs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-red hover:text-tnj-light transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
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
