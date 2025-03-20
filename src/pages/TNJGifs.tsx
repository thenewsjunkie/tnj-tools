
import { useState } from "react";
import GifUploadForm from "@/components/gifs/GifUploadForm";
import GifGallery from "@/components/gifs/GifGallery";

export default function TNJGifs() {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');

  return (
    <div className="min-h-screen w-full px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">TNJ GIFs</h1>
          <p className="text-muted-foreground mt-2">
            Browse and share animated GIFs with the TNJ community
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md border">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-l-md ${
                activeTab === 'gallery'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Browse GIFs
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-r-md ${
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
