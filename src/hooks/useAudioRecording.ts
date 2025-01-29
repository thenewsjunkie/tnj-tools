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

  // Helper function to get supported mime type
  const getSupportedMimeType = () => {
    const types = [
      'audio/mp3',
      'audio/mpeg',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ]
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm'
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mimeType = getSupportedMimeType()
      console.log('Using MIME type:', mimeType)
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      })
      
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
          
          // Only do streaming transcription for chunks larger than 1KB
          if (event.data.size > 1024) {
            const audioBlob = new Blob([event.data], { type: mimeType })
            
            try {
              const { data, error } = await supabase.functions.invoke('process-audio', {
                body: { 
                  audio: await blobToBase64(audioBlob),
                  streaming: true
                }
              })

              if (error) {
                console.error('Streaming transcription error:', error)
                onError?.(new Error(error.message))
                return
              }

              if (data?.text) {
                onStreamingTranscript?.(data.text)
              }
            } catch (error) {
              console.error('Error during streaming transcription:', error)
            }
          }
        }
      }

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true)
        
        // Combine all chunks into a single blob
        const finalBlob = new Blob(audioChunks.current, { type: mimeType })
        console.log('Final audio size:', finalBlob.size, 'bytes')
        
        try {
          console.log('Sending complete audio for processing...')
          const { data, error } = await supabase.functions.invoke('process-audio', {
            body: { 
              audio: await blobToBase64(finalBlob),
              streaming: false
            }
          })

          if (error) {
            console.error('Processing error:', error)
            throw error
          }

          onProcessingComplete?.(data)
        } catch (error) {
          console.error('Final processing error:', error)
          onError?.(error as Error)
        } finally {
          setIsProcessing(false)
        }
      }

      // Collect data more frequently (every 250ms)
      mediaRecorder.current.start(250)
      setIsRecording(true)
    } catch (error) {
      console.error('Recording setup error:', error)
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