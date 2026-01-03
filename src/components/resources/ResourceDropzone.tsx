import { useState, useCallback } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  accept?: string;
}

export const ResourceDropzone = ({ 
  onFileSelect, 
  isUploading = false,
  accept = "image/*"
}: ResourceDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    };
    input.click();
  };

  if (isUploading) {
    return (
      <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center bg-primary/5">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Uploading...</p>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            handleClick();
          }}
          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm"
        >
          Click to change
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="p-3 rounded-full bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop an image here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};
