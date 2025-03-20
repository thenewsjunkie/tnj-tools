
import React from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

interface GifDialogsProps {
  selectedGif: Tables<"tnj_gifs"> | null;
  editTitle: string;
  isEditDialogOpen: boolean;
  isPreviewDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setEditTitle: (title: string) => void;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  setIsPreviewDialogOpen: (isOpen: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  handleEdit: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

const GifDialogs: React.FC<GifDialogsProps> = ({
  selectedGif,
  editTitle,
  isEditDialogOpen,
  isPreviewDialogOpen,
  isDeleteDialogOpen,
  setEditTitle,
  setIsEditDialogOpen,
  setIsPreviewDialogOpen,
  setIsDeleteDialogOpen,
  handleEdit,
  handleDelete
}) => {
  return (
    <>
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
    </>
  );
};

export default GifDialogs;
