import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AddLinkDialogProps {
  onLinkAdded: () => void;
  lastOrder: number;
}

const AddLinkDialog = ({ onLinkAdded, lastOrder }: AddLinkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let processedUrl = url;
      // Convert HTTP to HTTPS
      if (processedUrl.startsWith('http://')) {
        processedUrl = processedUrl.replace('http://', 'https://');
      }
      // Add HTTPS if no protocol is specified
      if (!processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }

      const { error } = await supabase
        .from('tnj_links')
        .insert({
          title,
          url: processedUrl,
          display_order: lastOrder + 1
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link added successfully",
      });

      setOpen(false);
      setTitle("");
      setUrl("");
      onLinkAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
    }
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-foreground';
  const iconColor = theme === 'dark' ? 'text-white' : 'text-neon-red';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={`${iconColor} hover:text-primary hover:bg-white/10`}>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className={textColor}>Add New Link</DialogTitle>
          <DialogDescription className={theme === 'dark' ? 'text-white/70' : 'text-muted-foreground'}>
            Add a new link to your TNJ Links collection. The link status will be checked automatically.
          </DialogDescription>
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
          <Button type="submit" className="w-full">
            Add Link
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkDialog;