import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface UseAudioRecordingProps {
  onProcessingComplete: (data: { conversation: any; audioResponse: ArrayBuffer }) => void
  onError: (error: Error) => void
}

export const useAudioRecording = ({ onProcessingComplete, onError }: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const reader = new FileReader()
        
        reader.onload = async () => {
          try {
            const { data, error } = await supabase.functions.invoke('process-audio', {
              body: {
                type: 'transcribe',
                audioData: reader.result,
              },
            })

            if (error) throw error

            if (!data.audioResponse || !data.conversation) {
              throw new Error('Invalid response from server')
            }

            const audioArray = new Uint8Array(data.audioResponse)
            onProcessingComplete({
              conversation: data.conversation,
              audioResponse: audioArray
            })
          } catch (error) {
            onError(error instanceof Error ? error : new Error('Failed to process audio'))
          } finally {
            setIsProcessing(false)
          }
        }

        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to access microphone'))
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}