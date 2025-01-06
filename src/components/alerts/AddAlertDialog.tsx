import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AlertTypeSelector from "./form/AlertTypeSelector";
import MessageAlertFields from "./form/MessageAlertFields";
import AlertMediaUpload from "./form/AlertMediaUpload";
import { AlertEffect } from "@/types/alerts";

interface AddAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertAdded: () => void;
}

const AddAlertDialog = ({ open, onOpenChange, onAlertAdded }: AddAlertDialogProps) => {
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
        // For message alerts, we don't need media upload
        const { error: dbError } = await supabase
          .from('alerts')
          .insert({
            title,
            media_type: 'message',
            media_url: 'none',
            message_enabled: true,
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
          })
          .select('*')
          .single();

        if (dbError) throw dbError;
      } else {
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
    <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto">
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
            className="text-foreground bg-background border-input"
          />
        </div>

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
          <div className="space-y-2">
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
                    value={giftMessageText}
                    onChange={(e) => setGiftMessageText(e.target.value)}
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
          </div>
        ) : null}

        <AlertMediaUpload 
          isUploading={isUploading}
          isMessageAlert={isMessageAlert}
        />
        
        <div className="sticky bottom-0 pt-4 bg-background/95 backdrop-blur">
          <Button 
            type="submit" 
            className="w-full bg-primary text-black hover:bg-primary/90" 
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Add Alert"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default AddAlertDialog;
