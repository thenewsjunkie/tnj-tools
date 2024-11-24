import React, { useState } from "react";
import { Link, Image, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { NoteType } from "./types";
import { supabase } from "@/integrations/supabase/client";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-show-note-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      setNewNote(prev => ({ ...prev, url, title: file.name }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      {newNote.type === 'link' && (
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

      {newNote.type === 'image' && (
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {newNote.url && (
            <div className="relative aspect-video">
              <img 
                src={newNote.url} 
                alt={newNote.title} 
                className="rounded-md object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      )}

      {newNote.type === 'video' && (
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

      <Button onClick={handleAddNote} className="w-full" disabled={isUploading}>
        Add Note
      </Button>
    </div>
  );
};

export default AddNoteForm;