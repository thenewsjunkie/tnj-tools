import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types/helpers";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadField from "./form/ImageUploadField";
import TextFields from "./form/TextFields";
import TypeSelector from "./form/TypeSelector";
import ToggleFields from "./form/ToggleFields";

type LowerThirdType = Tables<"lower_thirds">["type"];

interface LowerThirdFormProps {
  initialData?: Tables<"lower_thirds">;
  onSubmit: (data: Omit<Tables<"lower_thirds">, "id" | "created_at" | "updated_at">) => void;
  submitLabel?: string;
}

interface DefaultLogoConfig {
  url: string;
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
    guest_image_url: initialData?.guest_image_url ?? "",
    logo_url: initialData?.logo_url ?? "",
    display_order: initialData?.display_order ?? 0,
    duration_seconds: initialData?.duration_seconds ?? null,
  });

  const [defaultLogo, setDefaultLogo] = useState<string>("");

  useEffect(() => {
    const fetchDefaultLogo = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_lower_third_logo')
        .single();

      if (!error && data?.value) {
        const logoConfig = (data.value as unknown) as DefaultLogoConfig;
        if (logoConfig.url) {
          setDefaultLogo(logoConfig.url);
          if (!initialData?.logo_url) {
            setFormData(prev => ({ ...prev, logo_url: logoConfig.url }));
          }
        }
      }
    };

    const fetchMaxDisplayOrder = async () => {
      if (!initialData) {  // Only fetch for new items
        const { data, error } = await supabase
          .from('lower_thirds')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setFormData(prev => ({ ...prev, display_order: (data.display_order || 0) + 1 }));
        }
      }
    };

    fetchDefaultLogo();
    fetchMaxDisplayOrder();
  }, [initialData?.logo_url]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    onSubmit(formData);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextFields
            formData={formData}
            onChange={handleFieldChange}
          />

          <TypeSelector
            value={formData.type}
            onChange={(value) => handleFieldChange("type", value)}
          />

          {formData.type === "guest" && (
            <div className="col-span-2">
              <ImageUploadField
                id="guest_image"
                label="Guest Photo"
                imageUrl={formData.guest_image_url}
                onImageUpload={(url) => handleFieldChange("guest_image_url", url)}
              />
            </div>
          )}

          <div className="col-span-2">
            <ImageUploadField
              id="logo"
              label="Logo"
              imageUrl={formData.logo_url}
              defaultImageUrl={defaultLogo}
              onImageUpload={(url) => handleFieldChange("logo_url", url)}
            />
          </div>

          <ToggleFields
            showTime={formData.show_time}
            onShowTimeChange={(checked) => handleFieldChange("show_time", checked)}
          />
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