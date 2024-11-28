import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Mic, Square } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { AudioControls } from './audio/AudioControls'
import { ConversationDisplay } from './audio/ConversationDisplay'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { useAudioPlayback } from '@/hooks/useAudioPlayback'

const TNJAi = () => {
  const { toast } = useToast()
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
    onProcessingComplete: (data) => {
      setCurrentConversation(data.conversation)
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

  return (
    <div className="p-4 bg-card rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-semibold mb-4">TNJ AI</h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
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
  )
}

export default TNJAi