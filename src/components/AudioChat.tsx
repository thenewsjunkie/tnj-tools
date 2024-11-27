import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Mic, Square, Volume2, PauseCircle, PlayCircle, Speakers } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Slider } from './ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        
        {(isPlaying || isPaused) && (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-8 w-8 p-0"
            >
              {isPaused ? 
                <PlayCircle className="h-6 w-6" /> : 
                <PauseCircle className="h-6 w-6" />
              }
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Speakers className="h-4 w-4" />
              <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select output device" />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Output ${device.deviceId.slice(0, 4)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {currentConversation && (
          <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
            <div className="mb-2">
              <span className="font-semibold">Q:</span> {currentConversation.question_text}
            </div>
            <div>
              <span className="font-semibold">A:</span> {currentConversation.answer_text}
            </div>
          </div>
        )}
        
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