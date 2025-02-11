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
  const [thumbnailTime, setThumbnailTime] = useState(0);
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

  const handleGenerateThumbnail = async () => {
    if (!videoRef.current || !editingVideo) return;
    
    setIsGeneratingThumbnail(true);
    try {
      // Ensure video is loaded
      if (videoRef.current.readyState < 2) { // HAVE_CURRENT_DATA
        await new Promise<void>((resolve) => {
          const handleLoaded = () => {
            videoRef.current?.removeEventListener('loadeddata', handleLoaded);
            resolve();
          };
          videoRef.current?.addEventListener('loadeddata', handleLoaded);
        });
      }

      // Pause the video at the current time
      videoRef.current.pause();

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.95);
      });

      // Delete existing thumbnail if it exists
      if (editingVideo.thumbnail_url) {
        const oldPath = editingVideo.thumbnail_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from("video_bytes")
            .remove([oldPath]);
        }
      }

      // Upload new thumbnail
      const filePath = `thumbnails/${editingVideo.id}_${Date.now()}.jpg`;
      const { error: uploadError, data } = await supabase.storage
        .from("video_bytes")
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("video_bytes")
        .getPublicUrl(filePath);

      // Update video record with new thumbnail
      const { error: updateError } = await supabase
        .from("video_bytes")
        .update({ thumbnail_url: publicUrl })
        .eq("id", editingVideo.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Thumbnail updated successfully",
      });

      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ["video-bytes"] });
      setIsThumbnailMode(false);
    } catch (error) {
      console.error("Thumbnail update error:", error);
      toast({
        title: "Error",
        description: "Failed to update thumbnail",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setThumbnailTime(videoRef.current.currentTime);
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
    setUploadProgress(0);
    try {
      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const options = {
        cacheControl: '3600',
        upsert: false
      };

      // Set up upload with progress tracking
      const { error: uploadError, data } = await supabase.storage
        .from("video_bytes")
        .upload(filePath, videoFile, options);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("video_bytes")
        .getPublicUrl(filePath);

      // Save video metadata to database
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

      // Invalidate and refetch the videos query
      queryClient.invalidateQueries({ queryKey: ["video-bytes"] });

      // Reset form
      setTitle("");
      setVideoFile(null);
      setUploadProgress(0);
      
      // Call onSuccess callback if provided
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
            <div className="space-y-2">
              <video
                ref={videoRef}
                src={editingVideo.video_url}
                controls
                crossOrigin="anonymous"
                className="w-full rounded-lg"
                onTimeUpdate={handleTimeUpdate}
                preload="auto"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current time: {thumbnailTime.toFixed(2)}s
                </span>
                <Button
                  type="button"
                  onClick={handleGenerateThumbnail}
                  size="sm"
                  disabled={isGeneratingThumbnail}
                >
                  {isGeneratingThumbnail ? "Generating..." : "Capture Thumbnail"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(uploadProgress)}% uploaded
          </p>
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
