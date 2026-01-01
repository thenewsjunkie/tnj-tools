import { useRef, useEffect, KeyboardEvent } from "react";
import { Bullet } from "./types";
import { v4 as uuidv4 } from "uuid";

interface BulletEditorProps {
  bullets: Bullet[];
  onChange: (bullets: Bullet[]) => void;
}

const BulletEditor = ({ bullets, onChange }: BulletEditorProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const bullet = bullets[index];

    if (e.key === "Enter") {
      e.preventDefault();
      const newBullet: Bullet = { id: uuidv4(), text: "", indent: bullet.indent };
      const newBullets = [...bullets];
      newBullets.splice(index + 1, 0, newBullet);
      onChange(newBullets);
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // Outdent
        if (bullet.indent > 0) {
          const newBullets = [...bullets];
          newBullets[index] = { ...bullet, indent: bullet.indent - 1 };
          onChange(newBullets);
        }
      } else {
        // Indent (max 3 levels)
        if (bullet.indent < 3) {
          const newBullets = [...bullets];
          newBullets[index] = { ...bullet, indent: bullet.indent + 1 };
          onChange(newBullets);
        }
      }
    } else if (e.key === "Backspace" && bullet.text === "") {
      e.preventDefault();
      if (bullets.length > 1) {
        const newBullets = bullets.filter((_, i) => i !== index);
        onChange(newBullets);
        setTimeout(() => {
          const focusIndex = Math.max(0, index - 1);
          inputRefs.current[focusIndex]?.focus();
        }, 0);
      }
    }
  };

  const handleChange = (index: number, text: string) => {
    const newBullets = [...bullets];
    newBullets[index] = { ...newBullets[index], text };
    onChange(newBullets);
  };

  const addBullet = () => {
    const newBullet: Bullet = { id: uuidv4(), text: "", indent: 0 };
    onChange([...bullets, newBullet]);
    setTimeout(() => inputRefs.current[bullets.length]?.focus(), 0);
  };

  return (
    <div className="space-y-1">
      {bullets.map((bullet, index) => (
        <div
          key={bullet.id}
          className="flex items-center gap-1"
          style={{ paddingLeft: `${bullet.indent * 16}px` }}
        >
          <span className="text-muted-foreground text-xs">•</span>
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={bullet.text}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="Type here..."
            className="flex-1 bg-transparent text-sm outline-none border-none focus:ring-0 placeholder:text-muted-foreground/50"
          />
        </div>
      ))}
      {bullets.length === 0 && (
        <button
          onClick={addBullet}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          + Add bullet point
        </button>
      )}
    </div>
  );
};

export default BulletEditor;
