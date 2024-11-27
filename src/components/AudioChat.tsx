import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Mic, Square } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { AudioControls } from './audio/AudioControls'
import { DeviceSelector } from './audio/DeviceSelector'
import { ConversationDisplay } from './audio/ConversationDisplay'

const TNJAi = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [volume, setVolume] = useState([1])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [currentConversation, setCurrentConversation] = useState<{
    question_text?: string;
    answer_text?: string;
  } | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const audioPlayer = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const outputDevices = devices.filter(device => device.kind === 'audiooutput')
        setAudioDevices(outputDevices)
        if (outputDevices.length > 0) {
          setSelectedDevice(outputDevices[0].deviceId)
        }
      } catch (error) {
        console.error('Error getting audio devices:', error)
      }
    }

    getAudioDevices()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunks.current = []
      setCurrentConversation(null)

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

            setCurrentConversation(data.conversation)

            const audioArray = new Uint8Array(data.audioResponse)
            const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' })
            const audioUrl = URL.createObjectURL(audioBlob)

            if (audioPlayer.current) {
              audioPlayer.current.src = audioUrl
              audioPlayer.current.volume = volume[0]
              if (selectedDevice) {
                // @ts-ignore - setSinkId is not in the types yet
                await audioPlayer.current.setSinkId(selectedDevice)
              }
              audioPlayer.current.play()
              setIsPlaying(true)
              setIsPaused(false)
            }
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
    setIsPaused(false)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (audioPlayer.current) {
      audioPlayer.current.volume = newVolume[0]
    }
  }

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDevice(deviceId)
    if (audioPlayer.current) {
      try {
        // @ts-ignore - setSinkId is not in the types yet
        await audioPlayer.current.setSinkId(deviceId)
      } catch (error) {
        console.error('Error switching audio output:', error)
        toast({
          title: 'Error',
          description: 'Failed to switch audio output device.',
          variant: 'destructive',
        })
      }
    }
  }

  const togglePlayPause = () => {
    if (audioPlayer.current) {
      if (isPaused) {
        audioPlayer.current.play()
        setIsPaused(false)
      } else {
        audioPlayer.current.pause()
        setIsPaused(true)
      }
    }
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-semibold mb-4">TNJ AI</h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AudioControls
            isPaused={isPaused}
            isPlaying={isPlaying}
            volume={volume}
            onPlayPause={togglePlayPause}
            onVolumeChange={handleVolumeChange}
          />
          <DeviceSelector
            devices={audioDevices}
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
          />
        </div>

        <ConversationDisplay conversation={currentConversation} />
        
        <audio
          ref={audioPlayer}
          onEnded={handlePlaybackEnded}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default TNJAi
