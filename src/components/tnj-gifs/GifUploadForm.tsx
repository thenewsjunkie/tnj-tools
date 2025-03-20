
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface GifUploadFormProps {
  onUploadStart: () => void;
  onUploadComplete: () => void;
  onUploadError: (error: string) => void;
}

const GifUploadForm: React.FC<GifUploadFormProps> = ({
  onUploadStart,
  onUploadComplete,
  onUploadError,
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a GIF
      if (!selectedFile.type.includes("gif")) {
        onUploadError("Only GIF files are allowed");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      onUploadError("Please add a title for your GIF");
      return;
    }
    
    if (!file) {
      onUploadError("Please select a GIF to upload");
      return;
    }

    try {
      onUploadStart();
      
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("tnj_gifs")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("tnj_gifs")
        .getPublicUrl(filePath);
        
      // Save to database
      const { error: insertError } = await supabase.from("tnj_gifs").insert({
        title,
        gif_url: publicUrlData.publicUrl,
      });
      
      if (insertError) throw insertError;
      
      // Reset form
      setTitle("");
      setFile(null);
      
      // Notify parent
      onUploadComplete();
      
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Unknown error occurred");
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
          placeholder="Enter a title for your GIF"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gif">GIF File</Label>
        <Input
          id="gif"
          type="file"
          accept="image/gif"
          onChange={handleFileChange}
          className="cursor-pointer"
          required
        />
        <p className="text-xs text-muted-foreground">
          Only GIF files are accepted. Maximum size: 10MB.
        </p>
      </div>
      
      <Button type="submit" disabled={!title || !file}>
        Upload GIF
      </Button>
    </form>
  );
};

export default GifUploadForm;
