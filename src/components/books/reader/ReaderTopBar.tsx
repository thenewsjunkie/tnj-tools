import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReaderTopBarProps {
  title: string;
  onToggleBookmarks?: () => void;
  onToggleSettings?: () => void;
}

export default function ReaderTopBar({
  title,
  onToggleBookmarks,
  onToggleSettings,
}: ReaderTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-background/95 backdrop-blur shrink-0">
      <Button variant="ghost" size="icon" onClick={() => navigate("/books")}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <p className="text-sm font-medium text-foreground truncate flex-1">{title}</p>
      {onToggleBookmarks && (
        <Button variant="ghost" size="icon" onClick={onToggleBookmarks}>
          <Bookmark className="w-4 h-4" />
        </Button>
      )}
      {onToggleSettings && (
        <Button variant="ghost" size="icon" onClick={onToggleSettings}>
          <Settings2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
