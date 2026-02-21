import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBook } from "@/hooks/books/useBooks";
import { useAddBookmark } from "@/hooks/books/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import ReaderTopBar from "@/components/books/reader/ReaderTopBar";
import EpubReader from "@/components/books/reader/EpubReader";
import PdfReader from "@/components/books/reader/PdfReader";
import ReaderControls, { ReaderSettings } from "@/components/books/reader/ReaderControls";
import TableOfContents from "@/components/books/reader/TableOfContents";
import BookmarksList from "@/components/books/reader/BookmarksList";
import HighlightsPanel from "@/components/books/reader/HighlightsPanel";
import type { NavItem } from "epubjs/types/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const defaultSettings: ReaderSettings = {
  fontFamily: "serif",
  fontSize: 18,
  lineHeight: 1.6,
  theme: "dark",
  mode: "paginated",
};

export default function BookReader() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id);
  const addBookmark = useAddBookmark();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [bookData, setBookData] = useState<ArrayBuffer | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [panel, setPanel] = useState<"toc" | "bookmarks" | "highlights" | "settings" | null>(null);

  const [fileError, setFileError] = useState<string | null>(null);

  // Get signed URL and fetch book data
  useEffect(() => {
    if (!book?.file_url) return;
    supabase.storage
      .from("book_files")
      .createSignedUrl(book.file_url, 3600)
      .then(async ({ data, error }) => {
        if (error || !data?.signedUrl) {
          setFileError("Failed to load book file. Please try again.");
          return;
        }
        // For PDFs, just use the signed URL directly
        if (book.file_type === "pdf") {
          setFileUrl(data.signedUrl);
          return;
        }
        // For EPUBs, fetch as ArrayBuffer to avoid CORS/auth issues with epub.js
        try {
          const response = await fetch(data.signedUrl);
          if (!response.ok) throw new Error("Failed to fetch book file");
          const buffer = await response.arrayBuffer();
          setBookData(buffer);
        } catch {
          setFileError("Failed to download book file.");
        }
      })
      .catch(() => setFileError("Failed to load book file."));
  }, [book?.file_url, book?.file_type]);

  const handleTocSelect = useCallback((href: string) => {
    // For EPUB, epubjs rendition.display(href) is called
    // We store the href and pass it - but since EpubReader manages its own rendition,
    // we'd need a ref-based approach. For now, close panel.
    setPanel(null);
  }, []);

  if (isLoading || !book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    );
  }

  const isEpub = book.file_type === "epub";
  if (isEpub ? !bookData : !fileUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{fileError || "Preparing file..."}</p>
      </div>
    );
  }

  const initialLocation = book.reading_progress?.location;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ReaderTopBar
        title={book.title}
        onToggleBookmarks={() => setPanel(panel === "bookmarks" ? null : "bookmarks")}
        onToggleSettings={() => setPanel(panel === "settings" ? null : "settings")}
      />

      {book.file_type === "epub" ? (
        <EpubReader
          bookData={bookData!}
          bookId={book.id}
          initialLocation={initialLocation}
          settings={settings}
          onTocLoaded={setToc}
        />
      ) : (
        <PdfReader
          fileUrl={fileUrl}
          bookId={book.id}
          initialPage={initialLocation ? parseInt(initialLocation) : undefined}
        />
      )}

      {/* Side panels */}
      <Sheet open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>
              {panel === "toc" ? "Table of Contents" :
               panel === "bookmarks" ? "Bookmarks" :
               panel === "highlights" ? "Highlights & Notes" :
               "Settings"}
            </SheetTitle>
          </SheetHeader>
          {panel === "toc" && (
            <TableOfContents toc={toc} onSelect={handleTocSelect} />
          )}
          {panel === "bookmarks" && (
            <BookmarksList bookId={book.id} onSelect={() => setPanel(null)} />
          )}
          {panel === "highlights" && (
            <HighlightsPanel bookId={book.id} />
          )}
          {panel === "settings" && (
            <ReaderControls
              settings={settings}
              onChange={setSettings}
              fileType={book.file_type}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
