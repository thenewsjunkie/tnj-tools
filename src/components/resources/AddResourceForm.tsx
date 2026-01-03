import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { ResourceDropzone } from "./ResourceDropzone";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ResourceMode = "link" | "image";

interface AddResourceFormProps {
  onSubmit: (data: { title: string; url: string; type: ResourceMode }) => void;
  onCancel: () => void;
  isPending?: boolean;
  fetchTitleFromUrl?: (url: string) => Promise<void>;
  isFetchingTitle?: boolean;
  title: string;
  setTitle: (title: string) => void;
  url: string;
  setUrl: (url: string) => void;
}

export const AddResourceForm = ({
  onSubmit,
  onCancel,
  isPending = false,
  fetchTitleFromUrl,
  isFetchingTitle = false,
  title,
  setTitle,
  url,
  setUrl,
}: AddResourceFormProps) => {
  const [mode, setMode] = useState<ResourceMode>("link");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    // Auto-fill title from filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setTitle(nameWithoutExt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "image" && selectedFile) {
      setIsUploading(true);
      try {
        // Upload to show_notes_images bucket
        const fileName = `${Date.now()}-${selectedFile.name}`;
        const { data, error } = await supabase.storage
          .from("show_notes_images")
          .upload(fileName, selectedFile);

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("show_notes_images")
          .getPublicUrl(fileName);

        onSubmit({
          title: title.trim(),
          url: publicUrlData.publicUrl,
          type: "image",
        });
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Link mode
      let processedUrl = url.trim();
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      }
      onSubmit({ title: title.trim(), url: processedUrl, type: "link" });
    }
  };

  const isValid = mode === "image" 
    ? selectedFile && title.trim() 
    : title.trim() && url.trim();

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border border-border rounded-lg bg-card">
      {/* Mode Toggle */}
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            mode === "link" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LinkIcon className="h-4 w-4" />
          Link
        </button>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            mode === "image" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ImageIcon className="h-4 w-4" />
          Image
        </button>
      </div>

      <div className="space-y-3">
        {mode === "link" ? (
          <>
            <div className="relative">
              <Input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => fetchTitleFromUrl?.(url)}
                autoFocus
              />
            </div>
            <div className="relative">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isFetchingTitle}
              />
              {isFetchingTitle && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <ResourceDropzone 
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
            <div className="relative">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isPending || isUploading || !isValid}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Add"
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setSelectedFile(null);
              onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};
