import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditAlertDialogProps {
  alert: {
    id: string;
    title: string;
    media_url: string;
    media_type: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertUpdated: () => void;
}

const EditAlertDialog = ({ alert, open, onOpenChange, onAlertUpdated }: EditAlertDialogProps) => {
  const [title, setTitle] = useState(alert.title);
  const [messageEnabled, setMessageEnabled] = useState(alert.message_enabled || false);
  const [messageText, setMessageText] = useState(alert.message_text || "");
  const [fontSize, setFontSize] = useState(alert.font_size || 24);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Reset form state when alert changes
  useEffect(() => {
    setTitle(alert.title);
    setMessageEnabled(alert.message_enabled || false);
    setMessageText(alert.message_text || "");
    setFontSize(alert.font_size || 24);
  }, [alert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    setIsUploading(true);
    try {
      let mediaUrl = alert.media_url;
      let mediaType = alert.media_type;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('alert_media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('alert_media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl.publicUrl;
        mediaType = file.type;

        // Delete old media file
        const oldFileName = alert.media_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('alert_media')
            .remove([oldFileName]);
        }
      }

      const { error: dbError } = await supabase
        .from('alerts')
        .update({
          title,
          media_url: mediaUrl,
          media_type: mediaType,
          message_enabled: messageEnabled,
          message_text: messageText,
          font_size: fontSize
        })
        .eq('id', alert.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Alert updated successfully",
      });
      
      onAlertUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
      console.error('Update error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Alert Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-foreground bg-background border-input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="message-enabled"
              checked={messageEnabled}
              onCheckedChange={setMessageEnabled}
            />
            <Label htmlFor="message-enabled" className="text-foreground">Enable Alert Message</Label>
          </div>
          {messageEnabled && (
            <>
              <div className="space-y-2">
                <Input
                  placeholder="Alert Message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="text-foreground bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Font Size (px)</Label>
                <Input
                  type="number"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="text-foreground bg-background border-input"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label className="text-foreground">Current Media: {alert.media_type}</Label>
            <Input
              type="file"
              accept="image/gif,video/webm"
              className="text-foreground bg-background border-input"
            />
            <p className="text-sm text-muted-foreground">Leave empty to keep current media</p>
          </div>
          <Button type="submit" className="w-full dark:text-white text-black" disabled={isUploading}>
            {isUploading ? "Updating..." : "Update Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAlertDialog;