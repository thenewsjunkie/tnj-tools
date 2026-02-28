import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Trash2, ExternalLink, Upload, GripVertical, Pencil } from "lucide-react";
import {
  useHallOfFramePhotos,
  useAddHallOfFramePhoto,
  useDeleteHallOfFramePhoto,
  useReorderHallOfFramePhotos,
  useHallOfFrameSettings,
  useUpdateHallOfFrameSettings,
  useUpdateHallOfFrameCaption,
  HallOfFramePhoto,
} from "@/hooks/useHallOfFrame";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";

const SortablePhoto = ({ photo, onDelete, onUpdateCaption }: { photo: HallOfFramePhoto; onDelete: (p: HallOfFramePhoto) => void; onUpdateCaption: (id: string, caption: string | null) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(photo.caption || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const trimmed = editValue.trim();
    onUpdateCaption(photo.id, trimmed || null);
    setEditing(false);
  };

  const cancel = () => {
    setEditValue(photo.caption || "");
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-black/20 rounded p-2">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <img src={photo.image_url} alt={photo.caption || "Photo"} className="h-12 w-12 object-cover rounded" />
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          className="text-sm bg-black/30 border border-blue-500/30 rounded px-2 py-1 text-foreground flex-1 outline-none focus:border-blue-400"
        />
      ) : (
        <button onClick={() => { setEditValue(photo.caption || ""); setEditing(true); }} className="text-sm text-foreground truncate flex-1 text-left flex items-center gap-1 hover:text-blue-300 transition-colors">
          <span className="truncate">{photo.caption || "No caption"}</span>
          <Pencil className="h-3 w-3 opacity-50 shrink-0" />
        </button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onDelete(photo)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const HallOfFrame = () => {
  const { data: photos = [] } = useHallOfFramePhotos();
  const { data: settings } = useHallOfFrameSettings();
  const addPhoto = useAddHallOfFramePhoto();
  const deletePhoto = useDeleteHallOfFramePhoto();
  const reorder = useReorderHallOfFramePhotos();
  const updateSettings = useUpdateHallOfFrameSettings();
  const updateCaption = useUpdateHallOfFrameCaption();

  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        addPhoto.mutate({ file, caption: caption || undefined });
      });
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    },
    [addPhoto, caption]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);
    reorder.mutate(reordered.map((p, i) => ({ id: p.id, display_order: i })));
  };

  return (
    <Card className="bg-black/40 border-blue-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg">
            <Image className="h-5 w-5 text-blue-400" />
            Hall of Frame
          </CardTitle>
          <Link to="/hall-of-frame" target="_blank">
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              <ExternalLink className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver ? "border-blue-400 bg-blue-500/10" : "border-muted-foreground/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Drop photos or GIFs here or click to upload</p>
          <div className="flex gap-2 justify-center items-end">
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-black/30 border-blue-500/20 text-white max-w-48"
            />
            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={addPhoto.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.gif"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {/* Settings */}
        <div className="flex gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Interval (sec)</Label>
            <Input
              type="number"
              min={2}
              max={120}
              value={settings?.interval_seconds ?? 8}
              onChange={(e) => updateSettings.mutate({ interval_seconds: parseInt(e.target.value) || 8 })}
              className="bg-black/30 border-blue-500/20 text-white w-20"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Transition</Label>
            <Select
              value={settings?.transition ?? "fade"}
              onValueChange={(v) => updateSettings.mutate({ transition: v })}
            >
              <SelectTrigger className="bg-black/30 border-blue-500/20 text-white w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Photo list */}
        {photos.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {photos.map((photo) => (
                  <SortablePhoto key={photo.id} photo={photo} onDelete={(p) => deletePhoto.mutate(p)} onUpdateCaption={(id, caption) => updateCaption.mutate({ id, caption })} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No photos yet. Upload some above!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HallOfFrame;
