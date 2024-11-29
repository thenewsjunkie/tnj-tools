import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BoxOfficeMovie {
  title: string;
  earnings: number;
}

interface BoxOfficeProps {
  movies: BoxOfficeMovie[];
}

const BoxOffice = ({ movies }: BoxOfficeProps) => {
  const [showAllMovies, setShowAllMovies] = useState(false);
  const visibleMovies = showAllMovies ? movies : movies.slice(0, 5);
  
  if (!movies || movies.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Box Office Numbers</h3>
      <div className="space-y-2 text-left">
        {visibleMovies.map((movie, index) => (
          <p key={index} className="leading-relaxed flex justify-between items-center">
            <span className="font-medium">{movie.title}</span>
            <span className="text-muted-foreground">
              ${movie.earnings.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
      {movies.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllMovies(!showAllMovies)}
          className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          {showAllMovies ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show More <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default BoxOffice;