import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/hooks/useAlerts";
import MessageForm from "./form/MessageForm";
import AlertMessage from "../AlertMessage";

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
  const [backgroundColor, setBackgroundColor] = useState("rgba(0, 0, 0, 0.8)");
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
      const effects = confettiEnabled ? ["confetti"] : [];
      
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: selectedAlert.id,
          status: 'pending',
          message_text: message,
          font_size: fontSize,
          display_duration: duration,
          text_color: textColor,
          background_color: backgroundColor,
          text_alignment: textAlignment,
          transition_type: transition,
          text_animation: textAnimation,
          effects: effects
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
        </DialogHeader>
        
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

        {isPreviewMode && (
          <div className="mt-4 p-4 rounded-lg relative" style={{ backgroundColor }}>
            <AlertMessage
              message={message}
              fontSize={fontSize}
              textColor={textColor}
              textAlignment={textAlignment}
              textAnimation={textAnimation}
            />
            {confettiEnabled && (
              <div className="absolute inset-0 pointer-events-none">
                <canvas id="preview-confetti" className="w-full h-full" />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-background py-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-card text-card-foreground border-input hover:bg-accent"
          >
            Cancel
          </Button>
          {!isPreviewMode ? (
            <Button 
              onClick={() => setIsPreviewMode(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Preview
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
                className="bg-card text-card-foreground border-input hover:bg-accent"
              >
                Edit
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Queue Alert
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageAlertDialog;