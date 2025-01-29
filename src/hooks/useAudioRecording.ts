import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface UseAudioRecordingProps {
  onStreamingTranscript?: (text: string) => void;
  onProcessingComplete?: (data: {
    conversation: {
      question_text: string;
      answer_text: string;
    };
    audioResponse: ArrayBuffer;
  }) => void;
  onError?: (error: Error) => void;
}

export const useAudioRecording = ({
  onStreamingTranscript,
  onProcessingComplete,
  onError
}: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
          
          // Stream the chunk for real-time transcription
          const formData = new FormData()
          formData.append('file', event.data, 'chunk.webm')
          
          const { data, error } = await supabase.functions.invoke('process-audio', {
            body: { 
              audio: await blobToBase64(event.data),
              streaming: true
            }
          })

          if (error) {
            onError?.(new Error(error.message))
            return
          }

          if (data?.text) {
            onStreamingTranscript?.(data.text)
          }
        }
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        
        try {
          const { data, error } = await supabase.functions.invoke('process-audio', {
            body: { 
              audio: await blobToBase64(audioBlob),
              streaming: false
            }
          })

          if (error) throw error

          onProcessingComplete?.(data)
        } catch (error) {
          onError?.(error as Error)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.current.start(1000) // Stream in 1-second chunks
      setIsRecording(true)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}