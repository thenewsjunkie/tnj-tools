import { useState } from "react";
import { Plus, X, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaLink } from "@/components/admin/show-prep/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface MediaLinksSectionProps {
  mediaLinks: MediaLink[];
  onUpdate: (links: MediaLink[]) => Promise<void>;
}

const MediaLinksSection = ({ mediaLinks, onUpdate }: MediaLinksSectionProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("fetch-link-metadata", {
        body: { url: trimmed },
      });

      const newLink: MediaLink = {
        id: uuidv4(),
        url: trimmed,
        title: data?.title || undefined,
        thumbnail: data?.ogImage || undefined,
      };

      await onUpdate([...mediaLinks, newLink]);
      setUrl("");
    } catch {
      // Still add the link without metadata
      const newLink: MediaLink = {
        id: uuidv4(),
        url: trimmed,
      };
      await onUpdate([...mediaLinks, newLink]);
      setUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    await onUpdate(mediaLinks.filter((l) => l.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Media</h3>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Paste a video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd} disabled={loading || !url.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Grid */}
      {mediaLinks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mediaLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors block"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-muted flex items-center justify-center">
                {link.thumbnail ? (
                  <img
                    src={link.thumbnail}
                    alt={link.title || "Video thumbnail"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Title */}
              {link.title && (
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground line-clamp-2">{link.title}</p>
                </div>
              )}

              {/* Remove button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(link.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLinksSection;
