import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Undo2 } from "lucide-react";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  imageUrl?: string;
  defaultImageUrl?: string;
  onImageUpload: (url: string) => void;
}

const ImageUploadField = ({ 
  id, 
  label, 
  imageUrl, 
  defaultImageUrl,
  onImageUpload 
}: ImageUploadFieldProps) => {
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log(`Starting ${id} image upload...`);
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-show-note-image', {
        body: formData,
      });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log("Upload successful, received URL:", data.url);
      onImageUpload(data.url);
      toast({
        title: "Success",
        description: `${label} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${label.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  const handleResetToDefault = () => {
    if (defaultImageUrl) {
      onImageUpload(defaultImageUrl);
      toast({
        title: "Reset successful",
        description: `${label} reset to default`,
      });
    }
  };

  const displayUrl = imageUrl || defaultImageUrl;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-4">
        <Input
          id={id}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="flex-1"
        />
        {defaultImageUrl && imageUrl !== defaultImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetToDefault}
            title="Reset to default logo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}
        {displayUrl && (
          <img 
            src={displayUrl} 
            alt={`${label} preview`} 
            className="w-24 h-24 object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default ImageUploadField;