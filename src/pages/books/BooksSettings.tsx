import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooks } from "@/hooks/books/useBooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function BooksSettings() {
  const navigate = useNavigate();
  const { data: books = [] } = useBooks();

  const exportLibrary = async () => {
    // Fetch all highlights, notes, bookmarks
    const [highlights, notes, bookmarks] = await Promise.all([
      supabase.from("book_highlights").select("*"),
      supabase.from("book_notes").select("*"),
      supabase.from("book_bookmarks").select("*"),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      books,
      highlights: highlights.data ?? [],
      notes: notes.data ?? [],
      bookmarks: bookmarks.data ?? [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baudible-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Library exported!" });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/books")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Baudible Settings</h1>
      </div>

      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-foreground">Export Data</h2>
        <p className="text-sm text-muted-foreground">
          Export your entire library metadata, highlights, notes, and bookmarks as JSON.
        </p>
        <Button onClick={exportLibrary}>
          <Download className="w-4 h-4 mr-2" />
          Export Library
        </Button>
      </div>

      <div className="border border-border rounded-xl p-6 bg-card space-y-2">
        <h2 className="font-semibold text-foreground">Library Stats</h2>
        <p className="text-sm text-muted-foreground">{books.length} books in library</p>
      </div>
    </div>
  );
}
