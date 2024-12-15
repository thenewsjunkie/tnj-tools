import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "./types";
import TextNote from "./note-types/TextNote";
import LinkNote from "./note-types/LinkNote";
import ImageNote from "./note-types/ImageNote";
import VideoNote from "./note-types/VideoNote";
import ImageFullscreen from "./ImageFullscreen";

interface NoteItemProps {
  note: Note;
  onDelete?: (id: string) => void;
}

const NoteItem = ({ note, onDelete }: NoteItemProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderNoteContent = () => {
    switch (note.type) {
      case 'link':
        return <LinkNote url={note.url} title={note.title} />;
      case 'image':
        return (
          <ImageNote 
            url={note.url} 
            title={note.title} 
            onImageClick={() => setIsFullscreen(true)} 
          />
        );
      case 'video':
        return <VideoNote url={note.url} title={note.title} />;
      default:
        return <TextNote content={note.content} />;
    }
  };

  return (
    <>
      <div className="relative group">
        <Card className="bg-background">
          <CardContent className="p-4">
            {renderNoteContent()}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {isFullscreen && note.type === 'image' && (
        <ImageFullscreen
          url={note.url}
          title={note.title}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

export default NoteItem;