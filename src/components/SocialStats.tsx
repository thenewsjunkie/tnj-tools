import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Youtube, Twitter, Instagram, Settings2, GripVertical, Tiktok } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const initialPlatforms = [
  { name: 'Facebook', icon: Facebook, handle: 'thenewsjunkie', followers: '125K' },
  { name: 'YouTube', icon: Youtube, handle: 'thenewsjunkie', followers: '45K' },
  { name: 'Twitter', icon: Twitter, handle: 'thenewsjunkie', followers: '67K' },
  { name: 'Instagram', icon: Instagram, handle: 'thenewsjunkie', followers: '89K' },
  { name: 'TikTok', icon: Tiktok, handle: 'thenewsjunkie', followers: '200K' },
];

const SortableItem = ({ platform }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: platform.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4">
      <GripVertical className="w-4 h-4 cursor-move" {...attributes} {...listeners} />
      <platform.icon className="w-4 h-4" />
      <div className="flex-1">
        <Input
          value={platform.followers}
          onChange={(e) => platform.onChange(platform.name, e.target.value)}
          placeholder={`Enter ${platform.name} followers`}
        />
      </div>
    </div>
  );
};

const SocialStats = () => {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [formData, setFormData] = useState({
    Facebook: '125K',
    YouTube: '45K',
    Twitter: '67K',
    Instagram: '89K',
    TikTok: '200K'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setPlatforms((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleInputChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = () => {
    const updatedPlatforms = platforms.map(platform => ({
      ...platform,
      followers: formData[platform.name as keyof typeof formData]
    }));
    setPlatforms(updatedPlatforms);
  };

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
                  items={platforms.map(p => p.name)}
                  strategy={verticalListSortingStrategy}
                >
                  {platforms.map((platform) => (
                    <SortableItem 
                      key={platform.name} 
                      platform={{
                        ...platform,
                        onChange: handleInputChange,
                        followers: formData[platform.name as keyof typeof formData]
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button onClick={handleSubmit} className="w-full">Update Counts</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-4">
          {platforms.map((platform) => (
            <div 
              key={platform.name}
              className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <platform.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
                <span className="text-white text-sm sm:text-base">{platform.name}</span>
              </div>
              <div className="digital text-neon-red text-lg sm:text-xl">
                {platform.followers}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialStats;