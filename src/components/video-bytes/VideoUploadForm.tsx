import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface VideoUploadFormProps {
  onSuccess?: () => void;
  editingVideo?: VideoByteType | null;
}

export function VideoUploadForm({ onSuccess, editingVideo }: VideoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isThumbnailMode, setIsThumbnailMode] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
    }
  }, [editingVideo]);

  const handleThumbnailUpload = async (file: File) => {
    if (!editingVideo) return;
    
    setIsGeneratingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the existing upload-show-note-image function
      const { data, error: uploadError } = await supabase.functions.invoke('upload-show-note-image', {
        body: formData,
      });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("video_bytes")
        .update({ thumbnail_url: data.url })
        .eq("id", editingVideo.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Thumbnail updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ["video-bytes"] });
      setIsThumbnailMode(false);
    } catch (error) {
      console.error("Thumbnail update error:", error);
      toast({
        title: "Error",
        description: "Failed to update thumbnail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVideo) {
      try {
        const { error: updateError } = await supabase
          .from("video_bytes")
          .update({ title })
          .eq("id", editingVideo.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Video updated successfully",
        });

        queryClient.invalidateQueries({ queryKey: ["video-bytes"] });
        onSuccess?.();
      } catch (error) {
        console.error("Update error:", error);
        toast({
          title: "Update failed",
          description: "There was an error updating your video",
          variant: "destructive",
        });
      }
      return;
    }

    if (!videoFile || !title) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and a video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = videoFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("video_bytes")
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("video_bytes")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("video_bytes")
        .insert({
          title,
          video_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["video-bytes"] });
      setTitle("");
      setVideoFile(null);
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          disabled={isUploading}
        />
      </div>

      {!editingVideo && (
        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            disabled={isUploading}
            className="cursor-pointer"
          />
        </div>
      )}

      {editingVideo && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Thumbnail</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsThumbnailMode(!isThumbnailMode)}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isThumbnailMode ? "Close" : "Change Thumbnail"}
            </Button>
          </div>

          {isThumbnailMode && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={editingVideo.video_url}
                  controls
                  className="w-full h-full"
                  preload="auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Upload Screenshot</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleThumbnailUpload(file);
                    }
                  }}
                  disabled={isGeneratingThumbnail}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Take a screenshot of the video at the desired timestamp and upload it here
                </p>
              </div>
              {editingVideo.thumbnail_url && (
                <div className="space-y-2">
                  <Label>Current Thumbnail</Label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <img 
                      src={editingVideo.thumbnail_url} 
                      alt="Current thumbnail"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button disabled={isUploading} type="submit" className="w-full">
        {isUploading ? (
          "Uploading..."
        ) : editingVideo ? (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Update Video
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </>
        )}
      </Button>
    </form>
  );
}
