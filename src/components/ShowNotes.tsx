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
import { useAuth } from "@/hooks/useAuth";

const INITIAL_DISPLAY_COUNT = 10;

const ShowNotes = () => {
  const [newNote, setNewNote] = useState({ type: 'text' as NoteType, content: '', title: '', url: '' });
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['show-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(note => ({
        ...note,
        type: note.type as NoteType,
        id: note.id
      })) as Note[];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at'>) => {
      const { data: insertedData, error: insertError } = await supabase
        .from('show_notes')
        .insert({
          type: note.type,
          content: note.content,
          title: note.title,
          url: note.url
        })
        .select('*')
        .single();
      
      if (insertError) throw insertError;
      return insertedData;
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
      const { error: deleteError } = await supabase
        .from('show_notes')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const displayedNotes = showAll ? notes : notes.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreNotes = notes.length > INITIAL_DISPLAY_COUNT;

  return (
    <Card className="w-full border-border">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Show Notes
          {session && (
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
                  handleAddNote={(note) => addNoteMutation.mutate(note)}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedNotes.map((note) => (
            <div key={note.id} className="note-card">
              <NoteItem
                note={note}
                onDelete={session ? () => deleteNoteMutation.mutate(note.id) : undefined}
              />
            </div>
          ))}
          {hasMoreNotes && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "Show More"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowNotes;
