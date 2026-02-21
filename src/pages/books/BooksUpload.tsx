import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCreateBook } from "@/hooks/books/useBooks";
import FileDropzone from "@/components/books/upload/FileDropzone";
import MetadataEditor, { BookMetadata } from "@/components/books/upload/MetadataEditor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ePub from "epubjs";

export default function BooksUpload() {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<BookMetadata>({
    title: "",
    author: "",
    description: "",
    tags: "",
  });

  const extractEpubMetadata = useCallback(async (f: File) => {
    try {
      const arrayBuffer = await f.arrayBuffer();
      const book = ePub(arrayBuffer);
      await book.ready;

      const meta = book.packaging.metadata;
      const extracted: Partial<BookMetadata> = {};
      if (meta.title) extracted.title = meta.title;
      if (meta.creator) extracted.author = meta.creator;
      if (meta.description) extracted.description = meta.description;

      // Extract cover image
      try {
        const coverUrl = await book.coverUrl();
        if (coverUrl) {
          const resp = await fetch(coverUrl);
          const blob = await resp.blob();
          const coverF = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
          setCoverFile(coverF);
          setCoverPreview(URL.createObjectURL(coverF));
        }
      } catch {
        // No cover available, skip
      }

      book.destroy();
      return extracted;
    } catch (err) {
      console.warn("Failed to extract EPUB metadata:", err);
      return {};
    }
  }, []);

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "epub" && ext !== "pdf") {
      toast({ title: "Invalid file", description: "Only EPUB and PDF files are supported", variant: "destructive" });
      return;
    }
    setFile(f);
    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");

    if (ext === "epub") {
      const extracted = await extractEpubMetadata(f);
      setMetadata((m) => ({
        ...m,
        title: extracted.title || m.title || nameWithoutExt,
        author: extracted.author || m.author,
        description: extracted.description || m.description,
        tags: m.tags,
      }));
    } else {
      setMetadata((m) => ({ ...m, title: m.title || nameWithoutExt }));
    }
  }, [extractEpubMetadata]);

  const handleCoverUpload = useCallback((f: File) => {
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const filePath = `${crypto.randomUUID()}.${ext}`;

      // Upload book file
      const { error: uploadError } = await supabase.storage
        .from("book_files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Upload cover if available
      let coverUrl: string | undefined;
      if (coverFile) {
        const coverExt = coverFile.type.includes("png") ? "png" : "jpg";
        const coverPath = `${crypto.randomUUID()}.${coverExt}`;
        const { error: coverError } = await supabase.storage
          .from("book_covers")
          .upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: coverData } = supabase.storage
          .from("book_covers")
          .getPublicUrl(coverPath);
        coverUrl = coverData.publicUrl;
      }

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
        cover_url: coverUrl,
      });

      toast({ title: "Book added to library!" });
      navigate("/books");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [file, metadata, coverFile, createBook, navigate]);

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
          coverPreview={coverPreview}
          onCoverUpload={handleCoverUpload}
        />
      )}
    </div>
  );
}
