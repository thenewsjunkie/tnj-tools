import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Notepad from "@/components/admin/show-prep/Notepad";
import type { Json } from "@/integrations/supabase/types";

const NotepadPage = () => {
  const [notepad, setNotepad] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      hasLoadedRef.current = false;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "notepad_content")
          .maybeSingle();
        if (error) throw error;
        const val = data?.value as { content?: string } | null;
        setNotepad(val?.content || "");
      } catch (error) {
        console.error("Error loading notepad:", error);
        toast({ title: "Error", description: "Could not load notepad", variant: "destructive" });
      } finally {
        setIsLoading(false);
        setTimeout(() => { hasLoadedRef.current = true; }, 100);
      }
    };
    load();
  }, [toast]);

  // Debounced save
  useEffect(() => {
    if (isLoading || !hasLoadedRef.current) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await supabase.from("system_settings").upsert({
          key: "notepad_content",
          value: { content: notepad } as unknown as Json,
        }, { onConflict: "key" });
      } catch (error) {
        console.error("Error saving notepad:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notepad, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          <span className="text-sm font-medium">Notepad</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Notepad
          value={notepad}
          onChange={setNotepad}
          isOpen={true}
          onToggle={() => {}}
        />
      )}
    </div>
  );
};

export default NotepadPage;
