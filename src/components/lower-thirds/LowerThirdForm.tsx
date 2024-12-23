import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types/helpers";

type LowerThirdType = Tables<"lower_thirds">["type"];

interface LowerThirdFormProps {
  initialData?: Tables<"lower_thirds">;
  onSubmit: (data: Omit<Tables<"lower_thirds">, "id" | "created_at" | "updated_at">) => void;
  submitLabel?: string;
}

const defaultStyleConfig = {
  duration: 5000,
  position: "bottom",
  animation: "slide"
} as Json;

const LowerThirdForm = ({ initialData, onSubmit, submitLabel = "Create Lower Third" }: LowerThirdFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    type: initialData?.type ?? "news",
    primary_text: initialData?.primary_text ?? "",
    secondary_text: initialData?.secondary_text ?? "",
    ticker_text: initialData?.ticker_text ?? "",
    show_time: initialData?.show_time ?? false,
    is_active: initialData?.is_active ?? false,
    style_config: initialData?.style_config ?? defaultStyleConfig,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Internal title for this lower third"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: LowerThirdType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
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

          <div className="space-y-2">
            <Label htmlFor="primary_text">Primary Text</Label>
            <Input
              id="primary_text"
              value={formData.primary_text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  primary_text: e.target.value,
                }))
              }
              placeholder="Main text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_text">Secondary Text</Label>
            <Input
              id="secondary_text"
              value={formData.secondary_text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  secondary_text: e.target.value,
                }))
              }
              placeholder="Subtitle or additional information"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticker_text">Ticker Text</Label>
            <Input
              id="ticker_text"
              value={formData.ticker_text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ticker_text: e.target.value,
                }))
              }
              placeholder="Scrolling text (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_time"
              checked={formData.show_time}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, show_time: checked }))
              }
            />
            <Label htmlFor="show_time">Show Time</Label>
          </div>
        </div>

        <Button type="submit" className="w-full">
          {initialData ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
};

export default LowerThirdForm;