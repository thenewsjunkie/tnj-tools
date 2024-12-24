import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";
import AddLinkDialog from "./tnj-links/AddLinkDialog";
import EditLinkDialog from "./tnj-links/EditLinkDialog";
import SortableLink from "./tnj-links/SortableLink";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      updateOrderMutation.mutate(newLinks);
    }
  };

  // Check links status every 5 minutes
  useEffect(() => {
    const checkLinksStatus = async () => {
      for (const link of links) {
        try {
          // Use Supabase Edge Function to check status
          const { data, error } = await supabase.functions.invoke('check-link-status', {
            body: { url: link.url }
          });

          if (error) throw error;

          const newStatus = data.isUp ? 'up' : 'down';
          
          // Only update if status has changed
          if (link.status !== newStatus) {
            await supabase
              .from('tnj_links')
              .update({ 
                status: newStatus,
                last_checked: new Date().toISOString()
              })
              .eq('id', link.id);
            
            queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
          }
        } catch (error) {
          // Only update if status isn't already down
          if (link.status !== 'down') {
            await supabase
              .from('tnj_links')
              .update({ 
                status: 'down',
                last_checked: new Date().toISOString()
              })
              .eq('id', link.id);
            
            queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
          }
        }
      }
    };

    checkLinksStatus();
    const interval = setInterval(checkLinksStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [links, queryClient]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';

  return (
    <Card className={`w-full ${bgColor} border border-gray-200 dark:border-white/10`}>
      <CardHeader>
        <CardTitle className={`${textColor} text-lg sm:text-xl`}>TNJ Links</CardTitle>
        <AddLinkDialog 
          onLinkAdded={() => queryClient.invalidateQueries({ queryKey: ['tnj-links'] })}
          lastOrder={links.length > 0 ? Math.max(...links.map(l => l.display_order)) : 0}
        />
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map(link => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 sm:space-y-4">
              {links.map((link) => (
                <SortableLink
                  key={link.id}
                  id={link.id}
                  title={link.title}
                  url={link.url}
                  status={link.status}
                  target={link.target}
                  onDelete={() => deleteLinkMutation.mutate(link.id)}
                  onEdit={() => {
                    setSelectedLink(link);
                    setIsEditDialogOpen(true);
                  }}
                  theme={theme}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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