
import { useState, useEffect } from "react";
import { getAllGifs, updateGifStatus, updateGifTitle, deleteGif, getGifStillUrl, getGifAnimatedUrl } from "@/utils/gifUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Trash, Pencil, Save, X } from "lucide-react";

interface GifItem {
  id: string;
  title: string;
  gif_url: string;
  status: string;
  created_at: string;
}

export default function GifManagementTable() {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGif, setActiveGif] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();

  const fetchGifs = async () => {
    try {
      const data = await getAllGifs();
      setGifs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load GIFs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, [toast]);

  const startEditing = (gif: GifItem) => {
    setEditingId(gif.id);
    setEditTitle(gif.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (id: string) => {
    if (editTitle.trim() === "") {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const success = await updateGifTitle(id, editTitle);
    if (success) {
      toast({
        title: "Success",
        description: "GIF title updated",
      });
      setGifs(gifs.map(gif => 
        gif.id === id ? { ...gif, title: editTitle } : gif
      ));
      setEditingId(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    const success = await updateGifStatus(id, status);
    if (success) {
      toast({
        title: "Success",
        description: `GIF ${status}`,
      });
      setGifs(gifs.map(gif => 
        gif.id === id ? { ...gif, status } : gif
      ));
    } else {
      toast({
        title: "Error",
        description: `Failed to ${status} GIF`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, gifUrl: string) => {
    const success = await deleteGif(id, gifUrl);
    if (success) {
      toast({
        title: "Success",
        description: "GIF deleted",
      });
      setGifs(gifs.filter(gif => gif.id !== id));
    } else {
      toast({
        title: "Error",
        description: "Failed to delete GIF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading GIFs...</p>
        </div>
      </div>
    );
  }

  if (gifs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">No GIFs available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gifs.map((gif) => (
            <TableRow key={gif.id}>
              <TableCell>
                <div 
                  className="relative w-16 h-16 bg-muted rounded overflow-hidden"
                  onMouseEnter={() => setActiveGif(gif.id)}
                  onMouseLeave={() => setActiveGif(null)}
                >
                  <img 
                    src={activeGif === gif.id ? getGifAnimatedUrl(gif.gif_url) : getGifStillUrl(gif.gif_url)} 
                    alt={gif.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell>
                {editingId === gif.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => saveTitle(gif.id)}
                      className="h-8 w-8"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEditing}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{gif.title}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(gif)}
                      className="h-6 w-6 opacity-50 hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    gif.status === 'approved'
                      ? 'success'
                      : gif.status === 'rejected'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {gif.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(gif.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {gif.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-green-500"
                        onClick={() => handleStatusChange(gif.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-red-500"
                        onClick={() => handleStatusChange(gif.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete GIF</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this GIF? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(gif.id, gif.gif_url)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
