import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EditAlertFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  messageEnabled: boolean;
  setMessageEnabled: (value: boolean) => void;
  messageText: string;
  setMessageText: (value: string) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  isGiftAlert: boolean;
  setIsGiftAlert: (value: boolean) => void;
  giftCountAnimationSpeed: number;
  setGiftCountAnimationSpeed: (value: number) => void;
  giftTextColor: string;
  setGiftTextColor: (value: string) => void;
  giftCountColor: string;
  setGiftCountColor: (value: string) => void;
  repeatCount: number;
  setRepeatCount: (value: number) => void;
  repeatDelay: number;
  setRepeatDelay: (value: number) => void;
}

const EditAlertFormFields = ({
  title,
  setTitle,
  messageEnabled,
  setMessageEnabled,
  messageText,
  setMessageText,
  fontSize,
  setFontSize,
  isGiftAlert,
  setIsGiftAlert,
  giftCountAnimationSpeed,
  setGiftCountAnimationSpeed,
  giftTextColor,
  setGiftTextColor,
  giftCountColor,
  setGiftCountColor,
  repeatCount,
  setRepeatCount,
  repeatDelay,
  setRepeatDelay,
}: EditAlertFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Input
          placeholder="Alert Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="text-foreground bg-background border-input"
        />
      </div>
      
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
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="text-foreground bg-background border-input"
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
              className="text-foreground bg-background border-input"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="gift-alert"
              checked={isGiftAlert}
              onCheckedChange={setIsGiftAlert}
            />
            <Label htmlFor="gift-alert" className="text-foreground">Gift Subscription Alert</Label>
          </div>

          {isGiftAlert && (
            <>
              <div className="space-y-2">
                <Label className="text-foreground">Animation Speed (ms)</Label>
                <Input
                  type="number"
                  min="50"
                  max="500"
                  value={giftCountAnimationSpeed}
                  onChange={(e) => setGiftCountAnimationSpeed(Number(e.target.value))}
                  className="text-foreground bg-background border-input"
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
        </>
      )}

      <div className="space-y-4 pt-4 border-t border-border">
        <Label className="text-foreground text-lg">Repeat Settings</Label>
        <div className="space-y-2">
          <Label className="text-foreground">Repeat Count</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={repeatCount}
            onChange={(e) => setRepeatCount(Number(e.target.value))}
            className="text-foreground bg-background border-input"
          />
          <p className="text-sm text-muted-foreground">Number of times to play the alert (1-10)</p>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Repeat Delay (ms)</Label>
          <Input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={repeatDelay}
            onChange={(e) => setRepeatDelay(Number(e.target.value))}
            className="text-foreground bg-background border-input"
          />
          <p className="text-sm text-muted-foreground">Delay between repeats in milliseconds (0-10000)</p>
        </div>
      </div>
    </>
  );
};

export default EditAlertFormFields;