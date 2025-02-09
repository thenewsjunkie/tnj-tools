
import { useState, useEffect } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)

  const {
    isProcessing,
    isRecording,
    startRecording,
    stopRecording
  } = useAudioRecording({
    onProcessingComplete: (data) => {
      console.log('TNJ AI OBS: Processing complete with data:', data)
      if (data?.conversation) {
        console.log('TNJ AI OBS: Setting conversation:', data.conversation)
        setCurrentConversation(data.conversation)
      }
    },
    onError: (error) => {
      console.error('TNJ AI OBS Error:', error)
      setCurrentConversation(null)
    }
  })

  // Log state changes for debugging
  useEffect(() => {
    console.log('TNJ AI OBS: Current state', {
      isProcessing,
      isRecording,
      currentConversation
    })
  }, [isProcessing, isRecording, currentConversation])

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="h-screen w-screen bg-transparent flex items-center justify-center">
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
      <Button 
        onClick={handleToggleRecording}
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className="fixed bottom-8 flex gap-2 items-center"
      >
        {isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  )
}

export default TNJAiOBSPage

