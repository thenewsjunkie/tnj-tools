
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadGif } from "@/utils/gifUtils";
import { useToast } from "@/components/ui/use-toast";

export default function GifUploadForm() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.includes('gif')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a GIF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please select a GIF to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your GIF",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await uploadGif(file, title);
      
      if (result.success) {
        toast({
          title: "GIF uploaded successfully",
          description: "Your GIF has been submitted for approval",
        });
        setTitle("");
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById('gif-file') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-4">Upload a GIF</h2>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your GIF a catchy title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gif-file">GIF File</Label>
        <Input
          id="gif-file"
          type="file"
          accept="image/gif"
          onChange={handleFileChange}
          required
        />
      </div>
      
      {file && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload GIF"}
      </Button>
      
      <p className="text-sm text-muted-foreground text-center">
        Your GIF will be reviewed before it appears on the site.
      </p>
    </form>
  );
}
