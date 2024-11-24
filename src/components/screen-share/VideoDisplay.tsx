import { useRef } from "react";

interface VideoDisplayProps {
  isHost: boolean;
  isConnected: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

const VideoDisplay = ({ isHost, isConnected, localVideoRef, remoteVideoRef }: VideoDisplayProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {isHost && (
        <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
          <video
            id="localVideo"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
            Your Screen
          </div>
        </div>
      )}
      
      <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
        <video
          id="remoteVideo"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
          {isHost ? "Viewer's View" : "Shared Screen"}
        </div>
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm bg-black/50 px-3 py-1 rounded">
              {isHost ? "Waiting for viewer..." : "Waiting for shared screen..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDisplay;