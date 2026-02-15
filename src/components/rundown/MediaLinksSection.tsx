import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaLink } from "@/components/admin/show-prep/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableMediaCard from "./SortableMediaCard";

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = mediaLinks.findIndex((l) => l.id === active.id);
      const newIndex = mediaLinks.findIndex((l) => l.id === over.id);
      onUpdate(arrayMove(mediaLinks, oldIndex, newIndex));
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={mediaLinks.map((l) => l.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mediaLinks.map((link) => (
                <SortableMediaCard key={link.id} link={link} onRemove={handleRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default MediaLinksSection;
