
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video, Plus, Pencil, Trash2 } from "lucide-react";
import { VideoUploadForm } from "./video-bytes/VideoUploadForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export function VideoBytes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoByteType | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoByteType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      video.requestFullscreen({ navigationUI: "hide" });
    }
  };

  const handleDelete = async () => {
    if (!deletingVideo) return;

    try {
      // Delete from storage first
      const fileUrl = new URL(deletingVideo.video_url);
      const filePath = fileUrl.pathname.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("video_bytes")
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Then delete from database
      const { error: dbError } = await supabase
        .from("video_bytes")
        .delete()
        .eq("id", deletingVideo.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      // Refresh the videos list
      queryClient.invalidateQueries({ queryKey: ["video-bytes"] });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setDeletingVideo(null);
    }
  };

  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" />
            Video Bytes
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-7 w-7"
          >
            <Plus className="h-3 w-3" />
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{video.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingVideo(video)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingVideo(video)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen || !!editingVideo} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingVideo(null);
      }}>
        <DialogContent className="dark:text-white">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Upload Video'}</DialogTitle>
          </DialogHeader>
          <VideoUploadForm 
            onSuccess={() => {
              setIsDialogOpen(false);
              setEditingVideo(null);
            }}
            editingVideo={editingVideo}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingVideo} onOpenChange={(open) => !open && setDeletingVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

