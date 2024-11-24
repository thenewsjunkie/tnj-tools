import React, { useState, useEffect } from "react";
import { Trash2, Link, Image, Video, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type NoteType = 'text' | 'link' | 'image' | 'video';

interface Note {
  id: string;
  type: NoteType;
  content: string;
  title?: string;
  url?: string;
}

const ShowNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('showNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState({ type: 'text' as NoteType, content: '', title: '', url: '' });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('showNotes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      type: newNote.type,
      content: newNote.content,
      ...(newNote.title && { title: newNote.title }),
      ...(newNote.url && { url: newNote.url }),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ type: 'text', content: '', title: '', url: '' });
    
    toast({
      title: "Success",
      description: "Note added successfully",
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({
      title: "Success",
      description: "Note deleted successfully",
    });
  };

  const renderNoteContent = (note: Note) => {
    switch (note.type) {
      case 'link':
        return (
          <a 
            href={note.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Link className="h-4 w-4" />
            <span>{note.title || note.url}</span>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Show Notes
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
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
                <Textarea
                  placeholder="Note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                />
                <Button onClick={handleAddNote} className="w-full">
                  Add Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="relative group">
              <Card>
                <CardContent className="p-4">
                  {renderNoteContent(note)}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowNotes;