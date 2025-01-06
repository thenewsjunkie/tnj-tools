import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EffectsSelectorProps {
  confettiEnabled: boolean;
  setConfettiEnabled: (enabled: boolean) => void;
}

const EffectsSelector = ({
  confettiEnabled,
  setConfettiEnabled,
}: EffectsSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label className="text-foreground">Visual Effects</Label>
      <div className="flex items-center space-x-2">
        <Switch
          id="confetti"
          checked={confettiEnabled}
          onCheckedChange={setConfettiEnabled}
        />
        <Label htmlFor="confetti" className="text-foreground">
          Enable Confetti
        </Label>
      </div>
    </div>
  );
};

export default EffectsSelector;