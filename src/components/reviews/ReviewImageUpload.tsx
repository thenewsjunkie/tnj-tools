import React from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewImageCarousel from "./ReviewImageCarousel";

interface ReviewImageUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  title: string;
}

const ReviewImageUpload = ({ images, onImagesChange, title }: ReviewImageUploadProps) => {
  const handleDeleteImage = (indexToDelete: number) => {
    const newImages = images.filter((_, index) => index !== indexToDelete);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;

          if (images.length + files.length > 5) {
            alert("Maximum 5 images allowed");
            return;
          }

          const formData = new FormData();
          formData.append('file', files[0]);

          try {
            const { data, error } = await supabase.functions.invoke('upload-show-note-image', {
              body: formData,
            });

            if (error) throw error;
            onImagesChange([...images, data.url]);
          } catch (error) {
            console.error('Upload error:', error);
          }
        }}
        disabled={images.length >= 5}
        className="dark:text-white dark:file:bg-white/10 dark:file:text-white dark:file:border-white/20"
      />
      {images.length > 0 && (
        <div className="relative">
          <ReviewImageCarousel images={images} title={title} />
          <div className="absolute top-2 right-2 flex gap-2">
            {images.map((_, index) => (
              <Button
                key={index}
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDeleteImage(index)}
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