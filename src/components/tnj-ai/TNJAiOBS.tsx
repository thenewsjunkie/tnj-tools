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
  const [activeConversation, setActiveConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)

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

  // Handle conversation changes with proper transition timing
  useEffect(() => {
    if (!conversation) {
      // Handle case when conversation becomes null
      if (shouldShow) {
        setShowAnswer(false)
        setTimeout(() => {
          setShowQuestion(false)
          setTimeout(() => {
            setShouldShow(false)
            setActiveConversation(null)
          }, 300)
        }, 300)
      }
      
      if (dismissTimer) {
        clearTimeout(dismissTimer)
        setDismissTimer(null)
      }
      return
    }

    // When a new conversation arrives while another one is showing
    if (shouldShow && activeConversation && 
        (activeConversation.question_text !== conversation.question_text ||
         activeConversation.answer_text !== conversation.answer_text)) {
      // First hide the current conversation
      setShowAnswer(false)
      setTimeout(() => {
        setShowQuestion(false)
        setTimeout(() => {
          // Then update to the new conversation and show it
          setActiveConversation(conversation)
          setShowQuestion(true)
          if (conversation.answer_text) {
            setTimeout(() => {
              setShowAnswer(true)
              setupDismissTimer()
            }, 1000)
          }
        }, 300)
      }, 300)
    } 
    // Initial display or after a full hide
    else if (!shouldShow) {
      setShouldShow(true)
      setActiveConversation(conversation)
      setShowQuestion(true)
      
      if (conversation.answer_text) {
        setTimeout(() => {
          setShowAnswer(true)
          setupDismissTimer()
        }, 1000)
      }
    }
    
    // If this is the first time we're seeing this conversation
    // and it has a new answer that previous conversation didn't
    else if (conversation.answer_text && 
             (!activeConversation?.answer_text || 
              activeConversation.answer_text !== conversation.answer_text)) {
      setActiveConversation(conversation)
      setTimeout(() => {
        setShowAnswer(true)
        setupDismissTimer()
      }, 1000)
    }

    // Cleanup
    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer)
      }
    }
  }, [conversation])

  // Setup dismiss timer function
  const setupDismissTimer = () => {
    // Clear any existing timer
    if (dismissTimer) {
      clearTimeout(dismissTimer)
    }
    
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
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8 pointer-events-none">
      <div className="w-full max-w-4xl text-white">
        {isProcessing ? (
          <div className="flex items-center">
            <Computer className="h-6 w-6" />
            <span className="font-mono w-6">{loadingDots}</span>
          </div>
        ) : activeConversation?.answer_text ? (
          <div className="flex flex-col gap-4">
            <div className="inline-block">
              {/* Fixed the background overflow by ensuring proper containment */}
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg border border-[#33C3F0]/30">
                  <Computer className="h-7 w-7 text-[#33C3F0] drop-shadow-[0_0_5px_rgba(51,195,240,0.5)]" />
                  <span className="text-[#33C3F0] font-semibold text-2xl leading-none drop-shadow-[0_0_5px_rgba(51,195,240,0.5)]">TNJ AI</span>
                </div>
              </div>
            </div>
            {activeConversation.question_text && (
              <div 
                className={`text-white/80 px-2 flex justify-end transition-all duration-300 ${
                  showQuestion 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="p-4 bg-gray-600/80 backdrop-blur rounded-2xl max-w-[80%] transition-transform duration-300 origin-bottom-right">
                  {activeConversation.question_text}
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
              <div className="p-4 bg-[#33C3F0]/80 backdrop-blur rounded-2xl max-w-[80%] transition-transform duration-300 origin-bottom-left">
                {activeConversation.answer_text}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
