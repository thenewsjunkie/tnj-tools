import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface HeadlineItem {
  text: string;
  url: string;
}

interface HeadlinesProps {
  headlines: HeadlineItem[];
}

const Headlines = ({ headlines }: HeadlinesProps) => {
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const visibleHeadlines = showAllHeadlines ? headlines : headlines.slice(0, 3);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Latest Headlines</h3>
      <div className="space-y-2 text-left">
        {visibleHeadlines.map((headline, index) => (
          <p key={index} className="leading-relaxed flex items-center justify-between group">
            <span>{headline.text}</span>
            <a 
              href={headline.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors ml-2 opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </p>
        ))}
      </div>
      {headlines.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllHeadlines(!showAllHeadlines)}
          className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          {showAllHeadlines ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show More <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default Headlines;