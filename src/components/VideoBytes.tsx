
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Video, Plus } from "lucide-react";
import { VideoUploadForm } from "./video-bytes/VideoUploadForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { VideoGrid } from "./video-bytes/VideoGrid";
import { VideoPlayer } from "./video-bytes/VideoPlayer";
import { DeleteVideoDialog } from "./video-bytes/DeleteVideoDialog";

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
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoByteType | null>(null);
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
    <>
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
            <VideoGrid 
              videos={videos}
              onPlay={setFullscreenVideo}
              onEdit={setEditingVideo}
              onDelete={setDeletingVideo}
            />
          )}
        </CardContent>
      </Card>

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

      <VideoPlayer 
        video={fullscreenVideo}
        onClose={() => setFullscreenVideo(null)}
      />

      <DeleteVideoDialog 
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
