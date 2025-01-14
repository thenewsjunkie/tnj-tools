import { useRealtimeManager } from './useRealtimeManager';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export const useRealtimeConnection = (
  channelName: string,
  eventConfig: {
    event: RealtimeEvent;
    schema: string;
    table: string;
    filter?: string;
  },
  onEvent: (payload: any) => void
) => {
  useRealtimeManager(channelName, eventConfig, onEvent);
};