import { useState, useEffect } from 'react'
import { Computer } from 'lucide-react'

interface TNJAiOBSProps {
  conversation: {
    question_text?: string;
    answer_text?: string;
  } | null;
  isProcessing: boolean;
}

export const TNJAiOBS = ({ conversation, isProcessing }: TNJAiOBSProps) => {
  const [shouldShow, setShouldShow] = useState(false)
  const [loadingDots, setLoadingDots] = useState('.')

  // Handle dots animation
  useEffect(() => {
    if (!isProcessing) {
      setLoadingDots('.')
      return
    }

    const interval = setInterval(() => {
      setLoadingDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing])

  // Handle visibility and auto-dismiss
  useEffect(() => {
    if (isProcessing || (conversation && conversation.answer_text)) {
      console.log('TNJ AI OBS: Showing overlay - Processing:', isProcessing, 'Conversation:', conversation)
      setShouldShow(true)
      return
    }

    if (!isProcessing && conversation?.answer_text) {
      console.log('TNJ AI OBS: Setting up auto-dismiss timer')
      const timer = setTimeout(() => {
        console.log('TNJ AI OBS: Auto-dismissing')
        setShouldShow(false)
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  }, [isProcessing, conversation])

  console.log('TNJ AI OBS Component:', { conversation, isProcessing, shouldShow })

  if (!shouldShow) {
    console.log('TNJ AI OBS: Not showing overlay')
    return null
  }

  return (
    <div className="fixed top-0 left-0">
      <div className="text-white">
        {isProcessing ? (
          <div className="flex items-center">
            <Computer className="h-6 w-6" />
            <span className="font-mono w-6">{loadingDots}</span>
          </div>
        ) : conversation?.answer_text ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-4">
              <Computer className="h-18 w-18 text-neon-red" />
              <span className="text-neon-red font-semibold text-2xl leading-none">TNJ AI</span>
            </div>
            {conversation.question_text && (
              <div className="text-white/80 px-2 flex justify-end">
                <div className="p-4 bg-gray-600 rounded-2xl max-w-[80%]">
                  {conversation.question_text}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="p-4 bg-[#33C3F0] rounded-2xl max-w-[80%]">
                {conversation.answer_text}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
