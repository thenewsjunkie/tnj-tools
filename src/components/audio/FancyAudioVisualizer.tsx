import React, { useEffect, useRef } from "react";

interface FancyAudioVisualizerProps {
  level: number; // 0..1
  active?: boolean;
  height?: number; // CSS px height
  className?: string;
  bars?: number; // number of bars per side (total will be mirrored)
}

// Smoothly approach target value
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const FancyAudioVisualizer: React.FC<FancyAudioVisualizerProps> = ({
  level,
  active = false,
  height = 144,
  className = "",
  bars = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const internalLevelRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  // Resolve theme colors from CSS variables (HSL tokens)
  const resolveHsl = (variableName: string, fallback: string): string => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    return raw ? `hsl(${raw})` : fallback;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Colors from theme tokens
    const c1 = resolveHsl("--primary", "hsl(220 90% 55%)");
    const c2 = resolveHsl("--accent", c1);
    const c3 = resolveHsl("--secondary", c2);

    const draw = (ts: number) => {
      const dt = Math.min(32, ts - (lastTsRef.current || ts));
      lastTsRef.current = ts;

      // Smooth level towards target
      const target = Math.max(0, Math.min(1, level || 0));
      const smoothing = active ? 0.2 : 0.08;
      internalLevelRef.current = lerp(internalLevelRef.current, target, smoothing);

      // Idle pulse when inactive
      const time = ts * 0.001;
      const idle = 0.06 + 0.04 * Math.sin(time * 1.2);
      const displayLevel = active ? internalLevelRef.current : idle;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient line for subtle base
      const midY = canvas.height / 2;
      const w = canvas.width;
      const h = canvas.height;

      // Create a horizontal gradient
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c3);

      // Draw mirrored bars
      const totalBars = bars * 2 + 1; // center + mirrored pairs
      const gap = Math.max(1, Math.floor(w / (totalBars * 2))); // responsive spacing
      const barWidth = Math.max(2, Math.floor((w - gap * (totalBars - 1)) / totalBars));
      const maxBarHeight = h * 0.9;

      ctx.save();
      ctx.translate(0, midY);
      ctx.fillStyle = grad;
      ctx.shadowColor = c2;
      ctx.shadowBlur = 18 * dpr;

      // Center-emphasis envelope
      for (let i = -bars; i <= bars; i++) {
        const xIndex = i + bars; // 0..totalBars-1
        const x = xIndex * (barWidth + gap);
        const centerNorm = 1 - Math.abs(i) / (bars + 0.001); // 1 at center, 0 at edges
        // Shape: emphasize center, soften edges
        const envelope = Math.pow(centerNorm, 1.5);

        // Subtle per-bar shimmer
        const shimmer = 0.85 + 0.15 * Math.sin(time * 2.0 + i * 0.45);

        const barH = Math.max(2 * dpr, maxBarHeight * displayLevel * envelope * shimmer);
        const y = -barH / 2;

        // Rounded rect bar
        const radius = Math.min(6 * dpr, barWidth / 2);
        const bw = barWidth;
        const bh = barH;
        ctx.beginPath();
        // Draw a rounded rectangle by hand for performance consistency
        const rx = x;
        const ry = y;
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + bw - radius, ry);
        ctx.quadraticCurveTo(rx + bw, ry, rx + bw, ry + radius);
        ctx.lineTo(rx + bw, ry + bh - radius);
        ctx.quadraticCurveTo(rx + bw, ry + bh, rx + bw - radius, ry + bh);
        ctx.lineTo(rx + radius, ry + bh);
        ctx.quadraticCurveTo(rx, ry + bh, rx, ry + bh - radius);
        ctx.lineTo(rx, ry + radius);
        ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [level, active, height, bars]);

  return (
    <div
      className={[
        "w-full rounded-xl overflow-hidden bg-muted/30 ring-1 ring-border",
        className,
      ].join(" ")}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default FancyAudioVisualizer;
