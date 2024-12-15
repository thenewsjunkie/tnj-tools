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
  handleAddNote: (note: {
    type: NoteType;
    content: string;
    title: string;
    url: string;
  }) => void;
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

      const { data, error } = await supabase.functions.invoke('upload-show-note-image', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setNewNote(prev => ({ ...prev, url: data.url, title: file.name }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      console.error('Upload error:', error);
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
          className={newNote.type !== 'text' ? 'dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10' : ''}
        >
          Text
        </Button>
        <Button
          variant={newNote.type === 'link' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'link' }))}
          className={newNote.type !== 'link' ? 'dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10' : ''}
        >
          <Link className="h-4 w-4 mr-2" />
          Link
        </Button>
        <Button
          variant={newNote.type === 'image' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'image' }))}
          className={newNote.type !== 'image' ? 'dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10' : ''}
        >
          <Image className="h-4 w-4 mr-2" />
          Image
        </Button>
        <Button
          variant={newNote.type === 'video' ? 'default' : 'outline'}
          onClick={() => setNewNote(prev => ({ ...prev, type: 'video' }))}
          className={newNote.type !== 'video' ? 'dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10' : ''}
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
            className="dark:bg-black dark:border-white/20 dark:text-white"
          />
          <Input
            placeholder="URL"
            value={newNote.url}
            onChange={(e) => setNewNote(prev => ({ ...prev, url: e.target.value }))}
            className="dark:bg-black dark:border-white/20 dark:text-white"
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
            className="dark:text-white dark:file:bg-white/10 dark:file:text-white dark:file:border-white/20"
          />
          {isUploading && <p className="text-sm text-white/70">Uploading...</p>}
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
            className="dark:bg-black dark:border-white/20 dark:text-white"
          />
          <Input
            placeholder="URL"
            value={newNote.url}
            onChange={(e) => setNewNote(prev => ({ ...prev, url: e.target.value }))}
            className="dark:bg-black dark:border-white/20 dark:text-white"
          />
        </>
      )}

      {newNote.type === 'text' && (
        <Textarea
          placeholder="Note content..."
          value={newNote.content}
          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
          className="dark:bg-black dark:border-white/20 dark:text-white"
        />
      )}

      <Button onClick={() => handleAddNote(newNote)} className="w-full" disabled={isUploading}>
        Add Note
      </Button>
    </div>
  );
};

export default AddNoteForm;