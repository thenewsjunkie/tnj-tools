import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";
import AddLinkDialog from "./tnj-links/AddLinkDialog";
import EditLinkDialog from "./tnj-links/EditLinkDialog";
import LinkList from "./tnj-links/LinkList";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const TNJLinks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['tnj-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tnj_links')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Set up realtime subscription for links
  useSupabaseRealtime(
    'tnj-links-changes',
    {
      event: '*',
      table: 'tnj_links'
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
    }
  );

  const updateOrderMutation = useMutation({
    mutationFn: async (updatedLinks: any[]) => {
      const { error } = await supabase
        .from('tnj_links')
        .upsert(
          updatedLinks.map((link, index) => ({
            ...link,
            display_order: index,
          }))
        );
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
      toast({
        title: "Success",
        description: "Link order updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update link order",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tnj_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete link",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = [...links];
      const [movedItem] = newLinks.splice(oldIndex, 1);
      newLinks.splice(newIndex, 0, movedItem);
      
      updateOrderMutation.mutate(newLinks);
    }
  };

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className={`w-full ${bgColor} border border-gray-200 dark:border-white/10`}>
      <CardHeader>
        <CardTitle className={`text-lg sm:text-xl`}>TNJ Links</CardTitle>
        <AddLinkDialog 
          onLinkAdded={() => queryClient.invalidateQueries({ queryKey: ['tnj-links'] })}
          lastOrder={links.length > 0 ? Math.max(...links.map(l => l.display_order)) : 0}
        />
      </CardHeader>
      <CardContent>
        <LinkList
          links={links}
          onDragEnd={handleDragEnd}
          onDelete={(id) => deleteLinkMutation.mutate(id)}
          onEdit={(link) => {
            setSelectedLink(link);
            setIsEditDialogOpen(true);
          }}
          theme={theme}
        />
      </CardContent>

      <EditLinkDialog
        link={selectedLink}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLinkUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
          setSelectedLink(null);
        }}
      />
    </Card>
  );
};

export default TNJLinks;