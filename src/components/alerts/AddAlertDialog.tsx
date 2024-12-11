import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
}

const AddAlertDialog = ({ open, onOpenChange, onAlertAdded }: AddAlertDialogProps) => {
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('alert_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('alert_media')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('alerts')
        .insert({
          title,
          media_url: publicUrl.publicUrl,
          media_type: file.type
        });

      if (dbError) throw dbError;

      setTitle("");
      if (fileInput) fileInput.value = "";
      onAlertAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add alert",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle>Add New Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Alert Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/gif,video/webm"
              required
              disabled={isUploading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Add Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertDialog;