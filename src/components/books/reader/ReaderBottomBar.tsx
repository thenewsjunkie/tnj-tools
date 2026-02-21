import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderBottomBarProps {
  percentage: number;
  chapterLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function ReaderBottomBar({
  percentage,
  chapterLabel,
  onPrev,
  onNext,
}: ReaderBottomBarProps) {
  return (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur px-2 py-1.5 space-y-1">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onPrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0 space-y-0.5">
          {chapterLabel && (
            <p className="text-xs text-muted-foreground truncate">{chapterLabel}</p>
          )}
          <div className="flex items-center gap-2">
            <Progress value={percentage} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right shrink-0">
              {percentage}%
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
