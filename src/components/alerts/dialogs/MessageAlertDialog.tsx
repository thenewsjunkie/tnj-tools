import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/hooks/useAlerts";
import MessageForm from "./form/MessageForm";
import AlertPreview from "./preview/AlertPreview";
import DialogActions from "./actions/DialogActions";

interface MessageAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAlert: Alert;
}

const MessageAlertDialog = ({ open, onOpenChange, selectedAlert }: MessageAlertDialogProps) => {
  const [message, setMessage] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [duration, setDuration] = useState(5);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [backgroundColor, setBackgroundColor] = useState("#000000CC");
  const [textAlignment, setTextAlignment] = useState("center");
  const [transition, setTransition] = useState("fade");
  const [textAnimation, setTextAnimation] = useState("none");
  const [confettiEnabled, setConfettiEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const effects = confettiEnabled ? ['confetti'] : [];
      
      // Only include fields that exist in the alert_queue table
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: selectedAlert.id,
          status: 'pending',
          message_text: message,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message alert queued successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error queueing message alert:', error);
      toast({
        title: "Error",
        description: "Failed to queue message alert",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Queue Message Alert</DialogTitle>
          <DialogDescription>
            Configure and preview your message alert before queueing it.
          </DialogDescription>
        </DialogHeader>
        
        {!isPreviewMode ? (
          <MessageForm
            message={message}
            setMessage={setMessage}
            fontSize={fontSize}
            setFontSize={setFontSize}
            duration={duration}
            setDuration={setDuration}
            textColor={textColor}
            setTextColor={setTextColor}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            textAlignment={textAlignment}
            setTextAlignment={setTextAlignment}
            transition={transition}
            setTransition={setTransition}
            textAnimation={textAnimation}
            setTextAnimation={setTextAnimation}
            confettiEnabled={confettiEnabled}
            setConfettiEnabled={setConfettiEnabled}
          />
        ) : (
          <AlertPreview
            message={message}
            fontSize={fontSize}
            textColor={textColor}
            textAlignment={textAlignment}
            textAnimation={textAnimation}
            backgroundColor={backgroundColor}
            confettiEnabled={confettiEnabled}
          />
        )}

        <DialogActions
          isPreviewMode={isPreviewMode}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onPreview={() => setIsPreviewMode(true)}
          onEdit={() => setIsPreviewMode(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MessageAlertDialog;