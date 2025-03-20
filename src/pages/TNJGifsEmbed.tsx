
import GifGallery from "@/components/gifs/GifGallery";
import GifUploadForm from "@/components/gifs/GifUploadForm";
import { useState } from "react";

export default function TNJGifsEmbed() {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');

  return (
    <div className="w-full h-full p-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">TNJ GIFs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and share animated GIFs
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md border">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 text-sm rounded-l-md ${
                activeTab === 'gallery'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Browse GIFs
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-sm rounded-r-md ${
                activeTab === 'upload'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Upload a GIF
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="max-w-md mx-auto">
            <GifUploadForm />
          </div>
        ) : (
          <GifGallery />
        )}
      </div>
    </div>
  );
}
