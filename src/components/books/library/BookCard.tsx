import { Progress } from "@/components/ui/progress";
import { Book } from "@/hooks/books/useBooks";
import { BookOpen, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookCardMenu from "./BookCardMenu";

interface BookCardProps {
  book: Book;
  view: "grid" | "list";
}

export default function BookCard({ book, view }: BookCardProps) {
  const navigate = useNavigate();
  const pct = book.reading_progress?.percentage ?? 0;

  if (view === "list") {
    return (
      <button
        onClick={() => navigate(`/books/read/${book.id}`)}
        className="group flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left w-full"
      >
        <div className="w-12 h-16 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {book.cover_url ? (
            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
          ) : book.file_type === "epub" ? (
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          ) : (
            <FileText className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{book.title}</p>
          {book.author && (
            <p className="text-sm text-muted-foreground truncate">{book.author}</p>
          )}
        </div>
        <div className="w-24 shrink-0">
          <Progress value={pct * 100} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {Math.round(pct * 100)}%
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <BookCardMenu book={book} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/books/read/${book.id}`)}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
    >
      <div className="aspect-[2/3] bg-muted flex items-center justify-center overflow-hidden relative">
        {book.cover_url ? (
          <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
        ) : book.file_type === "epub" ? (
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        ) : (
          <FileText className="w-10 h-10 text-muted-foreground" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
          <BookCardMenu book={book} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p className="font-medium text-sm text-foreground truncate">{book.title}</p>
        {book.author && (
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        )}
        <Progress value={pct * 100} className="h-1" />
        <p className="text-xs text-muted-foreground">{Math.round(pct * 100)}%</p>
      </div>
    </button>
  );
}
