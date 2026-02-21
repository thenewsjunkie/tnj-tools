import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useHighlights, useDeleteHighlight } from "@/hooks/books/useHighlights";
import { useNotes, useDeleteNote } from "@/hooks/books/useNotes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface HighlightsPanelProps {
  bookId: string;
  onSelectHighlight?: (cfi: string) => void;
}

export default function HighlightsPanel({ bookId, onSelectHighlight }: HighlightsPanelProps) {
  const { data: highlights = [] } = useHighlights(bookId);
  const { data: notes = [] } = useNotes(bookId);
  const deleteHighlight = useDeleteHighlight();
  const deleteNote = useDeleteNote();

  return (
    <Tabs defaultValue="highlights" className="h-full flex flex-col">
      <TabsList className="shrink-0 mx-4 mt-4">
        <TabsTrigger value="highlights">Highlights ({highlights.length})</TabsTrigger>
        <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="highlights" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {highlights.length === 0 && (
              <p className="text-sm text-muted-foreground">No highlights</p>
            )}
            {highlights.map((h) => (
              <div
                key={h.id}
                className="p-2 rounded border border-border hover:bg-accent/50 cursor-pointer"
                onClick={() => onSelectHighlight?.(h.cfi_range)}
              >
                <p className="text-sm text-foreground line-clamp-2">{h.text_excerpt || "Highlight"}</p>
                <div className="flex items-center justify-between mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: h.color }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHighlight.mutate({ id: h.id, bookId });
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
            {notes.map((n) => (
              <div key={n.id} className="p-2 rounded border border-border">
                <p className="text-sm text-foreground">{n.text}</p>
                <div className="flex items-center justify-end mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteNote.mutate({ id: n.id, bookId })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
