import React from "react";
import { Trash2, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "./types";

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteItem = ({ note, onDelete }: NoteItemProps) => {
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
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>{note.title || note.url}</span>
            </div>
          </a>
        );
      case 'image':
        return (
          <div className="relative aspect-video">
            <img 
              src={note.url} 
              alt={note.title || 'Show note image'} 
              className="rounded-md object-cover w-full h-full"
            />
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
        return <p className="whitespace-pre-wrap">{note.content}</p>;
    }
  };

  return (
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
  );
};

export default NoteItem;