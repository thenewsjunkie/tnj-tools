
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

// Import our new components
import Header from "@/components/manage-gifs/Header";
import GifGrid from "@/components/manage-gifs/GifGrid";
import GifDialogs from "@/components/manage-gifs/GifDialogs";

const ManageGifs = () => {
  const { toast } = useToast();
  const [selectedGif, setSelectedGif] = useState<Tables<"tnj_gifs"> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const { data: gifs = [], refetch } = useQuery({
    queryKey: ["all-tnj-gifs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tnj_gifs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching GIFs",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Tables<"tnj_gifs">[];
    },
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tnj_gifs")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `GIF ${status === "approved" ? "approved" : "rejected"} successfully.`,
      });
      refetch();
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedGif) return;
    
    try {
      // Get the filename from the URL
      const urlParts = selectedGif.gif_url.split("/");
      const filename = urlParts[urlParts.length - 1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("tnj_gifs")
        .remove([filename]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from("tnj_gifs")
        .delete()
        .eq("id", selectedGif.id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "GIF deleted",
        description: "The GIF has been permanently deleted.",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedGif(null);
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error deleting GIF",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedGif || !editTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from("tnj_gifs")
        .update({ title: editTitle })
        .eq("id", selectedGif.id);
        
      if (error) throw error;
      
      toast({
        title: "GIF updated",
        description: "The GIF title has been updated.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedGif(null);
      refetch();
    } catch (error) {
      console.error("Edit error:", error);
      toast({
        title: "Error updating GIF",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (gif: Tables<"tnj_gifs">) => {
    setSelectedGif(gif);
    setEditTitle(gif.title);
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (gif: Tables<"tnj_gifs">) => {
    setSelectedGif(gif);
    setIsPreviewDialogOpen(true);
  };

  const openDeleteDialog = (gif: Tables<"tnj_gifs">) => {
    setSelectedGif(gif);
    setIsDeleteDialogOpen(true);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Header />
        
        <GifGrid 
          gifs={gifs} 
          onPreview={openPreviewDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onStatusChange={handleStatusChange}
          getBadgeVariant={getBadgeVariant}
        />
      </div>
      
      <GifDialogs
        selectedGif={selectedGif}
        editTitle={editTitle}
        isEditDialogOpen={isEditDialogOpen}
        isPreviewDialogOpen={isPreviewDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setEditTitle={setEditTitle}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setIsPreviewDialogOpen={setIsPreviewDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default ManageGifs;
