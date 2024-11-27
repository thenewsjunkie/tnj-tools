import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Mic, Square, Volume2 } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const audioPlayer = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

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

            // Convert the array back to ArrayBuffer
            const audioArray = new Uint8Array(data.audioResponse)
            const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' })
            const audioUrl = URL.createObjectURL(audioBlob)

            if (audioPlayer.current) {
              audioPlayer.current.src = audioUrl
              audioPlayer.current.play()
              setIsPlaying(true)
            }

            toast({
              title: 'Conversation',
              description: `Q: ${data.conversation.question_text}\nA: ${data.conversation.answer_text}`,
            })
          } catch (error) {
            console.error('Error processing audio:', error)
            toast({
              title: 'Error',
              description: 'Failed to process audio. Please try again.',
              variant: 'destructive',
            })
          } finally {
            setIsProcessing(false)
          }
        }

        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: 'Error',
        description: 'Failed to access microphone. Please check your permissions.',
        variant: 'destructive',
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handlePlaybackEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Audio Chat</h2>
      <div className="flex gap-4 items-center">
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        <div className="flex items-center gap-2">
          {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
          <Volume2 className={`h-4 w-4 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
          <audio
            ref={audioPlayer}
            onEnded={handlePlaybackEnded}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}

export default AudioChat