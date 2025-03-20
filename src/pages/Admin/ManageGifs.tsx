
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trash2, CheckCircle, XCircle, Edit, Eye, ExternalLink, ArrowLeft, Github
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      {/* Custom header with back button to admin page */}
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-4">
        <Link 
          to="/admin" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/thenewsjunkie/tnj-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <h1 className="text-foreground text-xl sm:text-2xl digital">TNJ Tools</h1>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage GIFs</h1>
          <a href="/tnjgifs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink size={16} />
              View Public Page
            </Button>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gifs.map((gif) => (
            <Card key={gif.id} className="overflow-hidden">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={gif.gif_url}
                  alt={gif.title}
                  className="object-cover w-full h-full"
                  style={{ animationPlayState: "paused" }}
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate flex-1" title={gif.title}>
                    {gif.title}
                  </h3>
                  <Badge 
                    variant={getBadgeVariant(gif.status) as "default" | "destructive" | "outline" | "secondary"}
                  >
                    {gif.status}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {new Date(gif.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openPreviewDialog(gif)}
                  >
                    <Eye size={16} />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openEditDialog(gif)}
                  >
                    <Edit size={16} />
                  </Button>
                  
                  {gif.status !== "approved" && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-green-500 hover:text-green-700"
                      onClick={() => handleStatusChange(gif.id, "approved")}
                    >
                      <CheckCircle size={16} />
                    </Button>
                  )}
                  
                  {gif.status !== "rejected" && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleStatusChange(gif.id, "rejected")}
                    >
                      <XCircle size={16} />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 ml-auto"
                    onClick={() => openDeleteDialog(gif)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {gifs.length === 0 && (
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No GIFs have been uploaded yet.</p>
          </div>
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit GIF Title</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedGif?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-md">
            {selectedGif && (
              <img
                src={selectedGif.gif_url}
                alt={selectedGif.title}
                className="w-full"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this GIF? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageGifs;
