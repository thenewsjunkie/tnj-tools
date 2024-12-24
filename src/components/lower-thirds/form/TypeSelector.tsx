import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type LowerThirdType = Tables<"lower_thirds">["type"];

interface TypeSelectorProps {
  value: LowerThirdType;
  onChange: (value: LowerThirdType) => void;
}

const TypeSelector = ({ value, onChange }: TypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Type</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="news">News</SelectItem>
          <SelectItem value="guest">Guest</SelectItem>
          <SelectItem value="topic">Topic</SelectItem>
          <SelectItem value="breaking">Breaking</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TypeSelector;