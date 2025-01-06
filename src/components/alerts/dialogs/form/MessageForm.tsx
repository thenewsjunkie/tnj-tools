import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EffectsSelector from "../effects/EffectsSelector";

interface MessageFormProps {
  message: string;
  setMessage: (message: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  textAlignment: string;
  setTextAlignment: (alignment: string) => void;
  transition: string;
  setTransition: (transition: string) => void;
  textAnimation: string;
  setTextAnimation: (animation: string) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (enabled: boolean) => void;
}

const MessageForm = ({
  message,
  setMessage,
  fontSize,
  setFontSize,
  duration,
  setDuration,
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
  textAlignment,
  setTextAlignment,
  transition,
  setTransition,
  textAnimation,
  setTextAnimation,
  confettiEnabled,
  setConfettiEnabled,
}: MessageFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="message" className="text-foreground">Message</Label>
        <Input
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          className="bg-card text-card-foreground border-input"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-foreground">Font Size ({fontSize}px)</Label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
          min={24}
          max={120}
          step={1}
          className="bg-transparent"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-foreground">Duration ({duration}s)</Label>
        <Slider
          value={[duration]}
          onValueChange={(value) => setDuration(value[0])}
          min={1}
          max={30}
          step={1}
          className="bg-transparent"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="textColor" className="text-foreground">Text Color</Label>
        <Input
          id="textColor"
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="h-10 px-3 py-2 bg-card text-card-foreground border-input"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="backgroundColor" className="text-foreground">Background Color</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="h-10 px-3 py-2 bg-card text-card-foreground border-input"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-foreground">Text Alignment</Label>
        <Select value={textAlignment} onValueChange={setTextAlignment}>
          <SelectTrigger className="bg-card text-card-foreground border-input">
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
        <Label className="text-foreground">Transition</Label>
        <Select value={transition} onValueChange={setTransition}>
          <SelectTrigger className="bg-card text-card-foreground border-input">
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
        <Label className="text-foreground">Text Animation</Label>
        <Select value={textAnimation} onValueChange={setTextAnimation}>
          <SelectTrigger className="bg-card text-card-foreground border-input">
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

      <EffectsSelector 
        confettiEnabled={confettiEnabled}
        setConfettiEnabled={setConfettiEnabled}
      />
    </div>
  );
};

export default MessageForm;