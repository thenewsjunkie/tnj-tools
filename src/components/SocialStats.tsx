import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Youtube, Twitter, Instagram, Settings2, GripVertical, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const platformIcons = {
  Facebook,
  YouTube: Youtube,
  Twitter,
  Instagram,
  TikTok: Zap,
};

const SortableItem = ({ platform }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: platform.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = platformIcons[platform.platform_name] || Zap;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4">
      <GripVertical className="w-4 h-4 cursor-move" {...attributes} {...listeners} />
      <Icon className="w-4 h-4" />
      <div className="flex-1">
        <Input
          value={platform.followers}
          onChange={(e) => platform.onChange(platform.id, e.target.value)}
          placeholder={`Enter ${platform.platform_name} followers`}
        />
      </div>
    </div>
  );
};

const SocialStats = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['social-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_stats')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const newFormData = {};
    platforms.forEach(platform => {
      newFormData[platform.id] = platform.followers;
    });
    setFormData(newFormData);
  }, [platforms]);

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, followers }) => {
      const { error } = await supabase
        .from('social_media_stats')
        .update({ followers })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-stats'] });
      toast({
        title: "Updated successfully",
        description: "Social media stats have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updatedPlatforms) => {
      const updates = updatedPlatforms.map((platform, index) => ({
        id: platform.id,
        display_order: index + 1,
      }));

      const { error } = await supabase
        .from('social_media_stats')
        .upsert(updates);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = platforms.findIndex((item) => item.id === active.id);
      const newIndex = platforms.findIndex((item) => item.id === over.id);
      const newPlatforms = arrayMove(platforms, oldIndex, newIndex);
      updateOrderMutation.mutate(newPlatforms);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    Object.entries(formData).forEach(([id, followers]) => {
      updatePlatformMutation.mutate({ id, followers: followers as string });
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="bg-black/50 border-white/10 relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg sm:text-xl">Social Media Stats</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DialogHeader>
              <DialogTitle>Update Follower Counts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={platforms.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {platforms.map((platform) => (
                    <SortableItem 
                      key={platform.id} 
                      platform={{
                        ...platform,
                        onChange: handleInputChange,
                        followers: formData[platform.id] || platform.followers
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={updatePlatformMutation.isPending}
              >
                Update Counts
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-4">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform.platform_name] || Zap;
            return (
              <div 
                key={platform.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
                  <span className="text-white text-sm sm:text-base">{platform.platform_name}</span>
                </div>
                <div className="digital text-neon-red text-lg sm:text-xl">
                  {platform.followers}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialStats;