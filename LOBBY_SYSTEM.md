# Multiplayer Lobby System

## Overview

The lobby system enables players to create and join parties before starting a multiplayer game. It uses a party-based architecture with real-time updates via Socket.io.

## Architecture

### Component Hierarchy

```
App
├── LobbyProvider (Global State)
│   └── GameProvider
│       └── Router
│           ├── /lobby → LobbyPage
│           │   ├── CreatePartyForm
│           │   └── PartyList
│           ├── /party → PartyRoom
│           │   └── PlayerList
│           └── /game → GameView
```

### State Management

**LobbyContext** (`apps/web/src/contexts/LobbyContext.tsx`)
- Manages global lobby state
- Handles socket event listeners
- Provides actions for party operations

**State Structure:**
```typescript
{
  user: User | null,              // Current user info
  currentParty: PartyDetails | null,  // Party user is in
  availableParties: Party[],      // List of joinable parties
  isLoading: boolean,             // Loading state
  error: string | null            // Error messages
}
```

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_party` | `{ name: string }` | Create new party with host name |
| `join_party` | `{ partyId: string, name: string }` | Join existing party |
| `leave_party` | - | Leave current party |
| `start_game` | - | Start game (host only) |
| `request_party_list` | - | Request list of available parties |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `party_list_updated` | `{ parties: Party[] }` | Updated list of parties |
| `party_joined` | `{ party: PartyDetails }` | Successfully joined party |
| `party_player_update` | `{ players: Player[] }` | Player list updated |
| `party_started` | - | Game has started |
| `error` | `{ message: string }` | Error occurred |

## Components

### Pages

**LobbyPage** (`apps/web/src/pages/LobbyPage.tsx`)
- Main lobby interface
- Shows available parties
- Create party form
- Auto-refreshes party list every 5 seconds

**PartyRoom** (`apps/web/src/pages/PartyRoom.tsx`)
- Party waiting room
- Shows player list with real-time updates
- Host can start game
- Players can leave party

### Lobby Components

**PartyList** (`apps/web/src/components/lobby/PartyList.tsx`)
- Displays available parties
- Shows player count and host name
- Join button for each party
- Shows "Full" badge when at capacity

**CreatePartyForm** (`apps/web/src/components/lobby/CreatePartyForm.tsx`)
- Form to create new party
- Validates party name
- Shows loading state

**PlayerList** (`apps/web/src/components/lobby/PlayerList.tsx`)
- Shows players in current party
- Highlights current user
- Shows host badge
- Displays empty slots

## Mock Socket Implementation

For development without a backend, the system uses a mock socket that simulates server responses.

**Location:** `apps/web/src/hooks/use-socket.ts`

**Features:**
- Simulates 300ms network delay
- Returns mock party data
- Triggers appropriate events
- Can be swapped for real socket.io

**Configuration:**
```env
# Use mock socket (default)
VITE_USE_REAL_SOCKET=false

# Use real socket.io connection
VITE_USE_REAL_SOCKET=true
VITE_SOCKET_URL=http://localhost:5000
```

## User Flow

### Creating a Party

1. User enters name in CreatePartyForm
2. Clicks "Create Party"
3. `create_party` event emitted
4. Server responds with `party_joined`
5. User navigated to PartyRoom
6. User becomes host

### Joining a Party

1. User sees party in PartyList
2. Clicks "Join" button
3. If no name set, prompted for name
4. `join_party` event emitted
5. Server responds with `party_joined`
6. User navigated to PartyRoom

### Starting a Game

1. Host sees "Start Game" button
2. Button enabled when ≥2 players
3. Host clicks button
4. `start_game` event emitted
5. Server broadcasts `party_started`
6. All players navigate to /game

## Type Definitions

**Location:** `apps/web/src/types/lobby.ts`

```typescript
type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

type Party = {
  id: string;
  hostName: string;
  playerCount: number;
  maxPlayers?: number;
};

type PartyDetails = {
  id: string;
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
};

type User = {
  id: string;
  name: string;
};
```

## Backend Integration

To integrate with a real backend:

1. **Set environment variable:**
   ```env
   VITE_USE_REAL_SOCKET=true
   VITE_SOCKET_URL=http://your-backend-url
   ```

2. **Implement server-side socket handlers:**
   ```typescript
   io.on('connection', (socket) => {
     socket.on('create_party', (data) => {
       // Create party logic
       socket.emit('party_joined', { party });
     });
     
     socket.on('join_party', (data) => {
       // Join party logic
       socket.emit('party_joined', { party });
       socket.to(partyId).emit('party_player_update', { players });
     });
     
     // ... other handlers
   });
   ```

3. **No frontend changes needed** - the socket hook automatically switches between mock and real socket based on environment variable.

## Features

✅ Create party with custom name
✅ Join existing parties
✅ Real-time player list updates
✅ Host-only game start
✅ Party capacity limits (8 players)
✅ Error handling and display
✅ Loading states
✅ Auto-refresh party list
✅ Copy party ID to clipboard
✅ Leave party functionality
✅ Mock socket for development
✅ Easy backend integration

## Testing

### Manual Testing (Mock Socket)

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/lobby`

3. Test creating a party:
   - Enter a name
   - Click "Create Party"
   - Should navigate to party room

4. Test joining (open in another browser/tab):
   - See created party in list
   - Click "Join"
   - Enter name
   - Should join party

5. Test starting game:
   - As host, click "Start Game"
   - Should navigate to /game

### Testing with Real Backend

1. Set up backend with socket.io
2. Update `.env`:
   ```env
   VITE_USE_REAL_SOCKET=true
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. Follow manual testing steps above

## Next Steps

- [ ] Add party settings (max players, game mode)
- [ ] Add kick player functionality (host only)
- [ ] Add ready/not ready status
- [ ] Add chat in party room
- [ ] Add party privacy (public/private)
- [ ] Add party passwords
- [ ] Add reconnection handling
- [ ] Add player avatars/colors
- [ ] Add party invites via link
- [ ] Persist party state on refresh

## Files Modified/Created

### Created Files
- `apps/web/src/types/lobby.ts` - Type definitions
- `apps/web/src/contexts/LobbyContext.tsx` - Global state management
- `apps/web/src/hooks/use-socket.ts` - Socket.io hook with mock
- `apps/web/src/pages/LobbyPage.tsx` - Main lobby page
- `apps/web/src/pages/PartyRoom.tsx` - Party waiting room
- `apps/web/src/components/lobby/PartyList.tsx` - Party list component
- `apps/web/src/components/lobby/CreatePartyForm.tsx` - Create party form
- `apps/web/src/components/lobby/PlayerList.tsx` - Player list component

### Modified Files
- `apps/web/src/App.tsx` - Added LobbyProvider and routes
- `.env.example` - Added socket configuration

## Notes

- All UI components (Alert, Input, Avatar, etc.) already exist in the project
- No TypeScript errors or warnings
- Mock socket provides realistic development experience
- Backend integration requires zero frontend code changes
- Navigation handled via wouter (no page reloads)
