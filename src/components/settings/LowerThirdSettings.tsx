import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadField from "@/components/lower-thirds/form/ImageUploadField";
import { supabase } from "@/integrations/supabase/client";

interface DefaultLogoConfig {
  url: string;
}

export const LowerThirdSettings = () => {
  const [defaultLogo, setDefaultLogo] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDefaultLogo = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_lower_third_logo')
        .single();

      if (!error && data?.value) {
        // First cast to unknown, then to DefaultLogoConfig to satisfy TypeScript
        const logoConfig = (data.value as unknown) as DefaultLogoConfig;
        if (logoConfig.url) {
          setDefaultLogo(logoConfig.url);
        }
      }
    };

    fetchDefaultLogo();
  }, []);

  const handleLogoUpdate = async (url: string) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'default_lower_third_logo',
        value: { url },
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update default logo",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Default logo updated successfully",
      });
      setDefaultLogo(url);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lower Third Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUploadField
            id="default_logo"
            label="Default Logo"
            imageUrl={defaultLogo}
            onImageUpload={handleLogoUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
};