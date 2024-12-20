import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomEmoteManagerProps {
  onSuccess?: () => void;
}

const CustomEmoteManager = ({ onSuccess }: CustomEmoteManagerProps) => {
  const [emoteName, setEmoteName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (!emoteName) {
      toast({
        title: "Error",
        description: "Please enter an emote name",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log("[CustomEmoteManager] Starting upload for:", {
        emoteName,
        fileType: file.type,
        fileSize: file.size
      });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('custom_emotes')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("[CustomEmoteManager] Upload error:", uploadError);
        throw uploadError;
      }

      console.log("[CustomEmoteManager] File uploaded successfully:", data);

      const { data: publicUrl } = supabase.storage
        .from('custom_emotes')
        .getPublicUrl(fileName);

      console.log("[CustomEmoteManager] Generated public URL:", publicUrl);

      const { error: dbError } = await supabase
        .from('custom_emotes')
        .insert({
          name: emoteName,
          image_url: publicUrl.publicUrl,
        });

      if (dbError) {
        console.error("[CustomEmoteManager] Database error:", dbError);
        // If DB insert fails, try to clean up the uploaded file
        await supabase.storage
          .from('custom_emotes')
          .remove([fileName]);
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Emote added successfully",
      });

      setEmoteName("");
      if (fileInput) fileInput.value = "";
      onSuccess?.();
    } catch (error) {
      console.error("[CustomEmoteManager] Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add emote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Emote Name"
          value={emoteName}
          onChange={(e) => setEmoteName(e.target.value)}
          className="text-foreground bg-background"
          maxLength={50}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*"
          required
          disabled={isUploading}
          className="text-foreground bg-background"
        />
        <p className="text-xs text-gray-500">Max file size: 2MB</p>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Add Emote"}
      </Button>
    </form>
  );
};

export default CustomEmoteManager;