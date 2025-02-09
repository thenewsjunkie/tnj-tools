
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video, Plus } from "lucide-react";
import { VideoUploadForm } from "./video-bytes/VideoUploadForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export function VideoBytes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: videos, isLoading } = useQuery({
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

  const handleVideoPlay = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (video.requestFullscreen) {
      // Add noKeyboard option to prevent fullscreen instructions
      video.requestFullscreen({ navigationUI: "hide" });
    }
  };

  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Bytes
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading videos...</div>
        ) : videos?.length === 0 ? (
          <div className="text-center text-muted-foreground">No videos uploaded yet</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos?.map((video) => (
              <div key={video.id} className="space-y-2">
                <video
                  src={video.video_url}
                  controls
                  className="w-full rounded-lg bg-muted"
                  preload="metadata"
                  onPlay={handleVideoPlay}
                />
                <h3 className="font-medium">{video.title}</h3>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:text-white">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <VideoUploadForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
