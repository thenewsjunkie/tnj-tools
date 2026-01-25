import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ThemeConfig } from "@/types/tapestry";

interface ThemeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeConfig: ThemeConfig;
  onThemeChange: (config: ThemeConfig) => void;
}

interface SideSettingsProps {
  label: string;
  imageUrl?: string;
  color: string;
  onImageChange: (url: string | undefined) => void;
  onColorChange: (color: string) => void;
}

const SideSettings = ({ label, imageUrl, color, onImageChange, onColorChange }: SideSettingsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-tapestry-image', {
        body: formData,
      });

      if (error) throw error;
      
      onImageChange(data.url);
      toast({ title: "Background uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onImageChange(undefined);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Image preview and upload */}
      <div className="flex items-start gap-4">
        <div 
          className="w-24 h-16 rounded-md border flex items-center justify-center overflow-hidden"
          style={{ 
            background: imageUrl 
              ? `url(${imageUrl}) center/cover no-repeat` 
              : color 
          }}
        >
          {!imageUrl && <ImageIcon className="h-6 w-6 text-white/50" />}
        </div>
        
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
          
          {imageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Image
            </Button>
          )}
        </div>
      </div>

      {/* Color picker fallback */}
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground">
          {imageUrl ? "Fallback color:" : "Or use color:"}
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <Input
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-24 h-8 text-xs font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};

export function ThemeSettingsDialog({
  open,
  onOpenChange,
  themeConfig,
  onThemeChange,
}: ThemeSettingsDialogProps) {
  // Local state for live preview
  const [localConfig, setLocalConfig] = useState<ThemeConfig>(themeConfig);

  // Sync local config when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalConfig(themeConfig);
    }
    onOpenChange(newOpen);
  };

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    // Apply immediately for live preview
    onThemeChange(newConfig);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="left" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="left">Left Side</TabsTrigger>
            <TabsTrigger value="right">Right Side</TabsTrigger>
            <TabsTrigger value="divider">Divider</TabsTrigger>
          </TabsList>

          <TabsContent value="left" className="mt-4">
            <SideSettings
              label="Left Background"
              imageUrl={localConfig.leftImageUrl}
              color={localConfig.leftColor}
              onImageChange={(url) => updateConfig({ leftImageUrl: url })}
              onColorChange={(color) => updateConfig({ leftColor: color })}
            />
          </TabsContent>

          <TabsContent value="right" className="mt-4">
            <SideSettings
              label="Right Background"
              imageUrl={localConfig.rightImageUrl}
              color={localConfig.rightColor}
              onImageChange={(url) => updateConfig({ rightImageUrl: url })}
              onColorChange={(color) => updateConfig({ rightColor: color })}
            />
          </TabsContent>

          <TabsContent value="divider" className="mt-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Divider Color</Label>
              
              {/* Divider preview */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-2 h-16 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: localConfig.dividerColor,
                    boxShadow: `0 0 10px ${localConfig.dividerColor}60`
                  }}
                />
                
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localConfig.dividerColor}
                    onChange={(e) => updateConfig({ dividerColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={localConfig.dividerColor}
                    onChange={(e) => updateConfig({ dividerColor: e.target.value })}
                    className="w-24 h-8 text-xs font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Mini preview */}
        <div className="mt-4 pt-4 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
          <div className="h-12 rounded-md overflow-hidden flex border">
            <div 
              className="flex-1"
              style={{ 
                background: localConfig.leftImageUrl 
                  ? `url(${localConfig.leftImageUrl}) center/cover no-repeat` 
                  : localConfig.leftGradient || localConfig.leftColor 
              }}
            />
            <div 
              className="w-1"
              style={{ backgroundColor: localConfig.dividerColor }}
            />
            <div 
              className="flex-1"
              style={{ 
                background: localConfig.rightImageUrl 
                  ? `url(${localConfig.rightImageUrl}) center/cover no-repeat` 
                  : localConfig.rightGradient || localConfig.rightColor 
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
