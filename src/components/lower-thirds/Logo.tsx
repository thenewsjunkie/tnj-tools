import { useState, useEffect } from "react";

interface LogoProps {
  url: string;
  isVisible: boolean;
}

const Logo = ({ url, isVisible }: LogoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setIsLoaded(true);
      // Only show the image after it's loaded AND isVisible is true
      if (isVisible) {
        setShouldRender(true);
      }
    };
  }, [url]);

  useEffect(() => {
    if (!isVisible) {
      setShouldRender(false);
    } else if (isLoaded) {
      setShouldRender(true);
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