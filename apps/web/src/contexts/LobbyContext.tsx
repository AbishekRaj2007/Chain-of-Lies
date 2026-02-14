import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import type {
  LobbyState,
  User,
  Party,
  PartyDetails,
  CreatePartyPayload,
  JoinPartyPayload,
  PartyJoinedPayload,
  PartyPlayerUpdatePayload,
  PartyListUpdatePayload,
} from "@/types/lobby";

interface LobbyContextValue extends LobbyState {
  // Actions
  setUser: (user: User) => void;
  createParty: (name: string, adminPassword: string) => void;
  joinParty: (partyCode: string, name: string) => void;
  leaveParty: () => void;
  startGame: () => void;
  clearError: () => void;
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

export function useLobby() {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error("useLobby must be used within LobbyProvider");
  }
  return context;
}

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  
  const [state, setState] = useState<LobbyState>({
    user: null,
    currentParty: null,
    availableParties: [],
    isLoading: false,
    error: null,
  });

  // Set user
  const setUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  // Create party (admin only)
  const createParty = useCallback((name: string, adminPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const payload: CreatePartyPayload = { name, adminPassword };
    socket.emit("create_party", payload);
  }, [socket]);

  // Join party using party code
  const joinParty = useCallback((partyCode: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const payload: JoinPartyPayload = { partyCode, name };
    socket.emit("join_party", payload);
  }, [socket]);

  // Leave party
  const leaveParty = useCallback(() => {
    socket.emit("leave_party");
    setState(prev => ({ ...prev, currentParty: null }));
  }, [socket]);

  // Start game (host only)
  const startGame = useCallback(() => {
    if (!state.currentParty) return;
    
    const isHost = state.currentParty.players.some(
      p => p.id === state.user?.id && p.isHost
    );
    
    if (!isHost) {
      setState(prev => ({ ...prev, error: "Only the host can start the game" }));
      return;
    }

    socket.emit("start_game");
  }, [socket, state.currentParty, state.user]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Socket event listeners
  useEffect(() => {
    // Party joined
    const handlePartyJoined = (data: PartyJoinedPayload) => {
      setState(prev => {
        // Auto-set user if not already set
        const currentPlayer = data.party.players.find(p => p.isHost && !prev.user);
        const user = prev.user || (currentPlayer ? { id: currentPlayer.id, name: currentPlayer.name } : null);
        
        return {
          ...prev,
          user,
          currentParty: data.party,
          isLoading: false,
          error: null,
        };
      });
    };

    // Party player update
    const handlePartyPlayerUpdate = (data: PartyPlayerUpdatePayload) => {
      setState(prev => {
        if (!prev.currentParty) return prev;
        
        return {
          ...prev,
          currentParty: {
            ...prev.currentParty,
            players: data.players,
          },
        };
      });
    };

    // Party started
    const handlePartyStarted = () => {
      // Game will handle navigation
      console.log("Party started - game beginning");
    };

    // Error handling
    const handleError = (error: { message: string }) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    };

    // Register listeners
    socket.on("party_joined", handlePartyJoined);
    socket.on("party_player_update", handlePartyPlayerUpdate);
    socket.on("party_started", handlePartyStarted);
    socket.on("error", handleError);

    // Cleanup
    return () => {
      socket.off("party_joined", handlePartyJoined);
      socket.off("party_player_update", handlePartyPlayerUpdate);
      socket.off("party_started", handlePartyStarted);
      socket.off("error", handleError);
    };
  }, [socket]);

  const value: LobbyContextValue = {
    ...state,
    setUser,
    createParty,
    joinParty,
    leaveParty,
    startGame,
    clearError,
  };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
}
