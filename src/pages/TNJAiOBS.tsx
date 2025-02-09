
import { useState } from 'react'
import { TNJAiOBS } from '@/components/tnj-ai/TNJAiOBS'
import { useAudioRecording } from '@/hooks/useAudioRecording'

const TNJAiOBSPage = () => {
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)

  const {
    isProcessing,
  } = useAudioRecording({
    onProcessingComplete: (data) => {
      console.log('TNJ AI OBS: Processing complete', data)
      setCurrentConversation(data.conversation)
    },
    onError: (error) => {
      console.error('TNJ AI OBS Error:', error)
    }
  })

  console.log('TNJ AI OBS: Current state', { isProcessing, currentConversation })

  return (
    <div className="h-screen w-screen bg-transparent">
      <TNJAiOBS
        conversation={currentConversation}
        isProcessing={isProcessing}
      />
    </div>
  )
}

export default TNJAiOBSPage
