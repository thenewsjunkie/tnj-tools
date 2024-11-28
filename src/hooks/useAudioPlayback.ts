import { useState, useRef } from 'react'

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolume] = useState([1])
  const audioPlayer = useRef<HTMLAudioElement | null>(null)

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

  return {
    isPlaying,
    isPaused,
    volume,
    audioPlayer,
    setIsPlaying,
    setIsPaused,
    handlePlaybackEnded,
    handleVolumeChange,
    togglePlayPause
  }
}