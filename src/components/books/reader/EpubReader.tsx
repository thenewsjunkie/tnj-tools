import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import ePub, { Book, Rendition } from "epubjs";
import type { NavItem } from "epubjs/types/navigation";
import { useSaveProgress } from "@/hooks/books/useReadingProgress";
import type { ReaderSettings } from "./ReaderControls";

export interface EpubReaderHandle {
  navigateTo: (target: string) => void;
  getCurrentCfi: () => string | null;
  next: () => void;
  prev: () => void;
  getVisibleText: () => string | null;
  highlightWord: (charIndex: number, charLength: number) => void;
  clearHighlight: () => void;
}

interface EpubReaderProps {
  bookData: ArrayBuffer;
  bookId: string;
  initialLocation?: string | null;
  settings: ReaderSettings;
  onTocLoaded?: (toc: NavItem[]) => void;
  onProgressChange?: (percentage: number, chapterLabel: string) => void;
}

const themeStyles: Record<string, Record<string, string>> = {
  light: { body: { background: "#ffffff", color: "#1a1a1a" } } as any,
  dark: { body: { background: "#1a1a2e", color: "#e0e0e0" } } as any,
  sepia: { body: { background: "#f5e6c8", color: "#5b4636" } } as any,
};

const EpubReader = forwardRef<EpubReaderHandle, EpubReaderProps>(function EpubReader(
  { bookData, bookId, initialLocation, settings, onTocLoaded, onProgressChange },
  ref
) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const currentCfiRef = useRef<string | null>(null);
  const tocRef = useRef<NavItem[]>([]);
  const { saveProgress } = useSaveProgress(bookId);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    navigateTo: (target: string) => {
      renditionRef.current?.display(target);
    },
    getCurrentCfi: () => currentCfiRef.current,
    next: () => renditionRef.current?.next(),
    prev: () => renditionRef.current?.prev(),
    getVisibleText: () => {
      try {
        const contents = renditionRef.current?.getContents();
        if (contents && (contents as any).length > 0) {
          const doc = (contents as any)[0]?.document;
          return doc?.body?.innerText || null;
        }
      } catch {
        // ignore
      }
      return null;
    },
    highlightWord: (charIndex: number, charLength: number) => {
      try {
        const contents = renditionRef.current?.getContents();
        if (!contents || !(contents as any).length) return;
        const doc = (contents as any)[0]?.document as Document;
        if (!doc?.body) return;

        // Inject highlight CSS once
        if (!doc.getElementById("tts-highlight-style")) {
          const style = doc.createElement("style");
          style.id = "tts-highlight-style";
          style.textContent = `
            .tts-highlight {
              background: rgba(59, 130, 246, 0.2);
              box-shadow: 0 2px 0 0 rgba(59, 130, 246, 0.6);
              transition: all 0.1s ease;
              border-radius: 3px;
              padding: 1px 2px;
              margin: -1px -2px;
              color: inherit;
            }
          `;
          doc.head.appendChild(style);
        }

        // Remove previous highlight
        doc.querySelectorAll("mark.tts-highlight").forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(doc.createTextNode(el.textContent || ""), el);
            parent.normalize();
          }
        });

        if (charLength <= 0) return;

        // Walk text nodes to find the one containing charIndex
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        let offset = 0;
        let node: Text | null = null;
        while (walker.nextNode()) {
          const textNode = walker.currentNode as Text;
          const len = textNode.length;
          if (offset + len > charIndex) {
            node = textNode;
            break;
          }
          offset += len;
        }
        if (!node) return;

        const localStart = charIndex - offset;
        const localEnd = Math.min(localStart + charLength, node.length);

        const range = doc.createRange();
        range.setStart(node, localStart);
        range.setEnd(node, localEnd);

        const mark = doc.createElement("mark");
        mark.className = "tts-highlight";
        range.surroundContents(mark);
        mark.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch {
        // ignore highlight errors
      }
    },
    clearHighlight: () => {
      try {
        const contents = renditionRef.current?.getContents();
        if (!contents || !(contents as any).length) return;
        const doc = (contents as any)[0]?.document as Document;
        if (!doc?.body) return;
        doc.querySelectorAll("mark.tts-highlight").forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(doc.createTextNode(el.textContent || ""), el);
            parent.normalize();
          }
        });
      } catch {
        // ignore
      }
    },
  }));

  const goNext = useCallback(() => renditionRef.current?.next(), []);
  const goPrev = useCallback(() => renditionRef.current?.prev(), []);

  // Find current chapter label from TOC
  const findChapterLabel = useCallback((cfi: string): string => {
    // Simple approach: return the last TOC item whose href was passed
    const toc = tocRef.current;
    if (!toc.length || !bookRef.current) return "";
    // epubjs doesn't provide a direct chapter-from-cfi lookup,
    // so we use the navigation's toc array
    try {
      const spineItem = bookRef.current.spine.get(cfi);
      if (spineItem) {
        const match = toc.find((t) => {
          const tocHref = t.href.split("#")[0];
          const spineHref = spineItem.href?.split("#")[0];
          return tocHref === spineHref;
        });
        if (match) return match.label.trim();
      }
    } catch {
      // ignore
    }
    return "";
  }, []);

  // Initialize book
  useEffect(() => {
    if (!viewerRef.current) return;

    const book = ePub(bookData);
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
      tocRef.current = nav.toc;
      onTocLoaded?.(nav.toc);
    });

    // Apply initial theme + styles
    Object.entries(themeStyles).forEach(([name, styles]) => {
      rendition.themes.register(name, styles);
    });
    rendition.themes.select(settings.theme);
    rendition.themes.fontSize(`${settings.fontSize}px`);
    rendition.themes.font(settings.fontFamily);

    // Loading timeout
    const loadTimeout = setTimeout(() => {
      setError("Book took too long to load. The file may be corrupted or unsupported.");
    }, 15000);

    // Display at saved location or beginning
    const loc = initialLocation || undefined;
    rendition.display(loc)
      .then(() => {
        setIsReady(true);
        clearTimeout(loadTimeout);
      })
      .catch((err: any) => {
        console.error("epub display error:", err);
        clearTimeout(loadTimeout);
        setError("Failed to render book. The file may be corrupted.");
      });

    // Track location changes
    rendition.on("relocated", (location: any) => {
      const cfi = location.start?.cfi;
      const pct = location.start?.percentage ?? 0;
      if (cfi) {
        currentCfiRef.current = cfi;
        saveProgress(cfi, pct);
        const chapter = findChapterLabel(cfi);
        onProgressChange?.(Math.round(pct * 100), chapter);
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
      clearTimeout(loadTimeout);
      rendition.destroy();
      book.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookData]);

  // Update settings on the fly
  useEffect(() => {
    const r = renditionRef.current;
    if (!r || !isReady) return;
    r.themes.select(settings.theme);
    r.themes.fontSize(`${settings.fontSize}px`);
    r.themes.font(settings.fontFamily);
  }, [settings.theme, settings.fontSize, settings.fontFamily, isReady]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <p className="text-muted-foreground">Loading book…</p>
        </div>
      )}
      {/* Tap regions for mobile */}
      <div
        className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer"
        onClick={goNext}
      />
      <div ref={viewerRef} className="absolute inset-0" />
    </div>
  );
});

export default EpubReader;
