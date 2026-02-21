import { useState } from "react";
import { Book } from "@/hooks/books/useBooks";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteBook } from "@/hooks/books/useBooks";
import { toast } from "sonner";
import { MoreVertical, Image, Trash2, Loader2, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookCardMenuProps {
  book: Book;
}

export default function BookCardMenu({ book }: BookCardMenuProps) {
  const [fetching, setFetching] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const queryClient = useQueryClient();
  const deleteBook = useDeleteBook();

  const openEdit = () => {
    setTitle(book.title);
    setAuthor(book.author ?? "");
    setDescription(book.description ?? "");
    setTags(book.tags?.join(", ") ?? "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("books")
        .update({
          title,
          author: author || null,
          description: description || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        })
        .eq("id", book.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update book");
    } finally {
      setSaving(false);
    }
  };

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
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(); }}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Book Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input id="edit-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fiction, sci-fi, favorite" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
