
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
  const isProcessingRef = useRef(false)

  const startRecording = async () => {
    try {
      setIsProcessing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })

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
        console.log('[AudioRecording] Recording stopped, checking processing state...')
        if (isProcessingRef.current) {
          console.log('[AudioRecording] Already processing audio, skipping...')
          return
        }
        
        isProcessingRef.current = true
        console.log('[AudioRecording] Starting audio processing...')
        
        try {
          const audioBlob = new Blob(audioChunks.current, { type: selectedMimeType })
          const reader = new FileReader()
          
          reader.onload = async () => {
            try {
              console.log('[AudioRecording] Sending audio to process-audio function...')
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

              console.log('[AudioRecording] Successfully processed audio, converting response...')
              const binaryString = atob(data.audioResponse)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }

              console.log('[AudioRecording] Calling onProcessingComplete...')
              onProcessingComplete({
                conversation: data.conversation,
                audioResponse: bytes.buffer
              })
            } catch (error) {
              console.error('[AudioRecording] Error in audio processing:', error)
              onError(error instanceof Error ? error : new Error('Failed to process audio'))
            } finally {
              console.log('[AudioRecording] Resetting processing states...')
              setIsProcessing(false)
              isProcessingRef.current = false
            }
          }

          reader.readAsDataURL(audioBlob)
        } catch (error) {
          console.error('[AudioRecording] Error processing audio blob:', error)
          onError(error instanceof Error ? error : new Error('Failed to process audio blob'))
          setIsProcessing(false)
          isProcessingRef.current = false
        }
      }

      console.log('[AudioRecording] Starting new recording...')
      mediaRecorder.current.start(100)
      setIsRecording(true)
      setIsProcessing(false)
    } catch (error) {
      console.error('[AudioRecording] Error starting recording:', error)
      setIsProcessing(false)
      isProcessingRef.current = false
      onError(error instanceof Error ? error : new Error('Failed to access microphone'))
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      console.log('[AudioRecording] Stopping recording...')
      mediaRecorder.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
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
