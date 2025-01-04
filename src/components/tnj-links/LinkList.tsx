import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableLink from "./SortableLink";
import { Theme } from "@/components/theme/ThemeProvider";

interface LinkListProps {
  links: any[];
  onDragEnd: (event: DragEndEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (link: any) => void;
  theme: Theme;
}

const LinkList = ({ links, onDragEnd, onDelete, onEdit, theme }: LinkListProps) => {
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
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
              onDelete={() => onDelete(link.id)}
              onEdit={() => onEdit(link)}
              theme={theme}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default LinkList;