import { useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTelePrompter, useUpdateTelePrompter, TelePrompterConfig } from "@/hooks/useTelePrompter";
import { Play, Pause, RotateCcw, ExternalLink, FlipHorizontal2, Type, Gauge, Trash2, Eraser } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#fde047" },
  { name: "Green", color: "#86efac" },
  { name: "Cyan", color: "#67e8f9" },
  { name: "Pink", color: "#f9a8d4" },
  { name: "Orange", color: "#fdba74" },
];

const TelePrompterControl = () => {
  const { data: config } = useTelePrompter();
  const { mutate: save } = useUpdateTelePrompter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedHtmlRef = useRef<string>("");

  const defaults: TelePrompterConfig = {
    script: "",
    isPlaying: false,
    speed: 3,
    fontSize: 36,
    mirror: false,
    scrollPosition: 0,
  };

  const c = config ?? defaults;

  const update = (partial: Partial<TelePrompterConfig>) => {
    save({ ...c, ...partial });
  };

  const debouncedSaveScript = useCallback(
    (html: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        lastSavedHtmlRef.current = html;
        save({ ...c, script: html });
      }, 500);
    },
    [c, save]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder: "Paste your script here…" }),
      Highlight.configure({ multicolor: true }),
    ],
    content: c.script || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSaveScript(html);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[120px] p-3 text-sm",
      },
    },
  });

  // Sync external changes (from another client) back to editor
  useEffect(() => {
    if (editor && config?.script !== undefined) {
      const currentHtml = editor.getHTML();
      // Only update if the external value differs and wasn't our own save
      if (config.script !== currentHtml && config.script !== lastSavedHtmlRef.current) {
        editor.commands.setContent(config.script || "");
      }
    }
  }, [config?.script, editor]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClear = () => {
    if (editor) {
      editor.commands.clearContent();
      lastSavedHtmlRef.current = "";
      save({ ...c, script: "", isPlaying: false });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5 text-purple-400" />
          TelePrompter
          <a
            href="/teleprompter"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TipTap Editor */}
        <div className="rounded-md border border-input bg-background/50 overflow-hidden">
          <EditorContent editor={editor} />
        </div>

        {/* Highlight toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Highlight:</span>
          {HIGHLIGHT_COLORS.map((h) => (
            <button
              key={h.color}
              title={h.name}
              className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: h.color }}
              onClick={() =>
                editor?.chain().focus().toggleHighlight({ color: h.color }).run()
              }
            />
          ))}
          <button
            title="Remove highlight"
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            onClick={() => editor?.chain().focus().unsetHighlight().run()}
          >
            <Eraser className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={c.isPlaying ? "destructive" : "default"}
            onClick={() => update({ isPlaying: !c.isPlaying })}
            className="gap-1"
          >
            {c.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {c.isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => update({ isPlaying: false, scrollPosition: Date.now() })}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground w-12">Speed</span>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[c.speed]}
            onValueChange={([v]) => update({ speed: v })}
            className="flex-1"
          />
          <span className="text-xs w-6 text-right">{c.speed}</span>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-3">
          <Type className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground w-12">Size</span>
          <Slider
            min={24}
            max={72}
            step={2}
            value={[c.fontSize]}
            onValueChange={([v]) => update({ fontSize: v })}
            className="flex-1"
          />
          <span className="text-xs w-6 text-right">{c.fontSize}</span>
        </div>

        {/* Mirror */}
        <div className="flex items-center gap-3">
          <FlipHorizontal2 className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground">Mirror Mode</span>
          <Switch
            checked={c.mirror}
            onCheckedChange={(v) => update({ mirror: v })}
            className="ml-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TelePrompterControl;
