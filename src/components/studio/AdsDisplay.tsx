import { useState, useEffect, useCallback } from "react";
import { useAdsConfig } from "./AdsManager";

const AdsDisplay = () => {
  const { data: config } = useAdsConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const ads = config?.ads ?? [];
  const interval = (config?.intervalSeconds ?? 10) * 1000;

  const advance = useCallback(() => {
    if (ads.length <= 1) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
      setFade(true);
    }, 300);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, ads.length]);

  // Reset index if ads change
  useEffect(() => {
    setCurrentIndex((prev) => (ads.length > 0 ? prev % ads.length : 0));
  }, [ads.length]);

  if (ads.length === 0) return null;

  const current = ads[currentIndex];

  return (
    <div className="w-full h-full min-h-[200px] bg-black flex items-center justify-center overflow-hidden">
      <img
        key={current.id}
        src={current.imageUrl}
        alt={current.label}
        className="max-w-full max-h-full object-contain transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      />
    </div>
  );
};

export default AdsDisplay;
