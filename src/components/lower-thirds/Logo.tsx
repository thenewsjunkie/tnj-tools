import { useState } from "react";

interface LogoProps {
  url: string;
  isVisible: boolean;
}

const Logo = ({ url, isVisible }: LogoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative bg-black/85 h-40 flex items-center justify-center">
      <img 
        src={url} 
        alt="Logo"
        className={`h-40 w-auto object-contain ${isVisible && isLoaded ? 'animate-fade-in' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default Logo;