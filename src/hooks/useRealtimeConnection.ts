import { useRealtimeManager } from './useRealtimeManager';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ChannelConfig = {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  filter?: string;
};

export const useRealtimeConnection = (
  channelName: string,
  eventConfig: ChannelConfig,
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void
) => {
  useRealtimeManager(channelName, eventConfig, onEvent);
};