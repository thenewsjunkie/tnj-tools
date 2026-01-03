import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Pencil, X, Check, Link as LinkIcon, Image as ImageIcon, Loader2, ExternalLink, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Topic, Link } from "@/components/admin/show-prep/types";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";

const TopicResources = () => {
  const { date, topicId } = useParams<{ date: string; topicId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch show prep notes for the date
  const { data: showPrepData, isLoading } = useQuery({
    queryKey: ["show-prep-notes", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });

  // Get current topic from the data
  const topics = (showPrepData?.topics as unknown as Topic[]) || [];
  const topic = topics.find(t => t.id === topicId);

  // Mutation to update the topic
  const updateMutation = useMutation({
    mutationFn: async (updatedTopic: Topic) => {
      const updatedTopics = topics.map(t => 
        t.id === topicId ? updatedTopic : t
      );
      
      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify(updatedTopics)) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
    },
    onError: (error) => {
      toast.error("Failed to save changes");
      console.error(error);
    },
  });

  // Fetch title from URL
  const fetchTitleFromUrl = async (url: string): Promise<{ title?: string; thumbnail_url?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-link-metadata", {
        body: { url },
      });
      if (error) throw error;
      
      // Generate thumbnail URL
      const encodedUrl = encodeURIComponent(url);
      const thumbnail_url = `https://image.thum.io/get/width/300/${url}`;
      
      return { 
        title: data?.title,
        thumbnail_url 
      };
    } catch (error) {
      console.error("Failed to fetch title:", error);
      return {};
    }
  };

  // Handle adding a new link
  const handleAddLink = async () => {
    if (!newUrl.trim() || !topic) return;
    
    let title = newTitle.trim();
    let thumbnail_url: string | undefined;
    
    if (!title) {
      setIsFetchingTitle(true);
      const metadata = await fetchTitleFromUrl(newUrl);
      title = metadata.title || new URL(newUrl).hostname;
      thumbnail_url = metadata.thumbnail_url;
      setIsFetchingTitle(false);
    } else {
      const encodedUrl = encodeURIComponent(newUrl);
      thumbnail_url = `https://image.thum.io/get/width/300/${newUrl}`;
    }
    
    const newLink: Link = {
      id: uuidv4(),
      url: newUrl,
      title,
      thumbnail_url,
    };
    
    updateMutation.mutate({
      ...topic,
      links: [...topic.links, newLink],
    });
    
    setNewUrl("");
    setNewTitle("");
    setIsAddingLink(false);
    toast.success("Link added");
  };

  // Handle URL blur to auto-fetch title
  const handleUrlBlur = async () => {
    if (!newUrl.trim() || newTitle.trim()) return;
    
    setIsFetchingTitle(true);
    const metadata = await fetchTitleFromUrl(newUrl);
    if (metadata.title) {
      setNewTitle(metadata.title);
    }
    setIsFetchingTitle(false);
  };

  // Handle editing a link
  const startEditingLink = (link: Link) => {
    setEditingLinkId(link.id);
    setEditTitle(link.title || "");
  };

  const saveEditLink = () => {
    if (!topic || !editingLinkId) return;
    
    updateMutation.mutate({
      ...topic,
      links: topic.links.map(l => 
        l.id === editingLinkId ? { ...l, title: editTitle } : l
      ),
    });
    
    setEditingLinkId(null);
    setEditTitle("");
  };

  // Handle deleting a link
  const handleDeleteLink = (linkId: string) => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      links: topic.links.filter(l => l.id !== linkId),
    });
    toast.success("Link removed");
  };

  // Handle clearing all links
  const handleClearAllLinks = () => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      links: [],
    });
    toast.success("All links cleared");
  };

  // Handle adding an image
  const handleAddImage = () => {
    if (!newImageUrl.trim() || !topic) return;
    
    updateMutation.mutate({
      ...topic,
      images: [...topic.images, newImageUrl],
    });
    
    setNewImageUrl("");
    setIsAddingImage(false);
    toast.success("Image added");
  };

  // Handle uploading an image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !topic) return;
    
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const { data, error } = await supabase.functions.invoke("upload-show-note-image", {
        body: formData,
      });
      
      if (error) throw error;
      
      updateMutation.mutate({
        ...topic,
        images: [...topic.images, data.url],
      });
      
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle deleting an image
  const handleDeleteImage = (index: number) => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      images: topic.images.filter((_, i) => i !== index),
    });
    toast.success("Image removed");
  };

  // Handle clearing all images
  const handleClearAllImages = () => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      images: [],
    });
    toast.success("All images cleared");
  };

  // Get thumbnail URL for a link
  const getThumbnailUrl = (link: Link) => {
    if (link.thumbnail_url) return link.thumbnail_url;
    return `https://image.thum.io/get/width/300/${link.url}`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Topic not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const formattedDate = date ? format(parseISO(date), "MMMM d, yyyy") : "";
  const resourceCount = topic.links.length + topic.images.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Show Prep
          </Button>
          <h1 className="text-2xl font-bold">Resources for "{topic.title || "Untitled Topic"}"</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      {/* Links Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Links
            {topic.links.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({topic.links.length})</span>
            )}
          </h2>
          <div className="flex gap-2">
            {topic.links.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all links?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {topic.links.length} links from this topic. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllLinks}>Clear All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button size="sm" onClick={() => setIsAddingLink(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </div>

        {/* Add Link Form */}
        {isAddingLink && (
          <Card className="p-4 space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="Paste URL here..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onBlur={handleUrlBlur}
                autoFocus
              />
              <div className="flex gap-2">
                <Input
                  placeholder={isFetchingTitle ? "Fetching title..." : "Title (optional, auto-fetched)"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isFetchingTitle}
                />
                {isFetchingTitle && <Loader2 className="h-4 w-4 animate-spin self-center" />}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setIsAddingLink(false); setNewUrl(""); setNewTitle(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddLink} disabled={!newUrl.trim() || isFetchingTitle}>
                Add Link
              </Button>
            </div>
          </Card>
        )}

        {/* Links List */}
        <div className="space-y-2">
          {topic.links.map((link) => (
            <Card key={link.id} className="p-3 flex items-center gap-3 group">
              <div className="w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={getThumbnailUrl(link)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                {editingLinkId === link.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditLink();
                        if (e.key === "Escape") setEditingLinkId(null);
                      }}
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={saveEditLink}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingLinkId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm truncate">{link.title || "Untitled"}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary truncate block flex items-center gap-1"
                    >
                      {new URL(link.url).hostname}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
              {editingLinkId !== link.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEditingLink(link)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => handleDeleteLink(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
          {topic.links.length === 0 && !isAddingLink && (
            <p className="text-sm text-muted-foreground text-center py-4">No links yet. Click "Add Link" to get started.</p>
          )}
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images
            {topic.images.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({topic.images.length})</span>
            )}
          </h2>
          <div className="flex gap-2">
            {topic.images.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all images?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {topic.images.length} images from this topic. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllImages}>Clear All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button size="sm" onClick={() => setIsAddingImage(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        {/* Add Image Form */}
        {isAddingImage && (
          <Card className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                autoFocus
              />
              <Button size="sm" onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                Add
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">or</span>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <Button size="sm" variant="outline" asChild disabled={isUploadingImage}>
                  <span>
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload File
                  </span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" onClick={() => { setIsAddingImage(false); setNewImageUrl(""); }}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topic.images.map((imageUrl, index) => (
            <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {topic.images.length === 0 && !isAddingImage && (
            <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No images yet. Click "Add Image" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicResources;
