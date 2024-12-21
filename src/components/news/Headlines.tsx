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
  const visibleHeadlines = showAllHeadlines ? headlines : headlines.slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Latest Headlines</h3>
      <div className="space-y-2 text-left">
        {visibleHeadlines.map((headline, index) => (
          <div key={index} className="flex items-center gap-2">
            <span>{headline.text}</span>
            <a 
              href={headline.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-red hover:text-tnj-light transition-colors inline-flex items-center gap-1"
            >
              <span className="text-sm">[Link</span>
              <ExternalLink className="h-3 w-3" />
              <span className="text-sm">]</span>
            </a>
          </div>
        ))}
      </div>
      {headlines.length > 5 && (
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