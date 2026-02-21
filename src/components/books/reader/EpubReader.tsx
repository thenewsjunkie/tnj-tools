import { useEffect, useRef, useCallback, useState } from "react";
import ePub, { Book, Rendition } from "epubjs";
import type { NavItem } from "epubjs/types/navigation";
import { useSaveProgress } from "@/hooks/books/useReadingProgress";
import type { ReaderSettings } from "./ReaderControls";

interface EpubReaderProps {
  fileUrl: string;
  bookId: string;
  initialLocation?: string | null;
  settings: ReaderSettings;
  onTocLoaded?: (toc: NavItem[]) => void;
}

const themeStyles: Record<string, Record<string, string>> = {
  light: { body: { background: "#ffffff", color: "#1a1a1a" } } as any,
  dark: { body: { background: "#1a1a2e", color: "#e0e0e0" } } as any,
  sepia: { body: { background: "#f5e6c8", color: "#5b4636" } } as any,
};

export default function EpubReader({
  fileUrl,
  bookId,
  initialLocation,
  settings,
  onTocLoaded,
}: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const { saveProgress } = useSaveProgress(bookId);
  const [isReady, setIsReady] = useState(false);

  // Initialize book
  useEffect(() => {
    if (!viewerRef.current) return;

    const book = ePub(fileUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: settings.mode === "scroll" ? "scrolled" : "paginated",
      spread: "none",
    });

    renditionRef.current = rendition;

    // Load TOC
    book.loaded.navigation.then((nav) => {
      onTocLoaded?.(nav.toc);
    });

    // Apply initial theme + styles
    Object.entries(themeStyles).forEach(([name, styles]) => {
      rendition.themes.register(name, styles);
    });
    rendition.themes.select(settings.theme);
    rendition.themes.fontSize(`${settings.fontSize}px`);
    rendition.themes.font(settings.fontFamily);

    // Display at saved location or beginning
    const loc = initialLocation || undefined;
    rendition.display(loc).then(() => setIsReady(true));

    // Track location changes
    rendition.on("relocated", (location: any) => {
      const cfi = location.start?.cfi;
      const pct = book.locations
        ? location.start?.percentage ?? 0
        : 0;
      if (cfi) {
        saveProgress(cfi, pct);
      }
    });

    // Generate locations for percentage tracking
    book.ready.then(() => {
      return book.locations.generate(1024);
    });

    // Keyboard nav
    rendition.on("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") rendition.next();
      if (e.key === "ArrowLeft") rendition.prev();
    });

    return () => {
      rendition.destroy();
      book.destroy();
    };
    // Only re-init on fileUrl change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  // Update settings on the fly
  useEffect(() => {
    const r = renditionRef.current;
    if (!r || !isReady) return;
    r.themes.select(settings.theme);
    r.themes.fontSize(`${settings.fontSize}px`);
    r.themes.font(settings.fontFamily);
  }, [settings.theme, settings.fontSize, settings.fontFamily, isReady]);

  const goNext = useCallback(() => renditionRef.current?.next(), []);
  const goPrev = useCallback(() => renditionRef.current?.prev(), []);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Tap regions for mobile */}
      <div
        className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer"
        onClick={goNext}
      />
      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}

export function navigateToLocation(rendition: Rendition | null, cfi: string) {
  rendition?.display(cfi);
}
