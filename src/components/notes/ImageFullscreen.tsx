import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageFullscreenProps {
  url: string;
  title?: string;
  onClose: () => void;
}

const ImageFullscreen = ({ url, title, onClose }: ImageFullscreenProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      <img 
        src={url} 
        alt={title || 'Show note image'} 
        className="max-w-full max-h-full object-contain"
      />
      {title && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
          <p className="text-white">{title}</p>
        </div>
      )}
    </div>
  );
};

export default ImageFullscreen;