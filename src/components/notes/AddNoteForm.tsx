import React from "react";
import { Link, Image, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NoteType } from "./types";

interface AddNoteFormProps {
  newNote: {
    type: NoteType;
    content: string;
    title: string;
    url: string;
  };
  setNewNote: React.Dispatch<React.SetStateAction<{
    type: NoteType;
    content: string;
    title: string;
    url: string;
  }>>;
  handleAddNote: () => void;
}

const AddNoteForm = ({ newNote, setNewNote, handleAddNote }: AddNoteFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={newNote.type === 'text' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'text' }))}
        >
          Text
        </Button>
        <Button
          variant={newNote.type === 'link' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'link' }))}
        >
          <Link className="h-4 w-4 mr-2" />
          Link
        </Button>
        <Button
          variant={newNote.type === 'image' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'image' }))}
        >
          <Image className="h-4 w-4 mr-2" />
          Image
        </Button>
        <Button
          variant={newNote.type === 'video' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'video' }))}
        >
          <Video className="h-4 w-4 mr-2" />
          Video
        </Button>
      </div>
      {(newNote.type === 'link' || newNote.type === 'image' || newNote.type === 'video') && (
        <>
          <Input
            placeholder="Title (optional)"
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
          />
          <Input
            placeholder="URL"
            value={newNote.url}
            onChange={(e) => setNewNote(prev => ({ ...prev, url: e.target.value }))}
          />
        </>
      )}
      {newNote.type === 'text' && (
        <Textarea
          placeholder="Note content..."
          value={newNote.content}
          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
        />
      )}
      <Button onClick={handleAddNote} className="w-full">
        Add Note
      </Button>
    </div>
  );
};

export default AddNoteForm;