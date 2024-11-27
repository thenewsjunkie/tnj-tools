import { Speaker } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[]
  selectedDevice: string
  onDeviceChange: (deviceId: string) => void
}

export const DeviceSelector = ({
  devices,
  selectedDevice,
  onDeviceChange,
}: DeviceSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Speaker className="h-4 w-4" />
      <Select value={selectedDevice} onValueChange={onDeviceChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select output device" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Output ${device.deviceId.slice(0, 4)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}