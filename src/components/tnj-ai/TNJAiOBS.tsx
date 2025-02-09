
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
  const [showQuestion, setShowQuestion] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null)

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

  // Reset animations when conversation changes
  useEffect(() => {
    if (!conversation) {
      setShowQuestion(false)
      setShowAnswer(false)
      setShouldShow(false)
      if (dismissTimer) {
        clearTimeout(dismissTimer)
        setDismissTimer(null)
      }
      return
    }

    // Show the component and animate in the question
    setShouldShow(true)
    setShowQuestion(true)
    setShowAnswer(false)

    // If we have an answer, animate it in after a delay
    if (conversation.answer_text) {
      setTimeout(() => {
        setShowAnswer(true)
        
        // Start the dismiss timer after the answer appears
        const timer = setTimeout(() => {
          console.log('Starting dismiss animation')
          setShowAnswer(false)
          setTimeout(() => {
            setShowQuestion(false)
            setTimeout(() => {
              setShouldShow(false)
            }, 300)
          }, 300)
        }, 30000)
        
        setDismissTimer(timer)
      }, 1000)
    }

    // Cleanup
    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer)
      }
    }
  }, [conversation])

  if (!shouldShow) {
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
              <Computer className="h-6 w-6 text-neon-red" />
              <span className="text-neon-red font-semibold text-2xl leading-none">TNJ AI</span>
            </div>
            {conversation.question_text && (
              <div 
                className={`text-white/80 px-2 flex justify-end transition-all duration-300 ${
                  showQuestion 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="p-4 bg-gray-600 rounded-2xl max-w-[80%] transition-transform duration-300 origin-bottom-right">
                  {conversation.question_text}
                </div>
              </div>
            )}
            <div 
              className={`flex items-start gap-2 transition-all duration-300 ${
                showAnswer 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="p-4 bg-[#33C3F0] rounded-2xl max-w-[80%] transition-transform duration-300 origin-bottom-left">
                {conversation.answer_text}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
