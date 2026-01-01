import { useState } from "react";
import { Link } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, X, Plus } from "lucide-react";

interface LinksListProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

const LinksList = ({ links, onChange }: LinksListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    const newLink: Link = {
      id: uuidv4(),
      url,
      title: newTitle.trim() || undefined,
    };
    onChange([...links, newLink]);
    setNewUrl("");
    setNewTitle("");
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewUrl("");
      setNewTitle("");
    }
  };

  return (
    <div className="space-y-2">
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md group"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="max-w-[150px] truncate">
                {link.title || new URL(link.url).hostname}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(link.id);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </a>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="flex gap-2 items-center">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="URL..."
            className="h-7 text-xs flex-1"
            autoFocus
          />
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Title (optional)"
            className="h-7 text-xs w-32"
          />
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAdd}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => {
              setIsAdding(false);
              setNewUrl("");
              setNewTitle("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          Add link
        </button>
      )}
    </div>
  );
};

export default LinksList;
