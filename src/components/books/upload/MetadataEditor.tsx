import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export interface BookMetadata {
  title: string;
  author: string;
  description: string;
  tags: string;
}

interface MetadataEditorProps {
  metadata: BookMetadata;
  onChange: (m: BookMetadata) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  fileName: string;
  coverPreview?: string | null;
  onCoverUpload?: (file: File) => void;
}

export default function MetadataEditor({
  metadata,
  onChange,
  onSubmit,
  isSubmitting,
  fileName,
  coverPreview,
  onCoverUpload,
}: MetadataEditorProps) {
  return (
    <div className="space-y-4 border border-border rounded-xl p-6 bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>File:</span>
        <span className="font-mono">{fileName}</span>
      </div>

      {/* Cover preview + upload */}
      <div className="space-y-2">
        <Label>Cover</Label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-36 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = () => {
                if (input.files?.[0] && onCoverUpload) onCoverUpload(input.files[0]);
              };
              input.click();
            }}
          >
            {coverPreview ? "Replace cover" : "Upload cover"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={metadata.title}
          onChange={(e) => onChange({ ...metadata, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Author</Label>
        <Input
          value={metadata.author}
          onChange={(e) => onChange({ ...metadata, author: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={metadata.description}
          onChange={(e) => onChange({ ...metadata, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags (comma-separated)</Label>
        <Input
          value={metadata.tags}
          onChange={(e) => onChange({ ...metadata, tags: e.target.value })}
          placeholder="fiction, sci-fi, ..."
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !metadata.title}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Add to Library"}
      </Button>
    </div>
  );
}
