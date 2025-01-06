import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "@/hooks/useAlerts";

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
  const [fontFamily, setFontFamily] = useState("Radiate Sans Extra Bold");
  const [transition, setTransition] = useState("fade");
  const [textAnimation, setTextAnimation] = useState("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          font_family: fontFamily,
          transition_type: transition,
          text_animation: textAnimation
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Queue Message Alert</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
            />
          </div>

          <div className="grid gap-2">
            <Label>Font Size ({fontSize}px)</Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={24}
              max={120}
              step={1}
            />
          </div>

          <div className="grid gap-2">
            <Label>Duration ({duration}s)</Label>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={1}
              max={30}
              step={1}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="textColor">Text Color</Label>
            <Input
              id="textColor"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Text Alignment</Label>
            <Select value={textAlignment} onValueChange={setTextAlignment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Transition</Label>
            <Select value={transition} onValueChange={setTransition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Text Animation</Label>
            <Select value={textAnimation} onValueChange={setTextAnimation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="pulse">Pulse</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Queue Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageAlertDialog;