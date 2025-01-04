import { useState, useEffect, useRef } from "react";

interface LogoProps {
  url: string;
  isVisible: boolean;
}

const Logo = ({ url, isVisible }: LogoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url) return;
    
    // Only trigger reload if URL has changed
    if (url !== previousUrlRef.current) {
      setIsLoaded(false);
      setShouldRender(false);
      previousUrlRef.current = url;
      
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setIsLoaded(true);
        if (isVisible) {
          setShouldRender(true);
        }
      };
    }
  }, [url]);

  useEffect(() => {
    // Only update visibility if the image is loaded
    if (isLoaded) {
      setShouldRender(isVisible);
    }
  }, [isVisible, isLoaded]);

  return (
    <div className="relative bg-black/85 h-40 flex items-center justify-center">
      {url && (
        <img 
          src={url} 
          alt="Logo"
          className={`h-40 w-auto object-contain transition-opacity duration-300 ${shouldRender ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

export default Logo;