import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AlertTypeSelectorProps {
  isGiftAlert: boolean;
  setIsGiftAlert: (value: boolean) => void;
  isMessageAlert: boolean;
  setIsMessageAlert: (value: boolean) => void;
}

const AlertTypeSelector = ({ 
  isGiftAlert, 
  setIsGiftAlert,
  isMessageAlert,
  setIsMessageAlert
}: AlertTypeSelectorProps) => {
  const handleTypeChange = (value: string) => {
    setIsGiftAlert(value === 'gift');
    setIsMessageAlert(value === 'message');
  };

  const getCurrentValue = () => {
    if (isGiftAlert) return 'gift';
    if (isMessageAlert) return 'message';
    return 'standard';
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground">Alert Type</Label>
      <Select
        value={getCurrentValue()}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="bg-background text-foreground border-input">
          <SelectValue placeholder="Select alert type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard" className="text-foreground">Standard Alert</SelectItem>
          <SelectItem value="gift" className="text-foreground">Gift Alert</SelectItem>
          <SelectItem value="message" className="text-foreground">Message Alert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlertTypeSelector;