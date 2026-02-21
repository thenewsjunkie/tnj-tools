import { useState } from "react";
import { Book } from "@/hooks/books/useBooks";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteBook } from "@/hooks/books/useBooks";
import { toast } from "sonner";
import { MoreVertical, Image, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookCardMenuProps {
  book: Book;
}

export default function BookCardMenu({ book }: BookCardMenuProps) {
  const [fetching, setFetching] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();
  const deleteBook = useDeleteBook();

  const fetchCover = async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({ limit: "1" });
      if (book.title) params.set("title", book.title);
      if (book.author) params.set("author", book.author);

      const res = await fetch(`https://openlibrary.org/search.json?${params}`);
      const data = await res.json();
      const coverId = data.docs?.[0]?.cover_i;

      if (!coverId) {
        toast.error("No cover found for this book");
        return;
      }

      const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
      const { error } = await supabase
        .from("books")
        .update({ cover_url: coverUrl })
        .eq("id", book.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Cover fetched!");
    } catch (e) {
      toast.error("Failed to fetch cover");
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = () => {
    deleteBook.mutate(book.id, {
      onSuccess: () => toast.success("Book deleted"),
      onError: () => toast.error("Failed to delete book"),
    });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="p-1.5 rounded-md bg-background/80 hover:bg-background text-foreground shadow-sm backdrop-blur-sm transition-colors"
          >
            {fetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 bg-popover">
          {!book.cover_url && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); fetchCover(); }}>
              <Image className="w-4 h-4 mr-2" />
              Fetch Cover
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{book.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this book and all its reading progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
