import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddNoteForm from "./notes/AddNoteForm";
import NoteItem from "./notes/NoteItem";
import type { Note, NoteType } from "./notes/types";

const ShowNotes = () => {
  const [newNote, setNewNote] = useState({ type: 'text' as NoteType, content: '', title: '', url: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['show-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure the type is correctly converted from the database
      return data.map(note => ({
        ...note,
        type: note.type as NoteType
      }));
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: Omit<Note, 'id'>) => {
      const { error } = await supabase
        .from('show_notes')
        .insert([note]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-notes'] });
      setNewNote({ type: 'text', content: '', title: '', url: '' });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('show_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-notes'] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    },
  });

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

    addNoteMutation.mutate(newNote);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
              onDelete={() => deleteNoteMutation.mutate(note.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowNotes;
