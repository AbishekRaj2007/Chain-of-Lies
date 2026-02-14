# Lobby System - Flow Diagram

## User Flow Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                         START APPLICATION                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Landing Page  │
                    │   (/)          │
                    └────────┬───────┘
                             │
                             │ Click "Play"
                             ▼
                    ┌────────────────┐
                    │  Lobby Page    │
                    │  (/lobby)      │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────┐
    │  Create Party     │     │  Join Party      │
    │  - Enter name     │     │  - Select party  │
    │  - Click create   │     │  - Enter name    │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              │ emit: create_party     │ emit: join_party
              │                        │
              └────────────┬───────────┘
                           │
                           │ on: party_joined
                           ▼
                  ┌────────────────┐
                  │  Party Room    │
                  │  (/party)      │
                  │                │
                  │  - Player List │
                  │  - Party ID    │
                  │  - Settings    │
                  └────────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Wait   │  │  Join   │  │  Leave  │
        │         │  │  More   │  │  Party  │
        └─────────┘  └─────────┘  └────┬────┘
                           │            │
                           │            │ Back to lobby
                           │            ▼
                           │      ┌──────────┐
                           │      │  Lobby   │
                           │      └──────────┘
                           │
                           │ Host clicks "Start Game"
                           │ emit: start_game
                           │
                           │ on: party_started
                           ▼
                  ┌────────────────┐
                  │   Game View    │
                  │   (/game)      │
                  │                │
                  │  - GameEngine  │
                  │  - HUD         │
                  │  - Overlays    │
                  └────────────────┘
```

## Component Hierarchy

```
App
├── QueryClientProvider
│   └── TooltipProvider
│       └── LobbyProvider ◄── Manages lobby state
│           └── GameProvider ◄── Manages game state
│               └── Router
│                   ├── / → LandingPage
│                   │
│                   ├── /lobby → LobbyPage
│                   │   ├── CreatePartyForm
│                   │   │   └── Input, Button
│                   │   └── PartyList
│                   │       └── Card, Badge, Button
│                   │
│                   ├── /party → PartyRoom
│                   │   ├── PlayerList
│                   │   │   └── Avatar, Badge
│                   │   └── Button (Start Game)
│                   │
│                   └── /game → GameView
│                       ├── GameEngine
│                       ├── HUD
│                       └── Overlays
```

## Socket Event Flow

```
┌──────────────┐                                    ┌──────────────┐
│   CLIENT     │                                    │   SERVER     │
│              │                                    │   (Mock)     │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │ 1. request_party_list                            │
       │ ──────────────────────────────────────────────►  │
       │                                                   │
       │                    2. party_list_updated         │
       │  ◄──────────────────────────────────────────────  │
       │     { parties: [...] }                           │
       │                                                   │
       │ 3. create_party                                  │
       │ ──────────────────────────────────────────────►  │
       │     { name: "Alice" }                            │
       │                                                   │
       │                    4. party_joined               │
       │  ◄──────────────────────────────────────────────  │
       │     { party: {...} }                             │
       │                                                   │
       │ 5. join_party                                    │
       │ ──────────────────────────────────────────────►  │
       │     { partyId: "123", name: "Bob" }              │
       │                                                   │
       │                    6. party_joined               │
       │  ◄──────────────────────────────────────────────  │
       │     { party: {...} }                             │
       │                                                   │
       │                    7. party_player_update        │
       │  ◄──────────────────────────────────────────────  │
       │     { players: [...] }                           │
       │                                                   │
       │ 8. start_game                                    │
       │ ──────────────────────────────────────────────►  │
       │                                                   │
       │                    9. party_started              │
       │  ◄──────────────────────────────────────────────  │
       │                                                   │
       ▼                                                   ▼
  Navigate to /game                              Broadcast to all
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      LobbyContext                            │
│                                                              │
│  State:                                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ user: User | null                                   │    │
│  │ currentParty: PartyDetails | null                   │    │
│  │ availableParties: Party[]                           │    │
│  │ isLoading: boolean                                  │    │
│  │ error: string | null                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Actions:                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ setUser(user)                                       │    │
│  │ createParty(name)                                   │    │
│  │ joinParty(partyId, name)                            │    │
│  │ leaveParty()                                        │    │
│  │ startGame()                                         │    │
│  │ requestPartyList()                                  │    │
│  │ clearError()                                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Socket Listeners:                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ on("party_list_updated")                            │    │
│  │ on("party_joined")                                  │    │
│  │ on("party_player_update")                           │    │
│  │ on("party_started")                                 │    │
│  │ on("error")                                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Provides state & actions
                              ▼
                    ┌──────────────────┐
                    │   Components     │
                    │                  │
                    │  - LobbyPage     │
                    │  - PartyRoom     │
                    │  - PartyList     │
                    │  - PlayerList    │
                    │  - CreateForm    │
                    └──────────────────┘
