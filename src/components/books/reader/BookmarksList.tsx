import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useBookmarks, useDeleteBookmark } from "@/hooks/books/useBookmarks";

interface BookmarksListProps {
  bookId: string;
  onSelect: (location: string) => void;
}

export default function BookmarksList({ bookId, onSelect }: BookmarksListProps) {
  const { data: bookmarks = [] } = useBookmarks(bookId);
  const deleteBm = useDeleteBookmark();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground mb-3">Bookmarks</h3>
        {bookmarks.length === 0 && (
          <p className="text-sm text-muted-foreground">No bookmarks yet</p>
        )}
        {bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="flex items-center gap-2 p-2 rounded border border-border hover:bg-accent/50 cursor-pointer"
            onClick={() => onSelect(bm.location)}
          >
            <span className="text-sm text-foreground flex-1 truncate">
              {bm.label || "Bookmark"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                deleteBm.mutate({ id: bm.id, bookId });
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
