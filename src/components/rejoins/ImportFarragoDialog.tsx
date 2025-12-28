import { useState, useRef, useCallback } from 'react';
import { FileArchive, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { parseFarragoSet, isValidFarragoSet, FarragoSound } from '@/utils/farragoImport';
import { transcodeMany, TranscodeProgress } from '@/utils/audioTranscode';
import { toast } from 'sonner';

interface ImportFarragoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (sounds: { 
    title: string; 
    audioBlob: Blob; 
    extension?: string;
    color?: string;
    volume?: number;
    trim_start?: number;
    trim_end?: number | null;
    duration?: number | null;
  }[]) => Promise<unknown>;
  isLoading: boolean;
}

export function ImportFarragoDialog({
  open,
  onOpenChange,
  onImport,
  isLoading,
}: ImportFarragoDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [transcoding, setTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState<TranscodeProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setName, setSetName] = useState<string | null>(null);
  const [sounds, setSounds] = useState<FarragoSound[]>([]);
  const [selectedSounds, setSelectedSounds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setError(null);
    setSetName(null);
    setSounds([]);
    setSelectedSounds(new Set());
    setParsing(false);
    setTranscoding(false);
    setTranscodeProgress(null);
  }, []);

  const handleFile = async (file: File) => {
    if (!isValidFarragoSet(file)) {
      setError('Please select a valid .farragoset or .zip file');
      return;
    }

    setError(null);
    setParsing(true);

    try {
      const result = await parseFarragoSet(file);
      setSetName(result.name);
      setSounds(result.sounds);
      setSelectedSounds(new Set(result.sounds.map((_, i) => i)));
    } catch (e) {
      console.error('Error parsing Farrago set:', e);
      setError('Failed to parse the Farrago set file');
    } finally {
      setParsing(false);
    }
  };

  const progressText = transcodeProgress?.status === 'loading'
    ? 'Loading audio converter...'
    : `Converting audio (${transcodeProgress?.current || 0}/${transcodeProgress?.total || 0})`;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const toggleSound = (index: number) => {
    setSelectedSounds(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedSounds.size === sounds.length) {
      setSelectedSounds(new Set());
    } else {
      setSelectedSounds(new Set(sounds.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    const selectedList = sounds.filter((_, i) => selectedSounds.has(i));
    
    // Transcode all selected sounds to MP3 for reliable playback
    setTranscoding(true);
    setTranscodeProgress({ current: 0, total: selectedList.length, currentFile: '', failed: [], status: 'loading' });
    
    // Set a timeout for the entire transcode operation (30s for loading + 10s per file)
    const timeoutMs = 30000 + (selectedList.length * 10000);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    });
    
    try {
      const { results, failed } = await Promise.race([
        transcodeMany(
          selectedList.map(s => ({ title: s.title, blob: s.audioBlob })),
          setTranscodeProgress
        ),
        timeoutPromise,
      ]);
      
      if (failed.length > 0) {
        toast.warning(`${failed.length} file(s) couldn't be converted`, {
          description: failed.slice(0, 3).join(', ') + (failed.length > 3 ? '...' : ''),
        });
      }
      
      // Build final import list with transcoded MP3 blobs
      const soundsToImport = selectedList
        .map((s, idx) => {
          const transcoded = results.get(idx);
          if (!transcoded) return null;
          return {
            title: s.title,
            audioBlob: transcoded.blob,
            extension: 'mp3',
            color: s.color,
            volume: s.volume,
            trim_start: s.trimStart,
            trim_end: s.trimEnd,
            duration: transcoded.duration,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
      
      if (soundsToImport.length === 0) {
        setError('No sounds could be converted. The audio format may not be supported.');
        setTranscoding(false);
        return;
      }
      
      await onImport(soundsToImport);
      resetState();
      onOpenChange(false);
    } catch (e) {
      console.error('Transcode error:', e);
      if (e instanceof Error && e.message === 'TIMEOUT') {
        toast.error('Audio converter timed out', {
          description: 'Check your network connection or try with fewer files.',
        });
        setError('Audio converter timed out. Try again or use fewer files.');
      } else {
        toast.error('Audio converter failed to load', {
          description: 'Check network, ad-blocker, or browser security settings.',
        });
        setError('Failed to load audio converter. Check console for details.');
      }
      setTranscoding(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from Farrago</DialogTitle>
          <DialogDescription>
            Import sounds from a Farrago .farragoset file
          </DialogDescription>
        </DialogHeader>

        {transcoding && transcodeProgress ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {progressText}
              </p>
              {transcodeProgress?.status === 'transcoding' && (
                <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                  {transcodeProgress.currentFile}
                </p>
              )}
            </div>
            {transcodeProgress?.status === 'transcoding' && (
              <Progress 
                value={(transcodeProgress.current / transcodeProgress.total) * 100} 
                className="w-full max-w-xs"
              />
            )}
            {transcodeProgress.failed.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                {transcodeProgress.failed.length} failed
              </div>
            )}
          </div>
        ) : sounds.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'hover:bg-muted/50'
            }`}
          >
            {parsing ? (
              <div className="flex flex-col items-center text-muted-foreground">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2" />
                <span className="text-sm">Parsing Farrago set...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <FileArchive className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Drop .farragoset file here</span>
                <span className="text-xs mt-1">or click to browse</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".farragoset,.zip,application/zip,application/octet-stream"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{setName}</h4>
                <p className="text-sm text-muted-foreground">
                  {sounds.length} sounds found
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedSounds.size === sounds.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-60 border rounded-lg">
              <div className="p-2 space-y-1">
                {sounds.map((sound, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer text-foreground"
                    onClick={() => toggleSound(index)}
                  >
                    <Checkbox 
                      checked={selectedSounds.has(index)}
                      onCheckedChange={() => toggleSound(index)}
                    />
                    <div
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sound.color || '#3b82f6' }}
                    />
                    <span className="text-sm truncate flex-1">{sound.title}</span>
                    {selectedSounds.has(index) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={transcoding}
          >
            Cancel
          </Button>
          {sounds.length > 0 && !transcoding && (
            <Button 
              onClick={handleImport} 
              disabled={selectedSounds.size === 0 || isLoading || transcoding}
            >
              {isLoading
                ? 'Importing...' 
                : `Import ${selectedSounds.size} Rejoin${selectedSounds.size !== 1 ? 's' : ''}`
              }
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
