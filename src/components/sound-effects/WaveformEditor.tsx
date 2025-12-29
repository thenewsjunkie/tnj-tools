import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface WaveformEditorProps {
  audioUrl: string;
  file?: File | null;
  duration: number;
  trimStart: number;
  trimEnd: number | null;
  currentTime: number;
  isPlaying: boolean;
  volume?: number;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
  onSeek: (time: number) => void;
}

const ZOOM_LEVELS = [1, 2, 4, 8, 16];
const HANDLE_WIDTH = 12;
const CANVAS_HEIGHT = 80;
const MINIMAP_HEIGHT = 24;

export function WaveformEditor({
  audioUrl,
  file,
  duration,
  trimStart,
  trimEnd,
  currentTime,
  isPlaying,
  volume = 1,
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
}: WaveformEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panStartView, setPanStartView] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewStart, setViewStart] = useState(0);

  const effectiveTrimEnd = trimEnd ?? duration;
  const viewDuration = duration / zoomLevel;
  const viewEnd = Math.min(viewStart + viewDuration, duration);

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

  // Convert time to X position in zoomed view
  const timeToX = useCallback((time: number, width: number): number => {
    return ((time - viewStart) / viewDuration) * width;
  }, [viewStart, viewDuration]);

  // Convert X position to time in zoomed view
  const xToTime = useCallback((x: number, width: number): number => {
    return viewStart + (x / width) * viewDuration;
  }, [viewStart, viewDuration]);

  // Draw main waveform (zoomed)
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0 || duration === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Resolve CSS colors
    const mutedColor = getCssColor('--muted');
    const bgColor = getCssColor('--background');
    const primaryColor = getCssColor('--primary');
    const mutedFgColor = getCssColor('--muted-foreground', 0.3);
    const destructiveColor = getCssColor('--destructive');
    const warningColor = getCssColor('--chart-4'); // Orange/yellow for clipping

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate positions in zoomed view
    const startX = timeToX(trimStart, width);
    const endX = timeToX(effectiveTrimEnd, width);
    const playheadX = timeToX(currentTime, width);

    // Draw background (dimmed outside trim region)
    ctx.fillStyle = mutedColor;
    ctx.fillRect(0, 0, width, height);

    // Draw selected region background (clipped to visible area)
    ctx.fillStyle = bgColor;
    const visibleStartX = Math.max(0, startX);
    const visibleEndX = Math.min(width, endX);
    if (visibleEndX > visibleStartX) {
      ctx.fillRect(visibleStartX, 0, visibleEndX - visibleStartX, height);
    }

    // Calculate the "ceiling" line position (100% volume level)
    const maxNormalHeight = height * 0.8;
    const ceilingY = (height - maxNormalHeight) / 2;

    // Draw ceiling line if volume > 1
    if (volume > 1) {
      ctx.strokeStyle = getCssColor('--destructive', 0.4);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, ceilingY);
      ctx.lineTo(width, ceilingY);
      ctx.moveTo(0, height - ceilingY);
      ctx.lineTo(width, height - ceilingY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waveform bars (only visible ones)
    const barWidth = (width / waveformData.length) * zoomLevel;
    waveformData.forEach((amplitude, i) => {
      const barTime = (i / waveformData.length) * duration;
      const x = timeToX(barTime, width);
      
      // Skip bars outside visible area
      if (x + barWidth < 0 || x > width) return;
      
      // Scale amplitude by volume
      const scaledAmplitude = amplitude * volume;
      const barHeight = scaledAmplitude * (height * 0.8);
      const y = (height - barHeight) / 2;

      // Different colors for inside/outside trim region
      const isInRegion = barTime >= trimStart && barTime <= effectiveTrimEnd;
      
      // Check if this bar exceeds the ceiling (clipping)
      const isClipping = scaledAmplitude > 1 && isInRegion;
      
      if (isClipping) {
        // Draw the normal part (below ceiling)
        const normalHeight = maxNormalHeight;
        const normalY = (height - normalHeight) / 2;
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x, normalY, Math.max(barWidth - 1, 1), normalHeight);
        
        // Draw the clipping part (above ceiling) in warning/destructive color
        const clippingHeight = barHeight - normalHeight;
        if (clippingHeight > 0) {
          // Top clipping
          ctx.fillStyle = warningColor;
          ctx.fillRect(x, y, Math.max(barWidth - 1, 1), clippingHeight / 2);
          // Bottom clipping
          ctx.fillRect(x, height - y - clippingHeight / 2, Math.max(barWidth - 1, 1), clippingHeight / 2);
        }
      } else {
        ctx.fillStyle = isInRegion ? primaryColor : mutedFgColor;
        ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
      }
    });

    // Draw trim handles (only if visible)
    ctx.fillStyle = primaryColor;
    
    // Start handle
    if (startX >= -HANDLE_WIDTH && startX <= width + HANDLE_WIDTH) {
      ctx.fillRect(startX - 2, 0, 4, height);
      ctx.beginPath();
      ctx.moveTo(startX - HANDLE_WIDTH/2, 0);
      ctx.lineTo(startX + HANDLE_WIDTH/2, 0);
      ctx.lineTo(startX + HANDLE_WIDTH/2, 15);
      ctx.lineTo(startX, 20);
      ctx.lineTo(startX - HANDLE_WIDTH/2, 15);
      ctx.closePath();
      ctx.fill();
    }

    // End handle
    if (endX >= -HANDLE_WIDTH && endX <= width + HANDLE_WIDTH) {
      ctx.fillRect(endX - 2, 0, 4, height);
      ctx.beginPath();
      ctx.moveTo(endX - HANDLE_WIDTH/2, 0);
      ctx.lineTo(endX + HANDLE_WIDTH/2, 0);
      ctx.lineTo(endX + HANDLE_WIDTH/2, 15);
      ctx.lineTo(endX, 20);
      ctx.lineTo(endX - HANDLE_WIDTH/2, 15);
      ctx.closePath();
      ctx.fill();
    }

    // Draw playhead
    if (playheadX >= 0 && playheadX <= width) {
      ctx.fillStyle = destructiveColor;
      ctx.fillRect(playheadX - 1, 0, 2, height);
    }
  }, [waveformData, duration, trimStart, effectiveTrimEnd, currentTime, timeToX, zoomLevel, volume]);

  // Draw minimap
  const drawMinimap = useCallback(() => {
    const canvas = minimapRef.current;
    if (!canvas || waveformData.length === 0 || duration === 0 || zoomLevel === 1) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    // Resolve CSS colors
    const mutedColor = getCssColor('--muted');
    const primaryColor = getCssColor('--primary');
    const borderColor = getCssColor('--border');

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = mutedColor;
    ctx.fillRect(0, 0, width, height);

    // Draw waveform bars
    waveformData.forEach((amplitude, i) => {
      const x = i * barWidth;
      const barHeight = amplitude * (height * 0.7);
      const y = (height - barHeight) / 2;
      ctx.fillStyle = getCssColor('--muted-foreground', 0.5);
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });

    // Draw viewport indicator
    const viewportStartX = (viewStart / duration) * width;
    const viewportWidth = (viewDuration / duration) * width;
    
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportStartX, 0, viewportWidth, height);
    
    ctx.fillStyle = getCssColor('--primary', 0.1);
    ctx.fillRect(viewportStartX, 0, viewportWidth, height);

    // Draw trim region indicator
    const trimStartX = (trimStart / duration) * width;
    const trimEndX = (effectiveTrimEnd / duration) * width;
    ctx.fillStyle = getCssColor('--primary', 0.3);
    ctx.fillRect(trimStartX, 0, trimEndX - trimStartX, height);
  }, [waveformData, duration, viewStart, viewDuration, zoomLevel, trimStart, effectiveTrimEnd]);

  // Animation loop for playhead
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        drawWaveform();
        drawMinimap();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      drawWaveform();
      drawMinimap();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform, drawMinimap]);

  // Draw when data changes
  useEffect(() => {
    drawWaveform();
    drawMinimap();
  }, [drawWaveform, drawMinimap, canvasWidth]);

  const getTimeFromX = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const time = xToTime(x, canvas.width);
    return Math.max(0, Math.min(duration, time));
  };

  const getHandleAtPosition = (clientX: number): 'start' | 'end' | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    const startX = timeToX(trimStart, canvas.width);
    const endX = timeToX(effectiveTrimEnd, canvas.width);
    
    if (Math.abs(x - startX) < HANDLE_WIDTH) return 'start';
    if (Math.abs(x - endX) < HANDLE_WIDTH) return 'end';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const handle = getHandleAtPosition(e.clientX);
    if (handle) {
      setIsDragging(handle);
    } else if (e.shiftKey || e.button === 1) {
      // Shift+click or middle mouse to pan
      setIsPanning(true);
      setPanStartX(e.clientX);
      setPanStartView(viewStart);
    } else {
      // Click to seek
      const time = getTimeFromX(e.clientX);
      onSeek(time);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const deltaX = e.clientX - panStartX;
      const deltaTime = -(deltaX / canvas.width) * viewDuration;
      const newViewStart = Math.max(0, Math.min(duration - viewDuration, panStartView + deltaTime));
      setViewStart(newViewStart);
      return;
    }

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
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(null);
    setIsPanning(false);
  };

  // Handle scroll wheel for panning when zoomed
  const handleWheel = (e: React.WheelEvent) => {
    if (zoomLevel === 1) return;
    e.preventDefault();
    
    const deltaTime = (e.deltaX || e.deltaY) * 0.01 * viewDuration;
    const newViewStart = Math.max(0, Math.min(duration - viewDuration, viewStart + deltaTime));
    setViewStart(newViewStart);
  };

  // Zoom controls
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      const newZoom = ZOOM_LEVELS[currentIndex + 1];
      const newViewDuration = duration / newZoom;
      // Center on current view center
      const currentCenter = viewStart + viewDuration / 2;
      const newViewStart = Math.max(0, Math.min(duration - newViewDuration, currentCenter - newViewDuration / 2));
      setZoomLevel(newZoom);
      setViewStart(newViewStart);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      const newZoom = ZOOM_LEVELS[currentIndex - 1];
      const newViewDuration = duration / newZoom;
      const currentCenter = viewStart + viewDuration / 2;
      const newViewStart = Math.max(0, Math.min(duration - newViewDuration, currentCenter - newViewDuration / 2));
      setZoomLevel(newZoom);
      setViewStart(newViewStart);
    }
  };

  const handleFitSelection = () => {
    const selectionDuration = effectiveTrimEnd - trimStart;
    // Find zoom level that fits the selection
    const targetZoom = Math.min(16, Math.max(1, duration / (selectionDuration * 1.2)));
    const nearestZoom = ZOOM_LEVELS.reduce((prev, curr) => 
      Math.abs(curr - targetZoom) < Math.abs(prev - targetZoom) ? curr : prev
    );
    setZoomLevel(nearestZoom);
    // Center on selection
    const selectionCenter = trimStart + selectionDuration / 2;
    const newViewDuration = duration / nearestZoom;
    setViewStart(Math.max(0, Math.min(duration - newViewDuration, selectionCenter - newViewDuration / 2)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setViewStart(0);
  };

  // Handle minimap click to navigate
  const handleMinimapClick = (e: React.MouseEvent) => {
    const canvas = minimapRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;
    // Center the view on clicked position
    const newViewStart = Math.max(0, Math.min(duration - viewDuration, clickTime - viewDuration / 2));
    setViewStart(newViewStart);
  };

  return (
    <div ref={containerRef} className="w-full space-y-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoomLevel === 1}
          className="h-7 w-7 p-0"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          className="h-7 w-7 p-0"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[32px]">{zoomLevel}x</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFitSelection}
          className="h-7 px-2 text-xs"
        >
          <Maximize2 className="h-3.5 w-3.5 mr-1" />
          Fit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={zoomLevel === 1}
          className="h-7 w-7 p-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        {zoomLevel > 1 && (
          <span className="text-xs text-muted-foreground ml-auto">
            Shift+drag or scroll to pan
          </span>
        )}
      </div>

      {/* Minimap (only visible when zoomed) */}
      {zoomLevel > 1 && (
        <canvas
          ref={minimapRef}
          width={canvasWidth}
          height={MINIMAP_HEIGHT}
          className="w-full rounded-sm border cursor-pointer"
          onClick={handleMinimapClick}
        />
      )}

      {/* Main waveform canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={CANVAS_HEIGHT}
        className="w-full rounded-md border cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(viewStart)}</span>
        <span>{formatTime(viewEnd)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
