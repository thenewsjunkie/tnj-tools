import { useRef, useEffect, KeyboardEvent } from "react";
import { Bullet } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulletEditorProps {
  bullets: Bullet[];
  onChange: (bullets: Bullet[]) => void;
}

const BulletEditor = ({ bullets, onChange }: BulletEditorProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus newly added bullet
  useEffect(() => {
    const lastInput = inputRefs.current[bullets.length - 1];
    if (lastInput && !lastInput.value) {
      lastInput.focus();
    }
  }, [bullets.length]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const bullet = bullets[index];

    if (e.key === "Enter") {
      e.preventDefault();
      const newBullet: Bullet = { id: uuidv4(), text: "", indent: bullet.indent, checked: false };
      const newBullets = [...bullets];
      newBullets.splice(index + 1, 0, newBullet);
      onChange(newBullets);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const newIndent = e.shiftKey
        ? Math.max(0, bullet.indent - 1)
        : Math.min(3, bullet.indent + 1);
      const newBullets = [...bullets];
      newBullets[index] = { ...bullet, indent: newIndent };
      onChange(newBullets);
    } else if (e.key === "Backspace" && !bullet.text && bullets.length > 1) {
      e.preventDefault();
      const newBullets = bullets.filter((_, i) => i !== index);
      onChange(newBullets);
      setTimeout(() => {
        const prevInput = inputRefs.current[Math.max(0, index - 1)];
        prevInput?.focus();
      }, 0);
    }
  };

  const handleChange = (index: number, text: string) => {
    const newBullets = [...bullets];
    newBullets[index] = { ...bullets[index], text };
    onChange(newBullets);
  };

  const handleCheckedChange = (index: number, checked: boolean) => {
    const newBullets = [...bullets];
    newBullets[index] = { ...bullets[index], checked };
    onChange(newBullets);
  };

  const addBullet = () => {
    const newBullet: Bullet = { id: uuidv4(), text: "", indent: 0, checked: false };
    onChange([...bullets, newBullet]);
  };

  // Check if there's any actual content
  const hasContent = bullets.some(b => b.text.trim());

  if (!hasContent && bullets.length <= 1) {
    return (
      <button
        onClick={addBullet}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add talking points
      </button>
    );
  }

  return (
    <div className="space-y-1">
      {bullets.map((bullet, index) => (
        <div
          key={bullet.id}
          className="flex items-start gap-2 group"
          style={{ paddingLeft: `${bullet.indent * 16}px` }}
        >
          <Checkbox
            checked={bullet.checked || false}
            onCheckedChange={(checked) => handleCheckedChange(index, checked as boolean)}
            className="mt-1.5 h-3.5 w-3.5 rounded-sm border-muted-foreground/40 data-[state=checked]:bg-primary/80 data-[state=checked]:border-primary/80"
          />
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={bullet.text}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder={index === 0 ? "Add a talking point..." : ""}
            className={cn(
              "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 transition-all",
              bullet.checked && "line-through text-muted-foreground/50"
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default BulletEditor;
