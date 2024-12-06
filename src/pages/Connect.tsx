import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { webRTCService } from "@/services/webrtc";
import { DeviceSelector } from "@/components/connect/DeviceSelector";
import VideoPreview from "@/components/connect/VideoPreview";
import CallForm from "@/components/connect/CallForm";
import Guidelines from "@/components/connect/Guidelines";
import QueueStatus from "@/components/connect/QueueStatus";

const Connect = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [currentAudioDevice, setCurrentAudioDevice] = useState("");
  const [currentVideoDevice, setCurrentVideoDevice] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const initializeStream = async (audioDeviceId?: string, videoDeviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: videoDeviceId ? { deviceId: videoDeviceId } : true,
        audio: audioDeviceId ? { deviceId: audioDeviceId } : true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      // Update current device IDs
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setCurrentVideoDevice(settings.deviceId || "");
      }
      
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        setCurrentAudioDevice(settings.deviceId || "");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast({
        title: "Camera Access Error",
        description: "Please enable camera and microphone access to join the show.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    initializeStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAudioDeviceChange = (deviceId: string) => {
    setCurrentAudioDevice(deviceId);
    initializeStream(deviceId, currentVideoDevice);
  };

  const handleVideoDeviceChange = (deviceId: string) => {
    setCurrentVideoDevice(deviceId);
    initializeStream(currentAudioDevice, deviceId);
  };

  const toggleMicrophone = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleJoinCall = async () => {
    if (!name || !topic) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and topic before joining.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    console.log("Starting call join process...");

    try {
      const { data: callSession, error: sessionError } = await supabase
        .from('call_sessions')
        .insert({
          caller_name: name,
          topic: topic,
          status: 'waiting',
          is_muted: true,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Error creating call session:", sessionError);
        throw sessionError;
      }

      console.log("Call session created:", callSession);

      const localStream = await webRTCService.initializeCall(callSession.id);
      console.log("WebRTC initialized, local stream:", localStream ? "obtained" : "failed");

      if (!localStream) {
        throw new Error("Failed to initialize video call");
      }

      const { count } = await supabase
        .from('call_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')
        .lt('created_at', callSession.created_at);

      setQueuePosition((count || 0) + 1);
      setEstimatedWait((count || 0) * 5);

      toast({
        title: "Successfully Joined",
        description: "You've been added to the call queue.",
      });

    } catch (error) {
      console.error("Error joining call:", error);
      toast({
        title: "Error joining call",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold digital">Connect to TNJ Show</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-destructive/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      <div className="container max-w-4xl mx-auto p-4 space-y-8">
        <VideoPreview 
          stream={stream}
          isMuted={isMuted}
          toggleMicrophone={toggleMicrophone}
        />

        <DeviceSelector
          currentAudioDevice={currentAudioDevice}
          currentVideoDevice={currentVideoDevice}
          onAudioDeviceChange={handleAudioDeviceChange}
          onVideoDeviceChange={handleVideoDeviceChange}
        />

        <CallForm
          name={name}
          setName={setName}
          topic={topic}
          setTopic={setTopic}
        />

        <Guidelines />

        <QueueStatus
          queuePosition={queuePosition}
          estimatedWait={estimatedWait}
          isConnecting={isConnecting}
          name={name}
          topic={topic}
          onJoinCall={handleJoinCall}
        />
      </div>
    </div>
  );
};

export default Connect;