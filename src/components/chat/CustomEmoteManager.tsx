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

    setIsUploading(true);
    try {
      console.log("[CustomEmoteManager] Starting upload for:", emoteName);
      
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

      const { data: publicUrl } = supabase.storage
        .from('custom_emotes')
        .getPublicUrl(fileName);

      console.log("[CustomEmoteManager] File uploaded, public URL:", publicUrl);

      const { error: dbError } = await supabase
        .from('custom_emotes')
        .insert({
          name: emoteName,
          image_url: publicUrl.publicUrl,
        });

      if (dbError) {
        console.error("[CustomEmoteManager] Database error:", dbError);
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
        description: "Failed to add emote. Please try again.",
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