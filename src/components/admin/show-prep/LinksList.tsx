import { useState } from "react";
import { Link } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, X, Plus, Link as LinkIcon } from "lucide-react";

interface LinksListProps {
  links: Link[];
  onChange: (links: Link[]) => void;
  isEditing?: boolean;
}

const LinksList = ({ links, onChange, isEditing = false }: LinksListProps) => {
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

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-2">
      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((link) => {
            const hostname = getHostname(link.url);
            const faviconUrl = getFaviconUrl(link.url);
            
            return (
              <div
                key={link.id}
                className="group flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {faviconUrl && (
                  <img 
                    src={faviconUrl} 
                    alt="" 
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 group/link"
                >
                  <div className="flex items-center gap-1.5">
                    {!faviconUrl && <LinkIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                    <span className="text-sm font-medium truncate group-hover/link:text-primary transition-colors">
                      {link.title || hostname}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  {link.title && (
                    <span className="text-xs text-muted-foreground truncate block">
                      {hostname}
                    </span>
                  )}
                </a>
                <button
                  onClick={() => handleRemove(link.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
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
      ) : (isEditing || links.length === 0) && (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add link
        </button>
      )}
    </div>
  );
};

export default LinksList;
