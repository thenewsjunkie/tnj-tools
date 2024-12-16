import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tv, Film, Utensils, Package, Maximize2, CropIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageFullscreen from "@/components/notes/ImageFullscreen";
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import type { Review } from "./types";

interface ReviewDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewDialog = ({ review, open, onOpenChange }: ReviewDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<CropType>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [savedCrop, setSavedCrop] = useState<CropType>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  if (!review) return null;

  const icons = {
    television: Tv,
    movie: Film,
    food: Utensils,
    product: Package,
  };

  const Icon = icons[review.type];
  const reviewDate = format(new Date(review.created_at), "EEEE, MMMM d");

  const toggleImageFit = () => {
    if (isCropping) return;
    setObjectFit(prev => prev === 'cover' ? 'contain' : 'cover');
  };

  const toggleCropping = () => {
    if (!isCropping) {
      setObjectFit('contain');
    }
    setIsCropping(!isCropping);
  };

  const handleCropComplete = (crop: CropType) => {
    setCrop(crop);
  };

  const saveCrop = () => {
    setSavedCrop(crop);
    setIsCropping(false);
    setObjectFit('cover');
  };

  const cancelCrop = () => {
    setCrop(savedCrop);
    setIsCropping(false);
    setObjectFit('cover');
  };

  const getCropStyle = () => {
    if (objectFit !== 'cover' || !savedCrop.width || !savedCrop.height) return {};
    
    const img = new Image();
    img.src = review.image_url || '';
    
    return {
      objectPosition: `${-savedCrop.x}px ${-savedCrop.y}px`,
      width: `${img.width}px`,
      height: `${img.height}px`
    };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="dark:bg-background/95 dark:backdrop-blur dark:supports-[backdrop-filter]:bg-background/60 bg-white max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-foreground" />
              <h2 className="text-xl font-semibold text-foreground">{review.title}</h2>
            </div>
            
            <div className="text-xl text-yellow-500">
              {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
            </div>

            {review.image_url && (
              <div className="relative">
                <div className={`relative ${isCropping ? 'max-h-[60vh] overflow-y-auto' : 'aspect-video overflow-hidden'}`}>
                  {isCropping ? (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={handleCropComplete}
                      aspect={16/9}
                    >
                      <img 
                        src={review.image_url} 
                        alt={review.title}
                        className="rounded-md w-full"
                      />
                    </ReactCrop>
                  ) : (
                    <img 
                      src={review.image_url} 
                      alt={review.title}
                      className={`rounded-md w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                      style={getCropStyle()}
                    />
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {isCropping ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white"
                        onClick={saveCrop}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white"
                        onClick={cancelCrop}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70"
                        onClick={toggleCropping}
                      >
                        <CropIcon className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70"
                        onClick={toggleImageFit}
                      >
                        <Maximize2 className="h-4 w-4 text-white" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <p className="text-foreground">{review.content}</p>
            
            <div className="text-sm text-muted-foreground">
              Review: {reviewDate}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFullscreen && review.image_url && (
        <ImageFullscreen
          url={review.image_url}
          title={review.title}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

export default ReviewDialog;