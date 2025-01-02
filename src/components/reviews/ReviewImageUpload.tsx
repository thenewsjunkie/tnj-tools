import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ReviewImageCarousel from "./ReviewImageCarousel";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReviewImageUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  title: string;
}

const ReviewImageUpload = ({ images, onImagesChange, title }: ReviewImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [...images];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('upload-show-note-image', {
          body: formData,
        });

        if (error) throw error;
        newImages.push(data.url);
      }

      onImagesChange(newImages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    const newImages = images.filter((_, index) => index !== indexToDelete);
    onImagesChange(newImages);
    toast({
      title: "Success",
      description: "Image removed successfully",
    });
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isUploading || images.length >= 5}
        multiple
        className="dark:text-white dark:file:bg-white/10 dark:file:text-white dark:file:border-white/20"
      />
      {isUploading && <p className="text-sm text-white/70">Uploading...</p>}
      {images.length > 0 && (
        <div className="relative">
          <ReviewImageCarousel 
            images={images} 
            title={title} 
            showControls={images.length > 1}
          />
          <div className="flex gap-2 mt-2">
            {images.map((_, index) => (
              <Button
                key={index}
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteImage(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {images.length}/5 images uploaded
      </p>
    </div>
  );
};

export default ReviewImageUpload;