import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AlertTypeSelector from "./form/AlertTypeSelector";
import MessageAlertFields from "./form/MessageAlertFields";
import AlertMediaUpload from "./form/AlertMediaUpload";
import GiftAlertFields from "./dialog/GiftAlertFields";
import AlertDialogHeader from "./dialog/AlertDialogHeader";
import AlertTitleInput from "./dialog/AlertTitleInput";
import AlertSubmitButton from "./dialog/AlertSubmitButton";
import { AlertEffect } from "@/types/alerts";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
  isTemplate?: boolean;
}

const AddAlertDialog = ({ 
  open, 
  onOpenChange, 
  onAlertAdded,
  isTemplate = false 
}: AddAlertDialogProps) => {
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Alert type states
  const [isGiftAlert, setIsGiftAlert] = useState(false);
  const [isMessageAlert, setIsMessageAlert] = useState(false);

  // Message alert specific states
  const [messageText, setMessageText] = useState("");
  const [displayDuration, setDisplayDuration] = useState(5);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [backgroundColor, setBackgroundColor] = useState("rgba(0, 0, 0, 0.8)");
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textShadow, setTextShadow] = useState(false);
  const [textAnimation, setTextAnimation] = useState("none");
  const [effects, setEffects] = useState<AlertEffect[]>([]);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState("#000000");

  // Gift alert specific states
  const [messageEnabled, setMessageEnabled] = useState(false);
  const [giftMessageText, setGiftMessageText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [giftCountAnimationSpeed, setGiftCountAnimationSpeed] = useState(100);
  const [giftTextColor, setGiftTextColor] = useState("#FFFFFF");
  const [giftCountColor, setGiftCountColor] = useState("#4CDBC4");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (isMessageAlert) {
        const alertData = {
          title: isTemplate ? 'Message Alert Template' : title,
          media_type: 'message',
          media_url: 'none',
          message_enabled: true,
          message_text: messageText,
          display_duration: displayDuration,
          text_color: textColor,
          background_color: backgroundColor,
          effects: effects,
          is_template: isTemplate,
          style_config: {
            textAlignment,
            fontFamily,
            textShadow,
            textAnimation,
            useGradient,
            gradientColor
          }
        };

        if (isTemplate) {
          // For template, we queue the alert directly
          const { error: queueError } = await supabase
            .from('alert_queue')
            .insert({
              alert_id: '00000000-0000-0000-0000-000000000000', // Placeholder ID
              status: 'pending',
              message_text: messageText,
              display_duration: displayDuration,
              text_color: textColor,
              background_color: backgroundColor,
              effects: effects,
              style_config: {
                textAlignment,
                fontFamily,
                textShadow,
                textAnimation,
                useGradient,
                gradientColor
              }
            });

          if (queueError) throw queueError;
        } else {
          // For regular alerts, we save them to the alerts table
          const { error: dbError } = await supabase
            .from('alerts')
            .insert(alertData)
            .select('*')
            .single();

          if (dbError) throw dbError;
        }
      } else {
        // Handle non-message alerts (existing code)
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
            message_text: giftMessageText,
            font_size: fontSize,
            is_gift_alert: isGiftAlert,
            gift_count_animation_speed: giftCountAnimationSpeed,
            gift_text_color: giftTextColor,
            gift_count_color: giftCountColor
          })
          .select('*')
          .single();

        if (dbError) throw dbError;
      }

      // Reset form
      setTitle("");
      setMessageText("");
      setDisplayDuration(5);
      setTextColor("#FFFFFF");
      setBackgroundColor("rgba(0, 0, 0, 0.8)");
      setTextAlignment('center');
      setFontFamily("Arial");
      setTextShadow(false);
      setTextAnimation("none");
      setEffects([]);
      setUseGradient(false);
      setGradientColor("#000000");
      setMessageEnabled(false);
      setGiftMessageText("");
      setFontSize(24);
      setGiftCountAnimationSpeed(100);
      setGiftTextColor("#FFFFFF");
      setGiftCountColor("#4CDBC4");
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
      onAlertAdded();
      onOpenChange(false);

      toast({
        title: "Success",
        description: isTemplate ? "Alert triggered successfully" : "Alert added successfully",
      });
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
      <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader />
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!isTemplate && (
            <AlertTitleInput title={title} setTitle={setTitle} />
          )}

          <AlertTypeSelector
            isGiftAlert={isGiftAlert}
            setIsGiftAlert={setIsGiftAlert}
            isMessageAlert={isMessageAlert}
            setIsMessageAlert={setIsMessageAlert}
          />

          {isMessageAlert ? (
            <MessageAlertFields
              messageText={messageText}
              setMessageText={setMessageText}
              displayDuration={displayDuration}
              setDisplayDuration={setDisplayDuration}
              textColor={textColor}
              setTextColor={setTextColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              textAlignment={textAlignment}
              setTextAlignment={setTextAlignment}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              textShadow={textShadow}
              setTextShadow={setTextShadow}
              textAnimation={textAnimation}
              setTextAnimation={setTextAnimation}
              effects={effects}
              setEffects={setEffects}
              useGradient={useGradient}
              setUseGradient={setUseGradient}
              gradientColor={gradientColor}
              setGradientColor={setGradientColor}
            />
          ) : isGiftAlert ? (
            <GiftAlertFields
              messageEnabled={messageEnabled}
              setMessageEnabled={setMessageEnabled}
              giftMessageText={giftMessageText}
              setGiftMessageText={setGiftMessageText}
              fontSize={fontSize}
              setFontSize={setFontSize}
              giftCountAnimationSpeed={giftCountAnimationSpeed}
              setGiftCountAnimationSpeed={setGiftCountAnimationSpeed}
              giftTextColor={giftTextColor}
              setGiftTextColor={setGiftTextColor}
              giftCountColor={giftCountColor}
              setGiftCountColor={setGiftCountColor}
            />
          ) : null}

          <AlertMediaUpload 
            isUploading={isUploading}
            isMessageAlert={isMessageAlert}
          />
          
          <AlertSubmitButton isUploading={isUploading} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertDialog;