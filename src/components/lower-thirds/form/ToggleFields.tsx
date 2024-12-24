import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ToggleFieldsProps {
  showTime: boolean;
  onShowTimeChange: (checked: boolean) => void;
}

const ToggleFields = ({ showTime, onShowTimeChange }: ToggleFieldsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="show_time"
        checked={showTime}
        onCheckedChange={onShowTimeChange}
      />
      <Label htmlFor="show_time">Show Time</Label>
    </div>
  );
};

export default ToggleFields;