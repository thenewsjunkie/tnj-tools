
import { useState, useEffect } from 'react'
import { Computer } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    // Show when processing starts or when we have a conversation
    if (isProcessing || (conversation && conversation.answer_text)) {
      console.log('TNJ AI OBS: Showing overlay - Processing:', isProcessing, 'Conversation:', conversation)
      setShouldShow(true)
      return
    }

    // Auto-dismiss timer for completed conversations
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
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className={cn(
        "bg-black/80 text-white p-6 rounded-lg max-w-2xl transition-opacity duration-500",
        shouldShow ? "opacity-100" : "opacity-0"
      )}>
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Computer className="h-6 w-6" />
            <span className="font-mono w-6">{loadingDots}</span>
          </div>
        ) : conversation?.answer_text ? (
          <div className="animate-fade-in">
            {conversation.answer_text}
          </div>
        ) : null}
      </div>
    </div>
  )
}
