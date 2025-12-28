import { useEffect, useRef, useState, useCallback } from 'react';

interface WaveformEditorProps {
  audioUrl: string;
  file?: File | null;
  duration: number;
  trimStart: number;
  trimEnd: number | null;
  currentTime: number;
  isPlaying: boolean;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
  onSeek: (time: number) => void;
}

export function WaveformEditor({
  audioUrl,
  file,
  duration,
  trimStart,
  trimEnd,
  currentTime,
  isPlaying,
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
}: WaveformEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const animationRef = useRef<number | null>(null);

  const effectiveTrimEnd = trimEnd ?? duration;
  const HANDLE_WIDTH = 12;
  const CANVAS_HEIGHT = 80;

  // Load and decode audio to extract waveform data
  useEffect(() => {
    const loadWaveform = async () => {
      try {
        const audioContext = new AudioContext();
        let arrayBuffer: ArrayBuffer;

        if (file) {
          arrayBuffer = await file.arrayBuffer();
        } else {
          const response = await fetch(audioUrl);
          arrayBuffer = await response.arrayBuffer();
        }

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        
        // Downsample to ~200 points for visualization
        const samples = 200;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[start + j] || 0);
          }
          waveform.push(sum / blockSize);
        }

        // Normalize
        const max = Math.max(...waveform);
        const normalized = waveform.map(v => v / max);
        setWaveformData(normalized);

        audioContext.close();
      } catch (err) {
        console.error('Failed to load waveform:', err);
      }
    };

    if (audioUrl || file) {
      loadWaveform();
    }
  }, [audioUrl, file]);

  // Handle canvas resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Helper to resolve CSS variables to actual color values
  const getCssColor = (variable: string, opacity?: number): string => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable).trim();
    if (opacity !== undefined) {
      return `hsl(${value} / ${opacity})`;
    }
    return `hsl(${value})`;
  };

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0 || duration === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    // Resolve CSS colors
    const mutedColor = getCssColor('--muted');
    const bgColor = getCssColor('--background');
    const primaryColor = getCssColor('--primary');
    const mutedFgColor = getCssColor('--muted-foreground', 0.3);
    const destructiveColor = getCssColor('--destructive');

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate positions
    const startX = (trimStart / duration) * width;
    const endX = (effectiveTrimEnd / duration) * width;
    const playheadX = (currentTime / duration) * width;

    // Draw background (dimmed outside trim region)
    ctx.fillStyle = mutedColor;
    ctx.fillRect(0, 0, width, height);

    // Draw selected region background
    ctx.fillStyle = bgColor;
    ctx.fillRect(startX, 0, endX - startX, height);

    // Draw waveform bars
    waveformData.forEach((amplitude, i) => {
      const x = i * barWidth;
      const barHeight = amplitude * (height * 0.8);
      const y = (height - barHeight) / 2;

      // Different colors for inside/outside trim region
      const isInRegion = x >= startX && x <= endX;
      ctx.fillStyle = isInRegion ? primaryColor : mutedFgColor;
      
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });

    // Draw trim handles
    ctx.fillStyle = primaryColor;
    
    // Start handle
    ctx.fillRect(startX - 2, 0, 4, height);
    ctx.beginPath();
    ctx.moveTo(startX - HANDLE_WIDTH/2, 0);
    ctx.lineTo(startX + HANDLE_WIDTH/2, 0);
    ctx.lineTo(startX + HANDLE_WIDTH/2, 15);
    ctx.lineTo(startX, 20);
    ctx.lineTo(startX - HANDLE_WIDTH/2, 15);
    ctx.closePath();
    ctx.fill();

    // End handle
    ctx.fillRect(endX - 2, 0, 4, height);
    ctx.beginPath();
    ctx.moveTo(endX - HANDLE_WIDTH/2, 0);
    ctx.lineTo(endX + HANDLE_WIDTH/2, 0);
    ctx.lineTo(endX + HANDLE_WIDTH/2, 15);
    ctx.lineTo(endX, 20);
    ctx.lineTo(endX - HANDLE_WIDTH/2, 15);
    ctx.closePath();
    ctx.fill();

    // Draw playhead
    if (currentTime > 0) {
      ctx.fillStyle = destructiveColor;
      ctx.fillRect(playheadX - 1, 0, 2, height);
    }
  }, [waveformData, duration, trimStart, effectiveTrimEnd, currentTime]);

  // Animation loop for playhead
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  // Draw when data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform, canvasWidth]);

  const getTimeFromX = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(duration, (x / canvas.width) * duration));
  };

  const getHandleAtPosition = (clientX: number): 'start' | 'end' | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    const startX = (trimStart / duration) * canvas.width;
    const endX = (effectiveTrimEnd / duration) * canvas.width;
    
    if (Math.abs(x - startX) < HANDLE_WIDTH) return 'start';
    if (Math.abs(x - endX) < HANDLE_WIDTH) return 'end';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const handle = getHandleAtPosition(e.clientX);
    if (handle) {
      setIsDragging(handle);
    } else {
      // Click to seek
      const time = getTimeFromX(e.clientX);
      onSeek(time);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Update cursor
      const handle = getHandleAtPosition(e.clientX);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = handle ? 'ew-resize' : 'pointer';
      }
      return;
    }

    const time = getTimeFromX(e.clientX);
    
    if (isDragging === 'start') {
      // Don't let start go past end
      const maxStart = effectiveTrimEnd - 0.1;
      onTrimStartChange(Math.min(time, maxStart));
    } else if (isDragging === 'end') {
      // Don't let end go before start
      const minEnd = trimStart + 0.1;
      onTrimEndChange(Math.max(time, minEnd));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(null);
  };

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={CANVAS_HEIGHT}
        className="w-full rounded-md border cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
