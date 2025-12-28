import { useState, useMemo } from 'react';
import { Plus, Search, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSoundEffects, SoundEffect } from '@/hooks/useSoundEffects';
import { useSoundPlayer } from '@/hooks/useSoundPlayer';
import { SoundEffectButton } from './SoundEffectButton';
import { AddSoundDialog } from './AddSoundDialog';
import { EditSoundDialog } from './EditSoundDialog';

export function SoundEffectsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSound, setEditingSound] = useState<SoundEffect | null>(null);

  const {
    soundEffects,
    isLoading,
    createSoundEffect,
    updateSoundEffect,
    deleteSoundEffect,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSoundEffects();

  const { playSound, stopAll, isPlaying, playingId } = useSoundPlayer();

  const filteredSounds = useMemo(() => {
    if (!searchQuery.trim()) return soundEffects;
    const query = searchQuery.toLowerCase();
    return soundEffects.filter((sound) =>
      sound.title.toLowerCase().includes(query)
    );
  }, [soundEffects, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search and Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        {playingId && (
          <Button
            variant="outline"
            size="sm"
            onClick={stopAll}
            className="h-9"
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Sound Grid */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading sounds...
        </div>
      ) : filteredSounds.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {searchQuery ? 'No sounds match your search' : 'No sound effects yet. Add one to get started!'}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredSounds.map((sound) => (
            <SoundEffectButton
              key={sound.id}
              sound={sound}
              isPlaying={isPlaying(sound.id)}
              onPlay={() => playSound(sound)}
              onStop={stopAll}
              onEdit={() => setEditingSound(sound)}
              onDelete={() => deleteSoundEffect(sound.id)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddSoundDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={createSoundEffect}
        isLoading={isCreating}
      />

      <EditSoundDialog
        sound={editingSound}
        open={!!editingSound}
        onOpenChange={(open) => !open && setEditingSound(null)}
        onSave={updateSoundEffect}
        onDelete={deleteSoundEffect}
        isLoading={isUpdating || isDeleting}
      />
    </div>
  );
}
