import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  isEditing?: boolean;
}

const ImageGallery = ({ images, onChange, isEditing = false }: ImageGalleryProps) => {
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Use the edge function for upload (same as other components)
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt=""
                className="h-16 w-16 object-cover rounded-md border border-border"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
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
      ) : (isEditing || images.length === 0) && (
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
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
