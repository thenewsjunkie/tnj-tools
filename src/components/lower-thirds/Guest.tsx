import { useState, useEffect } from "react";

interface GuestProps {
  imageUrl: string;
  type: string;
  isVisible: boolean;
}

const Guest = ({ imageUrl, type, isVisible }: GuestProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setIsLoaded(true);
      if (isVisible) {
        setShouldRender(true);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!isVisible) {
      setShouldRender(false);
    } else if (isLoaded) {
      setShouldRender(true);
    }
  }, [isVisible, isLoaded]);

  return (
    <div 
      className={`absolute right-0 top-0 bottom-0 bg-black/85 overflow-hidden rounded-r-lg transition-opacity duration-300 ${shouldRender ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        width: '240px',
      }}
    >
      {imageUrl && (
        <>
          <img 
            src={imageUrl} 
            alt="Guest"
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center 20%'
            }}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-[#1A1F2C] to-[#4A3B8C] text-white py-3 text-xl font-bold uppercase text-center">
            {type}
          </div>
        </>
      )}
    </div>
  );
};

export default Guest;