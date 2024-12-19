import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Comprehensive emoji data organized by categories
const emojis = [
  // Smileys & Emotion
  { name: "grinning", symbol: "😀" },
  { name: "smiley", symbol: "😃" },
  { name: "smile", symbol: "😄" },
  { name: "grin", symbol: "😁" },
  { name: "laughing", symbol: "😆" },
  { name: "joy", symbol: "😂" },
  { name: "rofl", symbol: "🤣" },
  { name: "wink", symbol: "😉" },
  { name: "blush", symbol: "😊" },
  { name: "innocent", symbol: "😇" },
  { name: "heart_eyes", symbol: "😍" },
  { name: "star_struck", symbol: "🤩" },
  { name: "kissing_heart", symbol: "😘" },
  { name: "kissing", symbol: "😗" },
  { name: "relaxed", symbol: "☺️" },
  { name: "kissing_closed_eyes", symbol: "😚" },
  { name: "kissing_smiling_eyes", symbol: "😙" },
  { name: "yum", symbol: "😋" },
  { name: "stuck_out_tongue", symbol: "😛" },
  { name: "stuck_out_tongue_winking_eye", symbol: "😜" },
  { name: "stuck_out_tongue_closed_eyes", symbol: "😝" },
  { name: "drooling_face", symbol: "🤤" },
  { name: "thinking", symbol: "🤔" },
  { name: "zipper_mouth", symbol: "🤐" },
  { name: "neutral_face", symbol: "😐" },
  { name: "expressionless", symbol: "😑" },
  { name: "no_mouth", symbol: "😶" },
  { name: "smirk", symbol: "😏" },
  { name: "unamused", symbol: "😒" },
  { name: "rolling_eyes", symbol: "🙄" },
  { name: "grimacing", symbol: "😬" },
  { name: "lying_face", symbol: "🤥" },
  { name: "relieved", symbol: "😌" },
  { name: "pensive", symbol: "😔" },
  { name: "sleepy", symbol: "😪" },
  { name: "drooling", symbol: "🤤" },
  { name: "sleeping", symbol: "😴" },
  { name: "mask", symbol: "😷" },
  { name: "thermometer_face", symbol: "🤒" },
  { name: "head_bandage", symbol: "🤕" },
  { name: "nauseated", symbol: "🤢" },
  { name: "sneezing", symbol: "🤧" },
  { name: "hot", symbol: "🥵" },
  { name: "cold", symbol: "🥶" },
  { name: "woozy", symbol: "🥴" },
  { name: "dizzy_face", symbol: "😵" },
  { name: "exploding_head", symbol: "🤯" },
  { name: "cowboy", symbol: "🤠" },
  { name: "partying", symbol: "🥳" },
  { name: "sunglasses", symbol: "😎" },
  { name: "nerd", symbol: "🤓" },
  { name: "monocle", symbol: "🧐" },
  { name: "confused", symbol: "😕" },
  { name: "worried", symbol: "😟" },
  { name: "slightly_frowning", symbol: "🙁" },
  { name: "white_frowning", symbol: "☹️" },
  { name: "open_mouth", symbol: "😮" },
  { name: "hushed", symbol: "😯" },
  { name: "astonished", symbol: "😲" },
  { name: "flushed", symbol: "😳" },
  { name: "pleading", symbol: "🥺" },
  { name: "frowning", symbol: "😦" },
  { name: "anguished", symbol: "😧" },
  { name: "fearful", symbol: "😨" },
  { name: "cold_sweat", symbol: "😰" },
  { name: "disappointed_relieved", symbol: "😥" },
  { name: "cry", symbol: "😢" },
  { name: "sob", symbol: "😭" },
  { name: "scream", symbol: "😱" },
  { name: "confounded", symbol: "😖" },
  { name: "persevere", symbol: "😣" },
  { name: "disappointed", symbol: "😞" },
  { name: "sweat", symbol: "😓" },
  { name: "weary", symbol: "😩" },
  { name: "tired", symbol: "😫" },
  { name: "yawning", symbol: "🥱" },
  { name: "triumph", symbol: "😤" },
  { name: "rage", symbol: "😡" },
  { name: "angry", symbol: "😠" },
  { name: "cursing", symbol: "🤬" },
  { name: "smiling_imp", symbol: "😈" },
  { name: "imp", symbol: "👿" },
  { name: "skull", symbol: "💀" },
  { name: "skull_crossbones", symbol: "☠️" },
  { name: "poop", symbol: "💩" },
  { name: "clown", symbol: "🤡" },
  { name: "ghost", symbol: "👻" },
  { name: "alien", symbol: "👽" },
  { name: "robot", symbol: "🤖" },
];

