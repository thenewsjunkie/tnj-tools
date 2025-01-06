import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface ContentTabProps {
  messageText: string;
  setMessageText: (value: string) => void;
  displayDuration: number;
  setDisplayDuration: (value: number) => void;
}

const ContentTab = ({
  messageText,
  setMessageText,
  displayDuration,
  setDisplayDuration,
}: ContentTabProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Message Text</Label>
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Enter your message"
          className="h-24 dark:bg-black/50 dark:text-white dark:border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label>Display Duration (seconds)</Label>
        <div className="pt-2">
          <Slider
            value={[displayDuration]}
            onValueChange={([value]) => setDisplayDuration(value)}
            min={1}
            max={60}
            step={1}
            className="dark:bg-black/50"
          />
        </div>
        <div className="text-sm text-muted-foreground text-right">
          {displayDuration} seconds
        </div>
      </div>
    </div>
  );
};

export default ContentTab;