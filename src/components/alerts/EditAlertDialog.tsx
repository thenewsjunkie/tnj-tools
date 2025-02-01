import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AlertFormFields from "./form/AlertFormFields";

interface EditAlertDialogProps {
  alert: {
    id: string;
    title: string;
    media_url: string;
    media_type: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
    is_gift_alert?: boolean;
    gift_count_animation_speed?: number;
    gift_text_color?: string;
    gift_count_color?: string;
    repeat_count?: number;
    repeat_delay?: number;
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
  const [isGiftAlert, setIsGiftAlert] = useState(alert.is_gift_alert || false);
  const [giftCountAnimationSpeed, setGiftCountAnimationSpeed] = useState(alert.gift_count_animation_speed || 100);
  const [giftTextColor, setGiftTextColor] = useState(alert.gift_text_color || "#FFFFFF");
  const [giftCountColor, setGiftCountColor] = useState(alert.gift_count_color || "#4CDBC4");
  const [repeatCount, setRepeatCount] = useState(alert.repeat_count || 1);
  const [repeatDelay, setRepeatDelay] = useState(alert.repeat_delay || 1000);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(alert.title);
    setMessageEnabled(alert.message_enabled || false);
    setMessageText(alert.message_text || "");
    setFontSize(alert.font_size || 24);
    setIsGiftAlert(alert.is_gift_alert || false);
    setGiftCountAnimationSpeed(alert.gift_count_animation_speed || 100);
    setGiftTextColor(alert.gift_text_color || "#FFFFFF");
    setGiftCountColor(alert.gift_count_color || "#4CDBC4");
    setRepeatCount(alert.repeat_count || 1);
    setRepeatDelay(alert.repeat_delay || 1000);
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
          font_size: fontSize,
          is_gift_alert: isGiftAlert,
          gift_count_animation_speed: giftCountAnimationSpeed,
          gift_text_color: giftTextColor,
          gift_count_color: giftCountColor,
          repeat_count: repeatCount,
          repeat_delay: repeatDelay
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
      console.error('[EditAlertDialog] Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
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