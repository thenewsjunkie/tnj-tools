import { useState } from "react";
import { Link } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, X, Plus, Link as LinkIcon, Loader2, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LinksListProps {
  links: Link[];
  onChange: (links: Link[]) => void;
  isEditing?: boolean;
}

const LinksList = ({ links, onChange, isEditing = false }: LinksListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const fetchPageTitle = async (url: string): Promise<string | undefined> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-link-metadata', {
        body: { url }
      });
      
      if (error || !data?.success) {
        console.log('Failed to fetch title:', error || data?.error);
        return undefined;
      }
      
      return data.title || undefined;
    } catch (err) {
      console.log('Error fetching title:', err);
      return undefined;
    }
  };

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    
    // If user provided a manual title, use it; otherwise fetch from page
    let title = newTitle.trim() || undefined;
    
    if (!title) {
      setIsFetching(true);
      title = await fetchPageTitle(url);
      setIsFetching(false);
    }
    
    const newLink: Link = {
      id: uuidv4(),
      url,
      title,
    };
    onChange([...links, newLink]);
    setNewUrl("");
    setNewTitle("");
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
  };

  const handleStartEdit = (link: Link) => {
    setEditingLinkId(link.id);
    setEditUrl(link.url);
    setEditTitle(link.title || "");
  };

  const handleSaveEdit = () => {
    if (!editUrl.trim() || !editingLinkId) return;
    
    const url = editUrl.startsWith("http") ? editUrl : `https://${editUrl}`;
    onChange(links.map(link => 
      link.id === editingLinkId 
        ? { ...link, url, title: editTitle.trim() || undefined }
        : link
    ));
    setEditingLinkId(null);
    setEditUrl("");
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditUrl("");
    setEditTitle("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
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
            
            if (editingLinkId === link.id) {
              return (
                <div key={link.id} className="flex gap-2 items-center p-2 rounded-md bg-muted/30">
                  <Input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="URL..."
                    className="h-7 text-xs flex-1"
                    autoFocus
                  />
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Title (optional)"
                    className="h-7 text-xs w-32"
                  />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleSaveEdit}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleCancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            }
            
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
                {isEditing && (
                  <>
                    <button
                      onClick={() => handleStartEdit(link)}
                      className="p-1 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRemove(link.id)}
                      className="p-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
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
            disabled={isFetching}
          />
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Title (optional)"
            className="h-7 text-xs w-32"
            disabled={isFetching}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2" 
            onClick={handleAdd}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
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
            disabled={isFetching}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : isEditing && (
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
