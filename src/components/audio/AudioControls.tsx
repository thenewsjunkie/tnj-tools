import { PauseCircle, PlayCircle, Volume2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'

interface AudioControlsProps {
  isPaused: boolean
  isPlaying: boolean
  volume: number[]
  onPlayPause: () => void
  onVolumeChange: (value: number[]) => void
}

export const AudioControls = ({
  isPaused,
  isPlaying,
  volume,
  onPlayPause,
  onVolumeChange,
}: AudioControlsProps) => {
  if (!isPlaying && !isPaused) return null

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPlayPause}
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
          onValueChange={onVolumeChange}
          max={1}
          step={0.1}
          className="w-32"
        />
      </div>
    </div>
  )
}