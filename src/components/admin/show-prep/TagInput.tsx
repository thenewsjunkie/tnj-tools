import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  allTags?: string[];
  className?: string;
}

const TagInput = ({ tags, onChange, allTags = [], className }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = allTags
    .filter(tag => !tags.includes(tag))
    .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 5);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Add tag..."
          className="h-7 text-xs"
        />
        {showSuggestions && suggestions.length > 0 && inputValue && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted"
                onMouseDown={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface TagButtonProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  allTags?: string[];
  minimal?: boolean;
}

export const TagButton = ({ tags, onChange, allTags, minimal }: TagButtonProps) => {
  if (minimal) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <span>#</span>
          Tags
        </div>
        <TagInput tags={tags} onChange={onChange} allTags={allTags} />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          title="Manage tags"
        >
          <span className="text-xs">#</span>
          {tags.length > 0 && (
            <span className="text-xs ml-1">{tags.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <TagInput tags={tags} onChange={onChange} allTags={allTags} />
      </PopoverContent>
    </Popover>
  );
};

export default TagInput;
