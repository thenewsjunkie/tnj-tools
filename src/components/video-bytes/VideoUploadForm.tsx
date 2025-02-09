
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function VideoUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

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
    try {
      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("video_bytes")
        .upload(filePath, videoFile);

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

      // Reset form
      setTitle("");
      setVideoFile(null);
      
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
