import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
}

export default function FileDropzone({ onFile, accept = ".epub,.pdf" }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = () => {
          if (input.files?.[0]) onFile(input.files[0]);
        };
        input.click();
      }}
    >
      <Upload className="w-10 h-10 text-muted-foreground" />
      <div className="text-center">
        <p className="font-medium text-foreground">Drop an EPUB or PDF here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
      </div>
    </div>
  );
}
