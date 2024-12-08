import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DeviceSelectorProps {
  currentAudioDevice: string;
  currentVideoDevice: string;
  onAudioDeviceChange: (deviceId: string) => void;
  onVideoDeviceChange: (deviceId: string) => void;
}

export const DeviceSelector = ({
  currentAudioDevice,
  currentVideoDevice,
  onAudioDeviceChange,
  onVideoDeviceChange,
}: DeviceSelectorProps) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        console.log('Loading media devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        
        console.log('Available audio devices:', audioInputs.map(d => ({ 
          deviceId: d.deviceId, 
          label: d.label 
        })));
        console.log('Available video devices:', videoInputs.map(d => ({ 
          deviceId: d.deviceId, 
          label: d.label 
        })));
        
        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);
      } catch (error) {
        console.error('Error loading devices:', error);
      }
    };

    loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  // Only render if we have valid devices
  if (!audioDevices.length || !videoDevices.length) {
    console.log('Waiting for devices to be available...');
    return null;
  }

  // Find default devices (first available device if current is not set)
  const defaultAudioDevice = currentAudioDevice || audioDevices[0]?.deviceId;
  const defaultVideoDevice = currentVideoDevice || videoDevices[0]?.deviceId;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-device">Microphone</Label>
        <Select 
          value={defaultAudioDevice} 
          onValueChange={onAudioDeviceChange}
        >
          <SelectTrigger id="audio-device">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.map((device) => (
              device.deviceId && (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-device">Camera</Label>
        <Select 
          value={defaultVideoDevice} 
          onValueChange={onVideoDeviceChange}
        >
          <SelectTrigger id="video-device">
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent>
            {videoDevices.map((device) => (
              device.deviceId && (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};