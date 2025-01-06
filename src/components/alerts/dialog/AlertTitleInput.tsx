import { Input } from "@/components/ui/input";

interface AlertTitleInputProps {
  title: string;
  setTitle: (title: string) => void;
}

const AlertTitleInput = ({ title, setTitle }: AlertTitleInputProps) => {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Alert Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="text-foreground bg-background border-input"
      />
    </div>
  );
};

export default AlertTitleInput;