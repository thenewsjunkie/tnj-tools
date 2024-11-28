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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

      // Try different MIME types in order of preference
      const mimeTypes = [
        'audio/mp4',
        'audio/aac',
        'audio/webm',
        'audio/ogg',
        'audio/wav',
      ]

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio MIME type found')
      }

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      })
      
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunks.current, { type: selectedMimeType })
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

      mediaRecorder.current.start(100) // Reduced chunk size for better compatibility
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