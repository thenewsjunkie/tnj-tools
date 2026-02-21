import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List, Upload, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LibraryToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
}

export default function LibraryToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: LibraryToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recently Read</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="author">Author</SelectItem>
          <SelectItem value="added">Date Added</SelectItem>
          <SelectItem value="progress">Progress</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewChange("grid")}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewChange("list")}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button onClick={() => navigate("/books/upload")} className="ml-2">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
}
