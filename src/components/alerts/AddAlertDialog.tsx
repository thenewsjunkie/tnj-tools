import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
}

const AddAlertDialog = ({ open, onOpenChange, onAlertAdded }: AddAlertDialogProps) => {
  const [title, setTitle] = useState("");
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [isGiftAlert, setIsGiftAlert] = useState(false);
  const [giftCountAnimationSpeed, setGiftCountAnimationSpeed] = useState(100);
  const [giftTextColor, setGiftTextColor] = useState("#FFFFFF");
  const [giftCountColor, setGiftCountColor] = useState("#4CDBC4");
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
          media_type: file.type,
          message_enabled: messageEnabled,
          message_text: messageText,
          font_size: fontSize,
          is_gift_alert: isGiftAlert,
          gift_count_animation_speed: giftCountAnimationSpeed,
          gift_text_color: giftTextColor,
          gift_count_color: giftCountColor
        })
        .select('*')
        .single();

      if (dbError) throw dbError;

      setTitle("");
      setMessageEnabled(false);
      setMessageText("");
      setFontSize(24);
      setIsGiftAlert(false);
      setGiftCountAnimationSpeed(100);
      setGiftTextColor("#FFFFFF");
      setGiftCountColor("#4CDBC4");
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
          <DialogTitle className="text-foreground">Add New Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Alert Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-foreground bg-background"
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
                  className="text-foreground bg-background"
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
                  className="text-foreground bg-background"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="gift-alert"
                  checked={isGiftAlert}
                  onCheckedChange={setIsGiftAlert}
                />
                <Label htmlFor="gift-alert" className="text-foreground">Gift Subscription Alert</Label>
              </div>

              {isGiftAlert && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Animation Speed (ms)</Label>
                    <Input
                      type="number"
                      min="50"
                      max="500"
                      value={giftCountAnimationSpeed}
                      onChange={(e) => setGiftCountAnimationSpeed(Number(e.target.value))}
                      className="text-foreground bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Text Color</Label>
                    <Input
                      type="color"
                      value={giftTextColor}
                      onChange={(e) => setGiftTextColor(e.target.value)}
                      className="h-10 text-foreground bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Counter Color</Label>
                    <Input
                      type="color"
                      value={giftCountColor}
                      onChange={(e) => setGiftCountColor(e.target.value)}
                      className="h-10 text-foreground bg-background"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/gif,video/webm"
              required
              disabled={isUploading}
              className="text-foreground bg-background"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full dark:text-white text-black" 
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Add Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertDialog;