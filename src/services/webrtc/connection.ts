import { Room, RoomEvent, ConnectionState, RoomOptions } from 'livekit-client';
import { supabase } from "@/integrations/supabase/client";

export class ConnectionManager {
  private connectionTimeout: NodeJS.Timeout | null = null;
  private pendingConnection: Promise<Room> | null = null;
  private currentRoom: Room | null = null;

  async getToken(callId: string): Promise<string> {
    const { data: { token }, error } = await supabase.functions.invoke('get-livekit-token', {
      body: { callId, role: 'publisher' }
    });

    if (error) throw error;
    return token;
  }

  async connect(callId: string): Promise<Room> {
    // If already connected to this room, return the current room
    if (this.currentRoom?.state === 'connected') {
      console.log('Already connected to room:', callId);
      return this.currentRoom;
    }

    // If there's a pending connection, wait for it
    if (this.pendingConnection) {
      console.log('Waiting for pending connection to complete');
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
      
      const cleanup = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.pendingConnection = null;
      };

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
            cleanup();
            room.disconnect();
            reject(new Error('Connection timeout'));
          }, 10000);
        }

        if (state === 'connected') {
          cleanup();
          this.currentRoom = room;
          resolve(room);
        }

        if (state === 'disconnected') {
          cleanup();
          this.currentRoom = null;
          reject(new Error('Connection failed'));
        }
      });

      // Connect to LiveKit room
      room.connect('wss://tnj-tools-2azakdqh.livekit.cloud', token)
        .catch(error => {
          cleanup();
          reject(error);
        });
    }).finally(() => {
      this.pendingConnection = null;
    });

    return this.pendingConnection;
  }

  async disconnect() {
    if (this.currentRoom) {
      console.log('Disconnecting from room');
      await this.currentRoom.disconnect();
      this.currentRoom = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.pendingConnection = null;
  }
}