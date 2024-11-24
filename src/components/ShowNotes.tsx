import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import AddNoteForm from "./notes/AddNoteForm";
import NoteItem from "./notes/NoteItem";
import type { Note, NoteType } from "./notes/types";

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
    if (newNote.type === 'text' && !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if ((newNote.type === 'link' || newNote.type === 'video') && !newNote.url.trim()) {
      toast({
        title: "Error",
        description: "URL cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newNote.type === 'image' && !newNote.url) {
      toast({
        title: "Error",
        description: "Please upload an image",
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
              <AddNoteForm
                newNote={newNote}
                setNewNote={setNewNote}
                handleAddNote={handleAddNote}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowNotes;