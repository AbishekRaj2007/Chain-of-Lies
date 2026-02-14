import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Socket.io hook for multiplayer functionality
 * 
 * This is a placeholder implementation that can be replaced
 * with real socket.io connection when backend is ready.
 */

// Mock socket for development
class MockSocket {
  private listeners: Map<string, Function[]> = new Map();
  private connected = false;

  connect() {
    this.connected = true;
    console.log("[MockSocket] Connected");
  }

  disconnect() {
    this.connected = false;
    console.log("[MockSocket] Disconnected");
  }

  emit(event: string, data?: any) {
    console.log("[MockSocket] Emit:", event, data);
    
    // Simulate server responses for development
    setTimeout(() => {
      switch (event) {
        case "create_party":
          // Validate admin password (mock validation)
          if (data.adminPassword === "admin123") {
            const partyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            this.trigger("party_joined", {
              party: {
                id: `party-${Date.now()}`,
                partyCode: partyCode,
                hostId: "user-1",
                hostName: data.name,
                players: [
                  { id: "user-1", name: data.name, isHost: true },
                ],
                maxPlayers: 8,
              },
            });
          } else {
            this.trigger("error", {
              message: "Invalid admin password",
            });
          }
          break;
        
        case "join_party":
          // Mock party code validation
          if (data.partyCode && data.partyCode.length === 6) {
            this.trigger("party_joined", {
              party: {
                id: "party-123",
                partyCode: data.partyCode,
                hostId: "host-1",
                hostName: "Host Player",
                players: [
                  { id: "host-1", name: "Host Player", isHost: true },
                  { id: `user-${Date.now()}`, name: data.name, isHost: false },
                ],
                maxPlayers: 8,
              },
            });
          } else {
            this.trigger("error", {
              message: "Invalid party code",
            });
          }
          break;
        
        case "start_game":
          this.trigger("party_started", {});
          break;
      }
    }, 300);
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private trigger(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

let socketInstance: Socket | MockSocket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | MockSocket | null>(null);

  useEffect(() => {
    // Create socket instance if it doesn't exist
    if (!socketInstance) {
      // Check if we should use real socket or mock
      const useRealSocket = import.meta.env.VITE_USE_REAL_SOCKET === "true";
      
      if (useRealSocket) {
        // Real socket.io connection
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        socketInstance = io(socketUrl, {
          transports: ["websocket", "polling"],
          autoConnect: true,
        });
        console.log("[Socket] Connected to:", socketUrl);
      } else {
        // Mock socket for development
        socketInstance = new MockSocket();
        (socketInstance as MockSocket).connect();
      }
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // Only disconnect when app closes
    };
  }, []);

  return socketRef.current || new MockSocket();
}

// Cleanup function for app shutdown
export function disconnectSocket() {
  if (socketInstance) {
    if ("disconnect" in socketInstance) {
      socketInstance.disconnect();
    }
    socketInstance = null;
  }
}
