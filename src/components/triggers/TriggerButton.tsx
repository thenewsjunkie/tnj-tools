import { Button } from "@/components/ui/button";

interface TriggerButtonProps {
  title: string;
  onClick: () => void;
}

export const TriggerButton = ({ title, onClick }: TriggerButtonProps) => {
  return (
    <Button
      variant="outline"
      className="min-w-[100px]"
      onClick={onClick}
    >
      {title}
    </Button>
  );
};