```

## Mock Socket Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                      MockSocket                              │
│                                                              │
│  emit(event, data)                                          │
│  ──────────────────────────────────────────────────────►    │
│                                                              │
│  setTimeout(() => {                                         │
│    switch(event) {                                          │
│      case "request_party_list":                             │
│        trigger("party_list_updated", mockParties)           │
│      case "create_party":                                   │
│        trigger("party_joined", newParty)                    │
│      case "join_party":                                     │
│        trigger("party_joined", existingParty)               │
│      case "start_game":                                     │
│        trigger("party_started", {})                         │
│    }                                                         │
│  }, 300ms) ◄── Simulates network delay                      │
│                                                              │
│  ◄──────────────────────────────────────────────────────    │
│  trigger(event, data) → calls registered listeners          │
└─────────────────────────────────────────────────────────────┘
```

## Real-Time Update Flow

```
Player 1 (Host)                    Player 2
     │                                 │
     │ Creates party                   │
     │ ─────────►                      │
     │           Server                │
     │           creates party         │
     │ ◄─────────                      │
     │ party_joined                    │
     │                                 │
     │                                 │ Joins party
     │                                 │ ─────────►
     │                                 │           Server
     │                                 │           adds player
     │ party_player_update             │ ◄─────────
     │ ◄───────────────────────────────┤ party_joined
     │ (sees Player 2 join)            │
     │                                 │
     │                                 │
     │ Starts game                     │
     │ ─────────►                      │
     │           Server                │
     │           broadcasts            │
     │ ◄─────────                      │ ◄─────────
     │ party_started                   │ party_started
     │                                 │
     ▼                                 ▼
Navigate to /game              Navigate to /game
```

## Error Handling Flow

```
User Action
    │
    ▼
Validation
    │
    ├─► Valid ──────► emit event ──────► Server
    │                                      │
    │                                      ├─► Success
    │                                      │   └─► Update state
    │                                      │
    │                                      └─► Error
    │                                          └─► emit("error")
    │                                              └─► Display alert
    │
    └─► Invalid ───► Show error message
```

## Navigation Flow

```
Landing (/)
    │
    ├─► Click "Play" ──────────────────────► Lobby (/lobby)
    │                                             │
    │                                             ├─► Create Party ──► Party Room (/party)
    │                                             │                         │
    │                                             └─► Join Party ────────►  │
    │                                                                       │
    │                                                                       ├─► Leave ──► Lobby
    │                                                                       │
    │                                                                       └─► Start ──► Game (/game)
    │
    └─► Direct navigation ──────────────────────► Any route
```

## Key Features Illustrated

1. **Party Creation**: User enters name → Creates party → Becomes host
2. **Party Joining**: User selects party → Enters name → Joins party
3. **Real-Time Updates**: All players see changes instantly
4. **Host Controls**: Only host can start game
5. **Navigation**: Smooth transitions without page reloads
6. **Error Handling**: Clear error messages with dismiss option
7. **Loading States**: Visual feedback during operations
8. **Mock Socket**: Works without backend for development
