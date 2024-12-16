import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

interface ReviewImageCarouselProps {
  images: string[];
  title: string;
  onToggleImageFit?: () => void;
  objectFit?: 'contain' | 'cover';
  showControls?: boolean;
}

const ReviewImageCarousel = ({ 
  images, 
  title, 
  onToggleImageFit, 
  objectFit = 'contain',
  showControls = true 
}: ReviewImageCarouselProps) => {
  if (!images?.length) return null;

  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={image} 
                  alt={`${title} - Image ${index + 1}`}
                  className={`rounded-md w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
      {onToggleImageFit && (
        <div className="absolute top-2 right-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 hover:bg-black/70"
            onClick={onToggleImageFit}
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewImageCarousel;