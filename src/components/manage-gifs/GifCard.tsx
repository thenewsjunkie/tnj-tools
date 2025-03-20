
import React from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface GifCardProps {
  gif: Tables<"tnj_gifs">;
  onPreview: (gif: Tables<"tnj_gifs">) => void;
  onEdit: (gif: Tables<"tnj_gifs">) => void;
  onDelete: (gif: Tables<"tnj_gifs">) => void;
  onStatusChange: (id: string, status: string) => void;
  getBadgeVariant: (status: string) => string;
}

const GifCard: React.FC<GifCardProps> = ({
  gif,
  onPreview,
  onEdit,
  onDelete,
  onStatusChange,
  getBadgeVariant
}) => {
  return (
    <Card key={gif.id} className="overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={gif.gif_url}
          alt={gif.title}
          className="object-cover w-full h-full"
          style={{ animationPlayState: "paused" }}
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate flex-1" title={gif.title}>
            {gif.title}
          </h3>
          <Badge 
            variant={getBadgeVariant(gif.status) as "default" | "destructive" | "outline" | "secondary"}
          >
            {gif.status}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {new Date(gif.created_at).toLocaleDateString()}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onPreview(gif)}
          >
            <Eye size={16} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onEdit(gif)}
          >
            <Edit size={16} />
          </Button>
          
          {gif.status !== "approved" && (
            <Button 
              variant="outline" 
              size="icon" 
              className="text-green-500 hover:text-green-700"
              onClick={() => onStatusChange(gif.id, "approved")}
            >
              <CheckCircle size={16} />
            </Button>
          )}
          
          {gif.status !== "rejected" && (
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-500 hover:text-red-700"
              onClick={() => onStatusChange(gif.id, "rejected")}
            >
              <XCircle size={16} />
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="text-red-500 hover:text-red-700 ml-auto"
            onClick={() => onDelete(gif)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GifCard;
