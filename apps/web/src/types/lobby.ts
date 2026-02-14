/**
 * Lobby and Party Types
 * Shared types for multiplayer lobby system
 */

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

export type Party = {
  id: string;
  hostName: string;
  playerCount: number;
  maxPlayers?: number;
};

export type PartyDetails = {
  id: string;
  partyCode: string;
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
};

export type User = {
  id: string;
  name: string;
};

export type LobbyState = {
  user: User | null;
  currentParty: PartyDetails | null;
  availableParties: Party[];
  isLoading: boolean;
  error: string | null;
};

// Socket event payloads
export type CreatePartyPayload = {
  name: string;
  adminPassword: string;
};

export type JoinPartyPayload = {
  partyCode: string;
  name: string;
};

export type PartyJoinedPayload = {
  party: PartyDetails;
};

export type PartyPlayerUpdatePayload = {
  players: Player[];
};

export type PartyListUpdatePayload = {
  parties: Party[];
};
