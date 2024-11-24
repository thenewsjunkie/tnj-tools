import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VideoDisplay from "@/components/screen-share/VideoDisplay";
import WebRTCConnection from "@/components/screen-share/WebRTCConnection";
import SessionValidator from "@/components/screen-share/SessionValidator";
import { updateSessionStatus } from "@/utils/supabaseSession";
import { useToast } from "@/components/ui/use-toast";

const ScreenShare = () => {
  const { code } = useParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  if (!code) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No share code provided</p>
      </div>
    );
  }

  const handleValidSession = async (data: any, host: boolean) => {
    setSessionData(data);
    setIsHost(host);
    
    if (host) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        setStream(displayStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to access screen sharing. Please make sure you've granted the necessary permissions.",
          variant: "destructive",
        });
        return;
      }
    }
    
    await updateSessionStatus(data.id, host, true);
  };

  const handleStopSharing = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (sessionData) {
      await updateSessionStatus(sessionData.id, isHost, false);
    }
    window.close();
  };

  return (
    <div className="min-h-screen bg-black p-4">
      {!sessionData ? (
        <SessionValidator code={code} onValidSession={handleValidSession} />
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-white text-xl">Screen Share: {code}</h1>
              <Button
                variant="destructive"
                onClick={handleStopSharing}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Stop Sharing
              </Button>
            </div>
            
            {sessionData && (
              <WebRTCConnection
                roomId={sessionData.id}
                isHost={isHost}
                stream={stream}
                onTrackAdded={(remoteStream) => {
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                  }
                }}
                onConnectionEstablished={() => {
                  // Connection is established, stream is already set up in handleValidSession
                }}
              />
            )}
            
            <VideoDisplay
              isHost={isHost}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenShare;