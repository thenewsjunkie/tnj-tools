import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Eye, ArrowLeft, Loader2, Palette } from "lucide-react";
import { Link } from "react-router-dom";

interface BuilderToolbarProps {
  title: string;
  status: 'draft' | 'published';
  isSaving: boolean;
  isPublishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onPreview?: () => void;
  onOpenThemeSettings?: () => void;
  slug?: string;
}

export function BuilderToolbar({
  title,
  status,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onPreview,
  onOpenThemeSettings,
  slug
}: BuilderToolbarProps) {
  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link
          to="/full-truth"
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg">{title || "Untitled Tapestry"}</h1>
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {slug && status === 'published' && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/full-truth/view/${slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
        )}
        
        {onPreview && (
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}

        {onOpenThemeSettings && (
          <Button variant="outline" size="sm" onClick={onOpenThemeSettings}>
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </Button>
        )}
        
        <Button
          variant="outline" 
          size="sm" 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Draft
        </Button>
        
        <Button 
          size="sm" 
          onClick={onPublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          Publish
        </Button>
      </div>
    </div>
  );
}
