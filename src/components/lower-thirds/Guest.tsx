import { useState, useEffect } from "react";

interface GuestProps {
  imageUrl: string;
  type: string;
  isVisible: boolean;
}

const Guest = ({ imageUrl, type, isVisible }: GuestProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsLoaded(true);
  }, [imageUrl]);

  return (
    <div 
      className={`relative bg-black/85 overflow-hidden rounded-l-lg transition-opacity duration-300 ${isVisible && isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        width: '240px',
        height: '280px',
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
          <div className="absolute bottom-0 left-0 w-full bg-black/85 text-white py-3 text-xl font-bold uppercase text-center">
            {type}
          </div>
        </>
      )}
    </div>
  );
};

export default Guest;