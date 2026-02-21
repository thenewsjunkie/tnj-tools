import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCreateBook } from "@/hooks/books/useBooks";
import FileDropzone from "@/components/books/upload/FileDropzone";
import MetadataEditor, { BookMetadata } from "@/components/books/upload/MetadataEditor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function BooksUpload() {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState<BookMetadata>({
    title: "",
    author: "",
    description: "",
    tags: "",
  });

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "epub" && ext !== "pdf") {
      toast({ title: "Invalid file", description: "Only EPUB and PDF files are supported", variant: "destructive" });
      return;
    }
    setFile(f);
    // Default title from filename
    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
    setMetadata((m) => ({ ...m, title: m.title || nameWithoutExt }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const filePath = `${crypto.randomUUID()}.${ext}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("book_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("book_files")
        .getPublicUrl(filePath);

      // Since bucket is private, we'll use the path and construct signed URLs at read time
      await createBook.mutateAsync({
        title: metadata.title,
        author: metadata.author || undefined,
        description: metadata.description || undefined,
        tags: metadata.tags
          ? metadata.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        file_type: ext,
        file_url: filePath,
        file_size: file.size,
      });

      toast({ title: "Book added to library!" });
      navigate("/books");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [file, metadata, createBook, navigate]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/books")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Upload Book</h1>
      </div>

      {!file ? (
        <FileDropzone onFile={handleFile} />
      ) : (
        <MetadataEditor
          metadata={metadata}
          onChange={setMetadata}
          onSubmit={handleSubmit}
          isSubmitting={uploading}
          fileName={file.name}
        />
      )}
    </div>
  );
}
