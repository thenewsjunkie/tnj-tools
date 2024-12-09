import { Room, RoomEvent, ConnectionState, RoomOptions } from 'livekit-client';
import { supabase } from "@/integrations/supabase/client";

export class ConnectionManager {
  private connectionTimeout: NodeJS.Timeout | null = null;
  private pendingConnection: Promise<Room> | null = null;

  async getToken(callId: string): Promise<string> {
    const { data: { token }, error } = await supabase.functions.invoke('get-livekit-token', {
      body: { callId, role: 'publisher' }
    });

    if (error) throw error;
    return token;
  }

  async connect(callId: string): Promise<Room> {
    // If there's already a connection attempt in progress, return it
    if (this.pendingConnection) {
      return this.pendingConnection;
    }

    const token = await this.getToken(callId);
    
    this.pendingConnection = new Promise<Room>((resolve, reject) => {
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: { simulcast: true },
      };

      const room = new Room(roomOptions);

      // Set up connection state monitoring
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('Connection state changed:', state);
        
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        if (state === 'connecting') {
          this.connectionTimeout = setTimeout(() => {
            console.log('Connection timeout, cleaning up');
            room.disconnect();
            reject(new Error('Connection timeout'));
          }, 10000);
        }

        if (state === 'connected') {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          resolve(room);
        }

        if (state === 'disconnected') {
          reject(new Error('Connection failed'));
        }
      });

      // Connect to LiveKit room
      room.connect('wss://tnj-tools-2azakdqh.livekit.cloud', token)
        .catch(error => {
          reject(error);
        });
    }).finally(() => {
      this.pendingConnection = null;
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    });

    return this.pendingConnection;
  }
}