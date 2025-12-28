import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLOR_PRESETS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

interface AddSoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { title: string; file: File; color: string }) => Promise<unknown>;
  isLoading: boolean;
}

export function AddSoundDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddSoundDialogProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState('#3b82f6');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        // Auto-fill title from filename
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    await onAdd({ title, file, color });
    
    // Reset form
    setTitle('');
    setFile(null);
    setColor('#3b82f6');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Sound Effect</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file">Audio File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {file ? (
                <span className="text-sm text-muted-foreground">{file.name}</span>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-sm">Click to upload MP3</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sound effect name"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === preset ? 'ring-2 ring-ring ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 rounded-full cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || !title || isLoading}>
              {isLoading ? 'Adding...' : 'Add Sound'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
