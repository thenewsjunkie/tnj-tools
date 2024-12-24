import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkItemProps {
  title: string;
  url: string;
  status: string;
  target: string;
  onDelete: () => void;
  onEdit: () => void;
  theme: string;
}

const LinkItem = ({ title, url, status, target, onDelete, onEdit, theme }: LinkItemProps) => {
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-white/5';
  
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
    <div className={`flex items-center justify-between p-2 sm:p-3 ${bgColor} rounded-lg group`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <ExternalLink className={`w-4 h-4 sm:w-5 sm:h-5 ${textColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
        <a 
          href={url} 
          target={target}
          rel={target === '_blank' ? "noopener noreferrer" : undefined}
          className={`${textColor} text-sm sm:text-base hover:text-primary transition-colors`}
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
          onClick={onEdit}
          className={`${textColor} opacity-50 hover:text-blue-500 hover:bg-blue-500/10 hover:opacity-100`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className={`${textColor} opacity-50 hover:text-red-500 hover:bg-red-500/10 hover:opacity-100`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LinkItem;