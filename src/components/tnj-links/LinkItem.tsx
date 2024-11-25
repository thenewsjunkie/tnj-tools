import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkItemProps {
  title: string;
  url: string;
  status: string;
  onDelete: () => void;
}

const LinkItem = ({ title, url, status, onDelete }: LinkItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'down':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    }
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg group">
      <div className="flex items-center gap-2 sm:gap-3">
        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white transition-colors" />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white text-sm sm:text-base hover:text-primary transition-colors"
        >
          {title}
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary"
          className={cn("capitalize", getStatusColor(status))}
        >
          {status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-white/50 hover:text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LinkItem;