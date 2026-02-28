import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Trash2, ExternalLink } from "lucide-react";
import { useSecretShowsGifters, useAddSecretShowsGifter, useDeleteSecretShowsGifter } from "@/hooks/useSecretShowsGifters";
import { toast } from "sonner";
import secretShowsLogo from "@/assets/secret-shows-logo.png";

const SecretShowsLeaderboard = () => {
  const { data: gifters = [], isLoading } = useSecretShowsGifters(5);
  const addGifter = useAddSecretShowsGifter();
  const deleteGifter = useDeleteSecretShowsGifter();
  const [username, setUsername] = useState("");
  const [giftCount, setGiftCount] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    addGifter.mutate(
      { username: username.trim(), giftCount },
      {
        onSuccess: () => {
          toast.success(`Added ${giftCount} gift(s) for ${username}`);
          setUsername("");
          setGiftCount(1);
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <img src={secretShowsLogo} alt="Secret Shows" className="h-10 w-auto" />
          <CardTitle className="text-amber-400 text-lg">Subscription Gifters</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick add form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-black/30 border-amber-500/20 text-white placeholder:text-gray-500 flex-1"
          />
          <Input
            type="number"
            min={1}
            value={giftCount}
            onChange={(e) => setGiftCount(parseInt(e.target.value) || 1)}
            className="bg-black/30 border-amber-500/20 text-white w-16"
          />
          <Button type="submit" size="sm" disabled={addGifter.isPending} className="bg-amber-600 hover:bg-amber-700 text-black">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Top 5 preview */}
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : gifters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No gifters yet</p>
        ) : (
          <div className="space-y-1">
            {gifters.map((gifter, i) => (
              <div key={gifter.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-black/20">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm w-5 ${i < 3 ? "text-amber-400" : "text-gray-400"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span className="text-white text-sm">{gifter.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-sm">{gifter.total_gifts}</span>
                  <button
                    onClick={() => deleteGifter.mutate(gifter.id, { onSuccess: () => toast.success("Removed") })}
                    className="text-red-400/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/secret-shows-leaderboard"
          className="flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 text-sm transition-colors pt-1"
        >
          <Trophy className="h-4 w-4" />
          View Full Leaderboard
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default SecretShowsLeaderboard;
