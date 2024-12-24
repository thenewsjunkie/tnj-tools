import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldsProps {
  formData: {
    title: string;
    primary_text: string;
    secondary_text: string;
    ticker_text: string;
  };
  onChange: (field: string, value: string) => void;
}

const TextFields = ({ formData, onChange }: TextFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Internal title for this lower third"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_text">Primary Text</Label>
        <Input
          id="primary_text"
          value={formData.primary_text}
          onChange={(e) => onChange("primary_text", e.target.value)}
          placeholder="Main text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondary_text">Secondary Text</Label>
        <Input
          id="secondary_text"
          value={formData.secondary_text}
          onChange={(e) => onChange("secondary_text", e.target.value)}
          placeholder="Subtitle or additional information"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticker_text">Ticker Text</Label>
        <Input
          id="ticker_text"
          value={formData.ticker_text}
          onChange={(e) => onChange("ticker_text", e.target.value)}
          placeholder="Scrolling text (optional)"
        />
      </div>
    </>
  );
};

export default TextFields;