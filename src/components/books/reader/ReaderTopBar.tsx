import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkPlus, List, Highlighter, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReaderTopBarProps {
  title: string;
  onToggleToc?: () => void;
  onToggleHighlights?: () => void;
  onAddBookmark?: () => void;
  onToggleBookmarks?: () => void;
  onToggleSettings?: () => void;
}

export default function ReaderTopBar({
  title,
  onToggleToc,
  onToggleHighlights,
  onAddBookmark,
  onToggleBookmarks,
  onToggleSettings,
}: ReaderTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-background/95 backdrop-blur shrink-0">
      <Button variant="ghost" size="icon" onClick={() => navigate("/books")}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <p className="text-sm font-medium text-foreground truncate flex-1 mx-1">{title}</p>
      {onToggleToc && (
        <Button variant="ghost" size="icon" onClick={onToggleToc} title="Table of Contents">
          <List className="w-4 h-4" />
        </Button>
      )}
      {onToggleHighlights && (
        <Button variant="ghost" size="icon" onClick={onToggleHighlights} title="Highlights & Notes">
          <Highlighter className="w-4 h-4" />
        </Button>
      )}
      {onAddBookmark && (
        <Button variant="ghost" size="icon" onClick={onAddBookmark} title="Bookmark this page">
          <BookmarkPlus className="w-4 h-4" />
        </Button>
      )}
      {onToggleBookmarks && (
        <Button variant="ghost" size="icon" onClick={onToggleBookmarks} title="Bookmarks">
          <Bookmark className="w-4 h-4" />
        </Button>
      )}
      {onToggleSettings && (
        <Button variant="ghost" size="icon" onClick={onToggleSettings} title="Settings">
          <Settings2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
