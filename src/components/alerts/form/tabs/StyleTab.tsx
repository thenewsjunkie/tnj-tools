import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

interface StyleTabProps {
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
  useGradient: boolean;
  setUseGradient: (value: boolean) => void;
  gradientColor: string;
  setGradientColor: (value: string) => void;
}

const StyleTab = ({
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
  useGradient,
  setUseGradient,
  gradientColor,
  setGradientColor,
}: StyleTabProps) => {
  const availableFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Impact'];
  const availableAnimations = ['none', 'pulse', 'wave', 'bounce', 'shake'];

  return (
    <Card className="p-4 space-y-4 dark:bg-black/50 dark:border-white/10">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Text Color</Label>
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="dark:bg-black/50 dark:border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label>Background Color</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="dark:bg-black/50 dark:border-white/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <Select value={textAlignment} onValueChange={(value: 'left' | 'center' | 'right') => setTextAlignment(value)}>
          <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
            <SelectItem value="left" className="dark:text-white dark:focus:bg-white/10">Left</SelectItem>
            <SelectItem value="center" className="dark:text-white dark:focus:bg-white/10">Center</SelectItem>
            <SelectItem value="right" className="dark:text-white dark:focus:bg-white/10">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
            {availableFonts.map(font => (
              <SelectItem key={font} value={font} className="dark:text-white dark:focus:bg-white/10">{font}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={textShadow}
          onCheckedChange={setTextShadow}
          className="dark:bg-black/50"
        />
        <Label>Enable Text Shadow/Glow</Label>
      </div>

      <div className="space-y-2">
        <Label>Text Animation</Label>
        <Select value={textAnimation} onValueChange={setTextAnimation}>
          <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
            {availableAnimations.map(animation => (
              <SelectItem key={animation} value={animation} className="dark:text-white dark:focus:bg-white/10">
                {animation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useGradient}
            onCheckedChange={setUseGradient}
            className="dark:bg-black/50"
          />
          <Label>Use Background Gradient</Label>
        </div>
        
        {useGradient && (
          <div className="space-y-2">
            <Label>Gradient End Color</Label>
            <Input
              type="color"
              value={gradientColor}
              onChange={(e) => setGradientColor(e.target.value)}
              className="dark:bg-black/50 dark:border-white/10"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StyleTab;