import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit } from "lucide-react";
import type { Tapestry } from "@/types/tapestry";

interface TapestryCardProps {
  tapestry: Tapestry;
  isOwner?: boolean;
}

export function TapestryCard({ tapestry, isOwner }: TapestryCardProps) {
  const formattedDate = new Date(tapestry.created_at).toLocaleDateString();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
        {tapestry.thumbnail_url ? (
          <img
            src={tapestry.thumbnail_url}
            alt={tapestry.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${tapestry.theme_config.leftColor} 0%, ${tapestry.theme_config.leftColor} 50%, ${tapestry.theme_config.rightColor} 50%, ${tapestry.theme_config.rightColor} 100%)`
            }}
          >
            <span className="text-white/50 text-sm">No preview</span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            to={`/full-truth/view/${tapestry.slug}`}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Eye className="h-5 w-5 text-white" />
          </Link>
          {isOwner && (
            <Link
              to={`/full-truth/edit/${tapestry.id}`}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Edit className="h-5 w-5 text-white" />
            </Link>
          )}
        </div>
        
        {/* Status badge */}
        <Badge 
          variant={tapestry.status === 'published' ? 'default' : 'secondary'}
          className="absolute top-2 right-2"
        >
          {tapestry.status}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{tapestry.title}</h3>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </CardContent>
    </Card>
  );
}
