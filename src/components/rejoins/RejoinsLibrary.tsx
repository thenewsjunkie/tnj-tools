import { useState, useMemo } from 'react';
import { Plus, Search, Square, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRejoins, Rejoin } from '@/hooks/useRejoins';
import { useSoundPlayer } from '@/hooks/useSoundPlayer';
import { RejoinButton } from './RejoinButton';
import { AddRejoinDialog } from './AddRejoinDialog';
import { EditRejoinDialog } from './EditRejoinDialog';
import { ImportFarragoDialog } from './ImportFarragoDialog';

export function RejoinsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingRejoin, setEditingRejoin] = useState<Rejoin | null>(null);

  const {
    rejoins,
    isLoading,
    createRejoin,
    updateRejoin,
    deleteRejoin,
    importRejoins,
    isCreating,
    isUpdating,
    isImporting,
  } = useRejoins();

  const { playSound, stopAll, isPlaying, playingId, remainingTime } = useSoundPlayer();

  const filteredRejoins = useMemo(() => {
    if (!searchQuery) return rejoins;
    const query = searchQuery.toLowerCase();
    return rejoins.filter(r => r.title.toLowerCase().includes(query));
  }, [rejoins, searchQuery]);

  const handlePlay = (rejoin: Rejoin) => {
    // Convert Rejoin to the format expected by useSoundPlayer
    playSound({
      id: rejoin.id,
      title: rejoin.title,
      audio_url: rejoin.audio_url,
      color: rejoin.color,
      volume: rejoin.volume,
      trim_start: rejoin.trim_start,
      trim_end: rejoin.trim_end,
      duration: rejoin.duration,
      display_order: rejoin.display_order,
      created_at: rejoin.created_at,
      updated_at: rejoin.updated_at,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rejoins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        {playingId && (
          <Button variant="destructive" size="sm" onClick={stopAll}>
            <Square className="h-4 w-4 mr-1 fill-current" />
            Stop
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredRejoins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No matching rejoins found' : 'No rejoins yet. Add one or import from Farrago!'}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredRejoins.map((rejoin) => (
            <RejoinButton
              key={rejoin.id}
              rejoin={rejoin}
              isPlaying={isPlaying(rejoin.id)}
              remainingTime={playingId === rejoin.id ? remainingTime : null}
              onPlay={() => handlePlay(rejoin)}
              onStop={stopAll}
              onEdit={() => setEditingRejoin(rejoin)}
              onDelete={() => deleteRejoin(rejoin.id)}
            />
          ))}
        </div>
      )}

      <AddRejoinDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={createRejoin}
        isLoading={isCreating}
      />

      <EditRejoinDialog
        rejoin={editingRejoin}
        open={!!editingRejoin}
        onOpenChange={(open) => !open && setEditingRejoin(null)}
        onSave={updateRejoin}
        onDelete={deleteRejoin}
        isLoading={isUpdating}
      />

      <ImportFarragoDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={importRejoins}
        isLoading={isImporting}
      />
    </div>
  );
}
