import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { platformIcons } from "./platform-icons";
import { SocialMediaPlatform } from "@/types/social-media";

interface SortableStatItemProps {
  platform: SocialMediaPlatform & {
    onChange: (id: string, value: string) => void;
  };
}

const SortableStatItem = ({ platform }: SortableStatItemProps) => {
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

  const Icon = platformIcons[platform.platform_name] || platformIcons.default;

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

export default SortableStatItem;