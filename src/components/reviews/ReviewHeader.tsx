import { Link } from "react-router-dom";
import { ExternalLink, Eye } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import AddReviewDialog from "./AddReviewDialog";

interface ReviewHeaderProps {
  showViewAllLink?: boolean;
  onReviewAdded: () => void;
}

const ReviewHeader = ({ showViewAllLink = false, onReviewAdded }: ReviewHeaderProps) => {
  return (
    <CardTitle className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        Reviews
        {showViewAllLink && (
          <Link 
            to="/reviews" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View All
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/reviews/stream" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Eye className="h-4 w-4" />
          Stream View
        </Link>
        <AddReviewDialog onReviewAdded={onReviewAdded} />
      </div>
    </CardTitle>
  );
};

export default ReviewHeader;