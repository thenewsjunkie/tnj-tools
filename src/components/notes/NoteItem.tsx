import React, { useState } from "react";
import { Trash2, Link, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "./types";

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteItem = ({ note, onDelete }: NoteItemProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderTextWithLinks = (text: string) => {
    // More comprehensive URL regex pattern
    const urlPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    
    // Find all URLs in the text
    const urls = text.match(urlPattern) || [];
    
    // Replace URLs in the text with a placeholder
    let placeholders = [];
    let modifiedText = text.replace(urlPattern, (_, index) => {
      placeholders.push(urls[index]);
      return `@URL${placeholders.length - 1}@`;
    });

    // Split the text by URL placeholders
    const parts = modifiedText.split(/@URL\d+@/);

    // Combine parts with URL placeholders replaced by anchor tags
    const combined = parts.reduce((acc: (string | JSX.Element)[], part, i) => {
      if (part) {
        acc.push(part);
      }
      if (placeholders[i]) {
        acc.push(
          <a
            key={`link-${i}`}
            href={placeholders[i].startsWith('http') ? placeholders[i] : `https://${placeholders[i]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-block break-all"
          >
            {placeholders[i]}
          </a>
        );
      }
      return acc;
    }, []);

    return combined;
  };

  const renderNoteContent = () => {
    switch (note.type) {
      case 'link':
        return (
          <a 
            href={note.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
              alt="Link thumbnail"
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex items-center gap-2 min-w-0">
              <Link className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{note.title || note.url}</span>
            </div>
          </a>
        );
      case 'image':
        return (
          <div 
            className="relative aspect-video cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          >
            <img 
              src={note.url} 
              alt={note.title || 'Show note image'} 
              className="rounded-md object-cover w-full h-full"
            />
            {note.title && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                <p className="text-white text-sm truncate">{note.title}</p>
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video">
            <iframe
              src={note.url}
              title={note.title || 'Show note video'}
              className="rounded-md w-full h-full"
              allowFullScreen
            />
          </div>
        );
      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {renderTextWithLinks(note.content || '')}
          </div>
        );
    }
  };

  return (
    <>
      <div className="relative group">
        <Card>
          <CardContent className="p-4">
            {renderNoteContent()}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {isFullscreen && note.type === 'image' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img 
            src={note.url} 
            alt={note.title || 'Show note image'} 
            className="max-w-full max-h-full object-contain"
          />
          {note.title && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
              <p className="text-white">{note.title}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NoteItem;
