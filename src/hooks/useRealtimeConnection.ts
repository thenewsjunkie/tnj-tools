import { useRealtimeManager } from './useRealtimeManager';

type DatabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE';

type ChannelConfig = {
  event: DatabaseEvent;
  schema: string;
  table: string;
  filter?: string;
};

export const useRealtimeConnection = (
  channelName: string,
  eventConfig: ChannelConfig,
  onEvent: (payload: any) => void
) => {
  useRealtimeManager(channelName, eventConfig, onEvent);
};