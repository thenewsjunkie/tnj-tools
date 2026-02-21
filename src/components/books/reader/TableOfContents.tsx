import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavItem } from "epubjs/types/navigation";
import { ChevronRight } from "lucide-react";

interface TableOfContentsProps {
  toc: NavItem[];
  onSelect: (href: string) => void;
}

export default function TableOfContents({ toc, onSelect }: TableOfContentsProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-foreground mb-3">Table of Contents</h3>
        {toc.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left"
            onClick={() => onSelect(item.href)}
          >
            <ChevronRight className="w-3 h-3 mr-2 shrink-0" />
            <span className="truncate">{item.label.trim()}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
