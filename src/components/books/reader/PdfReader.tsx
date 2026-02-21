import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useSaveProgress } from "@/hooks/books/useReadingProgress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfReaderProps {
  fileUrl: string;
  bookId: string;
  initialPage?: number;
}

export default function PdfReader({ fileUrl, bookId, initialPage }: PdfReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(initialPage || 1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const { saveProgress } = useSaveProgress(bookId);

  useEffect(() => {
    pdfjsLib.getDocument(fileUrl).promise.then((doc) => {
      setPdf(doc);
      setNumPages(doc.numPages);
      if (initialPage) setPage(initialPage);
    });
  }, [fileUrl, initialPage]);

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;
    const p = await pdf.getPage(page);
    const viewport = p.getViewport({ scale });
    const canvas = canvasRef.current;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const ctx = canvas.getContext("2d")!;
    await p.render({ canvasContext: ctx, viewport, canvas: canvas } as any).promise;

    saveProgress(String(page), page / numPages);
  }, [pdf, page, scale, numPages, saveProgress]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ")
        setPage((p) => Math.min(p + 1, numPages));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [numPages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-center gap-2 p-2 border-b border-border shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          {page} / {numPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage((p) => Math.min(p + 1, numPages))}
          disabled={page >= numPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="ml-4 flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.min(s + 0.2, 3))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/30">
        <canvas ref={canvasRef} className="max-w-full shadow-lg" />
      </div>
    </div>
  );
}
