
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

export function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleUpload} className="space-y-4">
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
