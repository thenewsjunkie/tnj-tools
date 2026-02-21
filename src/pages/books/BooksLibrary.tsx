import { useState } from "react";
import { useBooks } from "@/hooks/books/useBooks";
import LibraryToolbar from "@/components/books/library/LibraryToolbar";
import BookCard from "@/components/books/library/BookCard";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BooksLibrary() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data: books = [], isLoading } = useBooks(search || undefined, sort);
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Baudible</h1>
      </div>

      <LibraryToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground">Your library is empty</p>
          <Button onClick={() => navigate("/books/upload")}>Upload your first book</Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((b) => (
            <BookCard key={b.id} book={b} view="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <BookCard key={b.id} book={b} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
