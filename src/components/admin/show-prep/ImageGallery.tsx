import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Link as LinkIcon, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  isEditing?: boolean;
}

const ImageGallery = ({ images, onChange, isEditing = false }: ImageGalleryProps) => {
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    onChange([...images, url]);
    setNewUrl("");
    setIsAddingUrl(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-show-note-image', {
        body: formData,
      });

      if (error) throw error;

      if (data?.url) {
        onChange([...images, data.url]);
        toast.success("Image uploaded");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast.error("No valid image files found");
      return;
    }
    
    for (const file of files) {
      await uploadFile(file);
    }
  };

  return (
    <div 
      className={cn(
        "space-y-2 p-2 -m-2 rounded-lg transition-colors",
        isDragOver && "bg-primary/10 border-2 border-dashed border-primary"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="flex items-center justify-center py-4 text-sm text-primary">
          <ImageIcon className="h-4 w-4 mr-2" />
          Drop image here
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={url}
                  alt=""
                  className="h-16 w-16 object-cover rounded-md border border-border hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
              {isEditing && (
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {isAddingUrl ? (
        <div className="flex gap-1 items-center">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddUrl();
              if (e.key === "Escape") {
                setIsAddingUrl(false);
                setNewUrl("");
              }
            }}
            placeholder="Image URL..."
            className="h-7 text-xs"
            autoFocus
          />
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddUrl}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => {
              setIsAddingUrl(false);
              setNewUrl("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : isEditing && (
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-3 w-3 mr-1" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setIsAddingUrl(true)}
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            Paste URL
          </Button>
          <span className="text-xs text-muted-foreground">or drag & drop</span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
