import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AlertFormFields from "./form/AlertFormFields";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
}

const AddAlertDialog = ({ open, onOpenChange, onAlertAdded }: AddAlertDialogProps) => {
  const [title, setTitle] = useState("");
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [isGiftAlert, setIsGiftAlert] = useState(false);
  const [giftCountAnimationSpeed, setGiftCountAnimationSpeed] = useState(100);
  const [giftTextColor, setGiftTextColor] = useState("#FFFFFF");
  const [giftCountColor, setGiftCountColor] = useState("#4CDBC4");
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatDelay, setRepeatDelay] = useState(1000);
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
          gift_count_color: giftCountColor,
          repeat_count: repeatCount,
          repeat_delay: repeatDelay
        })
        .select('*')
        .single();

      if (dbError) throw dbError;

      setTitle("");
      setMessageEnabled(false);
      setMessageText("");
      setFontSize(48);
      setIsGiftAlert(false);
      setGiftCountAnimationSpeed(100);
      setGiftTextColor("#FFFFFF");
      setGiftCountColor("#4CDBC4");
      setRepeatCount(1);
      setRepeatDelay(1000);
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
          <AlertFormFields
            title={title}
            setTitle={setTitle}
            messageEnabled={messageEnabled}
            setMessageEnabled={setMessageEnabled}
            messageText={messageText}
            setMessageText={setMessageText}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isGiftAlert={isGiftAlert}
            setIsGiftAlert={setIsGiftAlert}
            giftCountAnimationSpeed={giftCountAnimationSpeed}
            setGiftCountAnimationSpeed={setGiftCountAnimationSpeed}
            giftTextColor={giftTextColor}
            setGiftTextColor={setGiftTextColor}
            giftCountColor={giftCountColor}
            setGiftCountColor={setGiftCountColor}
            repeatCount={repeatCount}
            setRepeatCount={setRepeatCount}
            repeatDelay={repeatDelay}
            setRepeatDelay={setRepeatDelay}
          />

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