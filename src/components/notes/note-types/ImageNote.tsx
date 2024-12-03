import React from "react";

interface ImageNoteProps {
  url: string;
  title?: string;
  onImageClick: () => void;
}

const ImageNote = ({ url, title, onImageClick }: ImageNoteProps) => {
  return (
    <div 
      className="relative aspect-video cursor-pointer"
      onClick={onImageClick}
    >
      <img 
        src={url} 
        alt={title || 'Show note image'} 
        className="rounded-md object-cover w-full h-full"
      />
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
          <p className="text-white text-sm truncate">{title}</p>
        </div>
      )}
    </div>
  );
};

export default ImageNote;