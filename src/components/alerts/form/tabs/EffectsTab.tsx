import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertEffect } from "@/types/alerts";

interface EffectsTabProps {
  effects: AlertEffect[];
  setEffects: (effects: AlertEffect[]) => void;
}

const EffectsTab = ({ effects, setEffects }: EffectsTabProps) => {
  const availableEffects: AlertEffect[] = ['confetti', 'sparkles', 'fireworks', 'hearts'];

  const toggleEffect = (effect: AlertEffect) => {
    if (effects.includes(effect)) {
      setEffects(effects.filter(e => e !== effect));
    } else {
      setEffects([...effects, effect]);
    }
  };

  return (
    <Card className="p-4 dark:bg-black/50 dark:border-white/10">
      <Label className="mb-4 block">Effects</Label>
      <div className="flex flex-wrap gap-2">
        {availableEffects.map(effect => (
          <button
            key={effect}
            onClick={() => toggleEffect(effect)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              effects.includes(effect)
                ? 'bg-primary text-primary-foreground dark:bg-white/20'
                : 'bg-secondary text-secondary-foreground dark:bg-black/50'
            }`}
          >
            {effect}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default EffectsTab;