import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface GiftAlertFieldsProps {
  messageEnabled: boolean;
  setMessageEnabled: (enabled: boolean) => void;
  giftMessageText: string;
  setGiftMessageText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  giftCountAnimationSpeed: number;
  setGiftCountAnimationSpeed: (speed: number) => void;
  giftTextColor: string;
  setGiftTextColor: (color: string) => void;
  giftCountColor: string;
  setGiftCountColor: (color: string) => void;
}

const GiftAlertFields = ({
  messageEnabled,
  setMessageEnabled,
  giftMessageText,
  setGiftMessageText,
  fontSize,
  setFontSize,
  giftCountAnimationSpeed,
  setGiftCountAnimationSpeed,
  giftTextColor,
  setGiftTextColor,
  giftCountColor,
  setGiftCountColor,
}: GiftAlertFieldsProps) => {
  return (
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
  );
};

export default GiftAlertFields;