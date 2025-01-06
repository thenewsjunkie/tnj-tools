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
      <Label>Alert Type</Label>
      <Select
        value={getCurrentValue()}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select alert type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Standard Alert</SelectItem>
          <SelectItem value="gift">Gift Alert</SelectItem>
          <SelectItem value="message">Message Alert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlertTypeSelector;