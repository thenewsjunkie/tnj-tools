import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CustomEmoteManager = () => {
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('custom_emotes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('custom_emotes')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('custom_emotes')
        .insert({
          name: emoteName,
          image_url: publicUrl.publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Emote uploaded successfully",
      });

      setEmoteName("");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload emote",
        variant: "destructive",
      });
      console.error('Upload error:', error);
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