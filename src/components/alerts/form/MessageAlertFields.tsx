import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertEffect } from "@/types/alerts";

interface MessageAlertFieldsProps {
  messageText: string;
  setMessageText: (value: string) => void;
  displayDuration: number;
  setDisplayDuration: (value: number) => void;
  textColor: string;
  setTextColor: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  textAlignment: 'left' | 'center' | 'right';
  setTextAlignment: (value: 'left' | 'center' | 'right') => void;
  fontFamily: string;
  setFontFamily: (value: string) => void;
  textShadow: boolean;
  setTextShadow: (value: boolean) => void;
  textAnimation: string;
  setTextAnimation: (value: string) => void;
  effects: AlertEffect[];
  setEffects: (effects: AlertEffect[]) => void;
  useGradient: boolean;
  setUseGradient: (value: boolean) => void;
  gradientColor: string;
  setGradientColor: (value: string) => void;
}

const MessageAlertFields = ({
  messageText,
  setMessageText,
  displayDuration,
  setDisplayDuration,
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
  textAlignment,
  setTextAlignment,
  fontFamily,
  setFontFamily,
  textShadow,
  setTextShadow,
  textAnimation,
  setTextAnimation,
  effects,
  setEffects,
  useGradient,
  setUseGradient,
  gradientColor,
  setGradientColor,
}: MessageAlertFieldsProps) => {
  const availableEffects: AlertEffect[] = ['confetti', 'sparkles', 'fireworks', 'hearts'];
  const availableAnimations = ['none', 'pulse', 'wave', 'bounce', 'shake'];
  const availableFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Impact'];

  const toggleEffect = (effect: AlertEffect) => {
    if (effects.includes(effect)) {
      setEffects(effects.filter(e => e !== effect));
    } else {
      setEffects([...effects, effect]);
    }
  };

  return (
    <div className="space-y-4 text-foreground">
      <div className="space-y-2">
        <Label className="text-foreground">Message Text</Label>
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Enter your message"
          className="h-24 text-foreground bg-background border-input"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Display Duration (seconds)</Label>
        <Slider
          value={[displayDuration]}
          onValueChange={([value]) => setDisplayDuration(value)}
          min={1}
          max={60}
          step={1}
          className="py-4"
        />
        <div className="text-sm text-muted-foreground text-right">
          {displayDuration} seconds
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground">Text Color</Label>
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-10 bg-background border-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Background Color</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 bg-background border-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Text Alignment</Label>
        <Select value={textAlignment} onValueChange={(value: 'left' | 'center' | 'right') => setTextAlignment(value)}>
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left" className="text-foreground">Left</SelectItem>
            <SelectItem value="center" className="text-foreground">Center</SelectItem>
            <SelectItem value="right" className="text-foreground">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Font</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {availableFonts.map(font => (
              <SelectItem key={font} value={font} className="text-foreground">{font}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={textShadow}
          onCheckedChange={setTextShadow}
        />
        <Label className="text-foreground">Enable Text Shadow/Glow</Label>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Text Animation</Label>
        <Select value={textAnimation} onValueChange={setTextAnimation}>
          <SelectTrigger className="bg-background text-foreground border-input">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            {availableAnimations.map(animation => (
              <SelectItem key={animation} value={animation} className="text-foreground">{animation}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Effects</Label>
        <div className="flex flex-wrap gap-2">
          {availableEffects.map(effect => (
            <button
              key={effect}
              type="button"
              onClick={() => toggleEffect(effect)}
              className={`px-3 py-1 rounded-full text-sm ${
                effects.includes(effect)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useGradient}
            onCheckedChange={setUseGradient}
          />
          <Label className="text-foreground">Use Background Gradient</Label>
        </div>
        
        {useGradient && (
          <div className="space-y-2">
            <Label className="text-foreground">Gradient End Color</Label>
            <Input
              type="color"
              value={gradientColor}
              onChange={(e) => setGradientColor(e.target.value)}
              className="h-10 bg-background border-input"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageAlertFields;