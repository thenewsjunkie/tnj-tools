import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableHourProps {
  id: string;
  children: ReactNode;
}

const DroppableHour = ({ id, children }: DroppableHourProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors rounded-lg ${
        isOver ? "ring-2 ring-primary/50 bg-primary/5" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default DroppableHour;
