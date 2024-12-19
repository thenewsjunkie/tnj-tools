import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emojis } from "./emoji-data/emojis";
import CustomEmoteManager from "./CustomEmoteManager";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmojiGrid from "./emoji-grid/EmojiGrid";
import EmojiSearch from "./emoji-search/EmojiSearch";

interface EmojiPickerProps {
  onEmojiSelect: (symbol: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customEmotes, setCustomEmotes] = useState<Array<{ name: string; symbol: string }>>([]);
  const [showAddEmote, setShowAddEmote] = useState(false);

  useEffect(() => {
    fetchCustomEmotes();
  }, []);

  const fetchCustomEmotes = async () => {
    const { data, error } = await supabase
      .from('custom_emotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomEmotes(data.map(emote => ({
        name: emote.name,
        symbol: emote.image_url
      })));
    }
  };

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomEmotes = customEmotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use the larger list's length to set minimum height
  const minGridHeight = Math.ceil(Math.max(emojis.length, customEmotes.length) / 8) * 32;

  return (
    <Tabs defaultValue="emojis">
      <TabsList className="w-full bg-white/5">
        <TabsTrigger value="emojis" className="flex-1">
          Emojis
        </TabsTrigger>
        <TabsTrigger value="emotes" className="flex-1">
          Emotes
        </TabsTrigger>
      </TabsList>
      <div className="p-2">
        <EmojiSearch value={searchQuery} onChange={setSearchQuery} />
        <TabsContent 
          value="emojis" 
          className="m-0"
          style={{ minHeight: `${minGridHeight}px` }}
        >
          <EmojiGrid items={filteredEmojis} onSelect={onEmojiSelect} />
        </TabsContent>
        <TabsContent 
          value="emotes" 
          className="m-0 space-y-4"
          style={{ minHeight: `${minGridHeight}px` }}
        >
          <div className="flex justify-end">
            <Dialog open={showAddEmote} onOpenChange={setShowAddEmote}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Emote
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Emote</DialogTitle>
                </DialogHeader>
                <CustomEmoteManager />
              </DialogContent>
            </Dialog>
          </div>
          <EmojiGrid items={filteredCustomEmotes} onSelect={onEmojiSelect} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EmojiPicker;