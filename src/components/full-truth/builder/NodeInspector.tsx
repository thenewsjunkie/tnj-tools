import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, Upload, User } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { CharacterNodeData, PointNodeData, TapestryNodeSide, PointTagType } from "@/types/tapestry";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NodeInspectorProps {
  node: Node | null;
  onUpdate: (nodeId: string, data: Partial<CharacterNodeData | PointNodeData>, side?: TapestryNodeSide) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeInspector({ node, onUpdate, onDelete, onClose }: NodeInspectorProps) {
  const [localData, setLocalData] = useState<CharacterNodeData | PointNodeData | null>(null);
  const [side, setSide] = useState<TapestryNodeSide>('neutral');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (node) {
      setLocalData(node.data as CharacterNodeData | PointNodeData);
      setSide((node.data as any).side || 'neutral');
    }
  }, [node]);

  if (!node || !localData) {
    return (
      <div className="w-72 border-l bg-background p-4 flex items-center justify-center text-muted-foreground text-sm">
        Select a node to edit
      </div>
    );
  }

  const isCharacter = 'name' in localData;

  const handleChange = (key: string, value: string) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onUpdate(node.id, { [key]: value });
  };

  const handleSideChange = (newSide: TapestryNodeSide) => {
    setSide(newSide);
    onUpdate(node.id, {}, newSide);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-tapestry-image', {
        body: formData,
      });

      if (error) throw error;

      handleChange('imageUrl', data.url);
      toast({ title: "Photo uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "Could not upload image",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-72 border-l bg-background flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-medium">{isCharacter ? 'Character' : 'Point'}</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Side selector */}
        <div className="space-y-2">
          <Label>Side</Label>
          <Select value={side} onValueChange={handleSideChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isCharacter ? (
          <>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={(localData as CharacterNodeData).name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={(localData as CharacterNodeData).title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="CEO, Example Corp"
              />
            </div>
            <div className="space-y-3">
              <Label>Photo</Label>
              <div className="flex items-start gap-3">
                {/* Preview */}
                <div className="w-16 h-16 rounded-full bg-muted border-2 border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {(localData as CharacterNodeData).imageUrl ? (
                    <img 
                      src={(localData as CharacterNodeData).imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {/* Upload button */}
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer">
                    <div className={`flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              {/* URL fallback */}
              <Input
                value={(localData as CharacterNodeData).imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="Or paste image URL..."
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={(localData as CharacterNodeData).notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional context..."
                rows={3}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select 
                value={(localData as PointNodeData).tag || 'claim'} 
                onValueChange={(v) => handleChange('tag', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claim">Claim</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={(localData as PointNodeData).headline || ''}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="Key claim or point"
              />
            </div>
            <div className="space-y-2">
              <Label>Detail</Label>
              <Textarea
                value={(localData as PointNodeData).detail || ''}
                onChange={(e) => handleChange('detail', e.target.value)}
                placeholder="Detailed explanation..."
                rows={4}
              />
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
