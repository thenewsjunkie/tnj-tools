import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme/ThemeProvider";

interface EditLinkDialogProps {
  link?: {
    id: string;
    title: string;
    url: string;
    target: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkUpdated: () => void;
}

const EditLinkDialog = ({ link, open, onOpenChange, onLinkUpdated }: EditLinkDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState("_blank");
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setTarget(link.target);
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let processedUrl = url;
      if (processedUrl.startsWith('http://')) {
        processedUrl = processedUrl.replace('http://', 'https://');
      }
      if (!processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }

      if (!link?.id) return;

      const { error } = await supabase
        .from('tnj_links')
        .update({
          title,
          url: processedUrl,
          target
        })
        .eq('id', link.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link updated successfully",
      });

      onOpenChange(false);
      onLinkUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    }
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className={textColor}>Edit Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Link Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={textColor}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className={textColor}
            />
          </div>
          <div className="space-y-2">
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select target window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_blank">New Window</SelectItem>
                <SelectItem value="_self">Same Window</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Update Link
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkDialog;