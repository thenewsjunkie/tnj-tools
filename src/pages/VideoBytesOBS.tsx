
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export default function VideoBytesOBS() {
  const [currentVideo, setCurrentVideo] = useState<VideoByteType | null>(null);

  const { data: videos } = useQuery({
    queryKey: ["video-bytes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_bytes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as VideoByteType[];
    },
  });

  useEffect(() => {
    // If no current video and we have videos, set the first one
    if (!currentVideo && videos && videos.length > 0) {
      setCurrentVideo(videos[0]);
    }
  }, [videos, currentVideo]);

  const handleVideoEnd = () => {
    // When video ends, clear it
    setCurrentVideo(null);
  };

  // Styles for OBS browser source
  const containerStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const videoStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  };

  return (
    <div style={containerStyle}>
      {currentVideo && (
        <video
          key={currentVideo.id}
          src={currentVideo.video_url}
          style={videoStyle}
          autoPlay
          onEnded={handleVideoEnd}
        />
      )}
    </div>
  );
}