// Reaction emotes and symbols
const emotes = [
  // Hearts & Love
  { name: "heart", symbol: "❤️" },
  { name: "orange_heart", symbol: "🧡" },
  { name: "yellow_heart", symbol: "💛" },
  { name: "green_heart", symbol: "💚" },
  { name: "blue_heart", symbol: "💙" },
  { name: "purple_heart", symbol: "💜" },
  { name: "black_heart", symbol: "🖤" },
  { name: "brown_heart", symbol: "🤎" },
  { name: "white_heart", symbol: "🤍" },
  { name: "broken_heart", symbol: "💔" },
  { name: "heart_exclamation", symbol: "❣️" },
  { name: "two_hearts", symbol: "💕" },
  { name: "revolving_hearts", symbol: "💞" },
  { name: "heartbeat", symbol: "💓" },
  { name: "heartpulse", symbol: "💗" },
  { name: "sparkling_heart", symbol: "💖" },
  { name: "cupid", symbol: "💘" },
  { name: "gift_heart", symbol: "💝" },
  { name: "heart_decoration", symbol: "💟" },
  
  // Hands & Gestures
  { name: "clap", symbol: "👏" },
  { name: "raised_hands", symbol: "🙌" },
  { name: "wave", symbol: "👋" },
  { name: "thumbsup", symbol: "👍" },
  { name: "thumbsdown", symbol: "👎" },
  { name: "punch", symbol: "👊" },
  { name: "fist", symbol: "✊" },
  { name: "victory", symbol: "✌️" },
  { name: "ok_hand", symbol: "👌" },
  { name: "pinching_hand", symbol: "🤏" },
  { name: "pray", symbol: "🙏" },
  
  // Symbols & Objects
  { name: "100", symbol: "💯" },
  { name: "trophy", symbol: "🏆" },
  { name: "medal", symbol: "🏅" },
  { name: "military_medal", symbol: "🎖️" },
  { name: "1st_place", symbol: "🥇" },
  { name: "2nd_place", symbol: "🥈" },
  { name: "3rd_place", symbol: "🥉" },
  { name: "star", symbol: "⭐" },
  { name: "glowing_star", symbol: "🌟" },
  { name: "sparkles", symbol: "✨" },
  { name: "dizzy", symbol: "💫" },
  { name: "boom", symbol: "💥" },
  { name: "fire", symbol: "🔥" },
  { name: "rocket", symbol: "🚀" },
  { name: "crown", symbol: "👑" },
  { name: "gem", symbol: "💎" },
  { name: "bell", symbol: "🔔" },
  { name: "tada", symbol: "🎉" },
  { name: "confetti", symbol: "🎊" },
  { name: "balloon", symbol: "🎈" },
  { name: "eyes", symbol: "👀" },
  { name: "check_mark", symbol: "✅" },
  { name: "x_mark", symbol: "❌" },
  { name: "warning", symbol: "⚠️" },
];

interface EmojiPickerProps {
  onEmojiSelect: (symbol: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmotes = emotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Tabs defaultValue="emojis">
      <TabsList className="w-full bg-white/5">
        <TabsTrigger value="emojis" className="flex-1">Emojis</TabsTrigger>
        <TabsTrigger value="emotes" className="flex-1">Emotes</TabsTrigger>
      </TabsList>
      <div className="p-2">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2 bg-white/5 border-white/10 text-white placeholder:text-white/50"
        />
        <TabsContent value="emojis" className="m-0">
          <div className="grid grid-cols-8 gap-1 max-h-[300px] overflow-y-auto">
            {filteredEmojis.map((emoji) => (
              <Button
                key={emoji.name}
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
                onClick={() => onEmojiSelect(emoji.symbol)}
              >
                {emoji.symbol}
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="emotes" className="m-0">
          <div className="grid grid-cols-8 gap-1 max-h-[300px] overflow-y-auto">
            {filteredEmotes.map((emote) => (
              <Button
                key={emote.name}
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
                onClick={() => onEmojiSelect(emote.symbol)}
              >
                {emote.symbol}
              </Button>
            ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EmojiPicker;