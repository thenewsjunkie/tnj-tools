import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useBook } from "@/hooks/books/useBooks";
import { useAddBookmark } from "@/hooks/books/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import ReaderTopBar from "@/components/books/reader/ReaderTopBar";
import EpubReader, { type EpubReaderHandle } from "@/components/books/reader/EpubReader";
import PdfReader from "@/components/books/reader/PdfReader";
import ReaderControls, { ReaderSettings, TTSSettings } from "@/components/books/reader/ReaderControls";
import ReaderBottomBar from "@/components/books/reader/ReaderBottomBar";
import TableOfContents from "@/components/books/reader/TableOfContents";
import BookmarksList from "@/components/books/reader/BookmarksList";
import HighlightsPanel from "@/components/books/reader/HighlightsPanel";
import { useReadAloud } from "@/hooks/books/useReadAloud";
import type { NavItem } from "epubjs/types/navigation";
import { toast } from "sonner";
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

const defaultTTSSettings: TTSSettings = {
  rate: 1,
  voiceURI: "",
};

export default function BookReader() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id);
  const addBookmark = useAddBookmark();
  const epubRef = useRef<EpubReaderHandle>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [bookData, setBookData] = useState<ArrayBuffer | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [ttsSettings, setTTSSettings] = useState<TTSSettings>(defaultTTSSettings);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [panel, setPanel] = useState<"toc" | "bookmarks" | "highlights" | "settings" | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [chapterLabel, setChapterLabel] = useState("");

  const getVisibleText = useCallback(() => {
    return epubRef.current?.getVisibleText() ?? null;
  }, []);

  const onPageFinished = useCallback(() => {
    epubRef.current?.next();
  }, []);

  const { isReading, isPaused, toggle: toggleReadAloud, stop: stopReadAloud } = useReadAloud({
    getVisibleText,
    onPageFinished,
    settings: ttsSettings,
  });

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
        if (book.file_type === "pdf") {
          setFileUrl(data.signedUrl);
          return;
        }
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

  // Stop reading when navigating away
  useEffect(() => {
    return () => stopReadAloud();
  }, [stopReadAloud]);

  const handleProgressChange = useCallback((pct: number, chapter: string) => {
    setPercentage(pct);
    setChapterLabel(chapter);
  }, []);

  const handleTocSelect = useCallback((href: string) => {
    stopReadAloud();
    epubRef.current?.navigateTo(href);
    setPanel(null);
  }, [stopReadAloud]);

  const handleBookmarkSelect = useCallback((location: string) => {
    stopReadAloud();
    epubRef.current?.navigateTo(location);
    setPanel(null);
  }, [stopReadAloud]);

  const handleHighlightSelect = useCallback((cfi: string) => {
    stopReadAloud();
    epubRef.current?.navigateTo(cfi);
    setPanel(null);
  }, [stopReadAloud]);

  const handleAddBookmark = useCallback(() => {
    if (!book?.id) return;
    const cfi = epubRef.current?.getCurrentCfi();
    if (!cfi) {
      toast.error("No position to bookmark");
      return;
    }
    addBookmark.mutate(
      { book_id: book.id, location: cfi, label: chapterLabel || "Bookmark" },
      { onSuccess: () => toast.success("Bookmark added") }
    );
  }, [book?.id, addBookmark, chapterLabel]);

  const handlePrev = useCallback(() => {
    epubRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    epubRef.current?.next();
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
        onToggleToc={isEpub ? () => setPanel(panel === "toc" ? null : "toc") : undefined}
        onToggleHighlights={isEpub ? () => setPanel(panel === "highlights" ? null : "highlights") : undefined}
        onAddBookmark={isEpub ? handleAddBookmark : undefined}
        onToggleBookmarks={() => setPanel(panel === "bookmarks" ? null : "bookmarks")}
        onToggleSettings={() => setPanel(panel === "settings" ? null : "settings")}
        isReading={isReading && !isPaused}
        onToggleReadAloud={isEpub ? toggleReadAloud : undefined}
      />

      {isEpub ? (
        <EpubReader
          ref={epubRef}
          bookData={bookData!}
          bookId={book.id}
          initialLocation={initialLocation}
          settings={settings}
          onTocLoaded={setToc}
          onProgressChange={handleProgressChange}
        />
      ) : (
        <PdfReader
          fileUrl={fileUrl}
          bookId={book.id}
          initialPage={initialLocation ? parseInt(initialLocation) : undefined}
        />
      )}

      {isEpub && (
        <ReaderBottomBar
          percentage={percentage}
          chapterLabel={chapterLabel}
          onPrev={handlePrev}
          onNext={handleNext}
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
            <BookmarksList bookId={book.id} onSelect={handleBookmarkSelect} />
          )}
          {panel === "highlights" && (
            <HighlightsPanel bookId={book.id} onSelectHighlight={handleHighlightSelect} />
          )}
          {panel === "settings" && (
            <ReaderControls
              settings={settings}
              onChange={setSettings}
              fileType={book.file_type}
              ttsSettings={isEpub ? ttsSettings : undefined}
              onTTSChange={isEpub ? setTTSSettings : undefined}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
