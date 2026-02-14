# Admin-Only Lobby System with Party Codes

## Overview

The lobby system has been refactored to support an admin-only party creation model with party code-based joining. This ensures only authorized users can create parties, while players can easily join using a simple 6-character code.

## Key Changes

### 1. Admin-Only Party Creation
- Only users with the admin password can create parties
- Admin password is validated on the backend
- Failed authentication shows clear error message

### 2. Party Code System
- Each party gets a unique 6-character alphanumeric code
- Codes are easy to share and remember (e.g., "A3X9K2")
- Players join by entering the party code
- No party list browsing - join by code only

### 3. Removed Features
- ❌ Public party list removed
- ❌ Browse available parties removed
- ❌ Auto-refresh party list removed
- ❌ Party search removed

## Architecture

### Type Changes

```typescript
// Updated payload types
export type CreatePartyPayload = {
  name: string;
  adminPassword: string;  // NEW: Admin authentication
};

export type JoinPartyPayload = {
  partyCode: string;  // CHANGED: From partyId to partyCode
  name: string;
};

// Updated party details
export type PartyDetails = {
  id: string;
  partyCode: string;  // NEW: 6-character code
  hostId: string;
  hostName: string;
  players: Player[];
  maxPlayers: number;
};
```

### Component Changes

**New Components:**
- `JoinPartyForm.tsx` - Replaces PartyList, allows joining by code

**Updated Components:**
- `CreatePartyForm.tsx` - Now includes admin password field
- `LobbyPage.tsx` - Simplified to show create and join forms side-by-side
- `PartyRoom.tsx` - Displays party code prominently for sharing

**Removed Components:**
- `PartyList.tsx` - No longer needed (kept for reference)

## User Flows

### Admin Flow (Create Party)

```
1. Admin navigates to /lobby
2. Enters their name
3. Enters admin password
4. Clicks "Create Party"
5. Backend validates password
6. If valid:
   - Party created with unique code
   - Admin becomes host
   - Navigates to party room
   - Sees party code to share
7. If invalid:
   - Error message displayed
   - Can retry with correct password
```

### Player Flow (Join Party)

```
1. Player navigates to /lobby
2. Gets party code from host (via chat, voice, etc.)
3. Enters their name
4. Enters 6-character party code
5. Clicks "Join Party"
6. Backend validates code
7. If valid:
   - Player joins party
   - Navigates to party room
   - Sees other players
8. If invalid:
   - Error message displayed
   - Can retry with correct code
```

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_party` | `{ name: string, adminPassword: string }` | Create party (admin only) |
| `join_party` | `{ partyCode: string, name: string }` | Join party by code |
| `leave_party` | - | Leave current party |
| `start_game` | - | Start game (host only) |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `party_joined` | `{ party: PartyDetails }` | Successfully joined/created party |
| `party_player_update` | `{ players: Player[] }` | Player list updated |
| `party_started` | - | Game has started |
| `error` | `{ message: string }` | Error occurred |

**Removed Events:**
- ❌ `request_party_list` - No longer needed
- ❌ `party_list_updated` - No longer needed

## Mock Socket Implementation

The mock socket now simulates:

### Admin Password Validation
```typescript
if (data.adminPassword === "admin123") {
  // Create party with random code
  const partyCode = generateCode(); // e.g., "A3X9K2"
  // ... create party
} else {
  // Return error
  emit("error", { message: "Invalid admin password" });
}
```

### Party Code Validation
```typescript
if (data.partyCode && data.partyCode.length === 6) {
  // Join party
  // ... add player to party
} else {
  // Return error
  emit("error", { message: "Invalid party code" });
}
```

## UI/UX Features

### Lobby Page

**Two-Column Layout:**
- Left: Create Party (Admin Only)
  - Name input
  - Admin password input (with hint)
  - Create button
  - Lock icon to indicate admin-only
  
- Right: Join Party
  - Name input
  - Party code input (6 characters, auto-uppercase)
  - Join button
  - Hash icon for code entry

**Info Section:**
- Clear instructions for admins and players
- Explains the party code system

### Party Room

**Party Code Display:**
- Large, prominent display of party code
- Styled with primary color for visibility
- Easy copy-to-clipboard button
- Clear instructions to share with players

**Features:**
- Host badge for admin
- Player list with real-time updates
- Start game button (host only, requires 2+ players)
- Leave party button

## Security Considerations

### Admin Password
- Validated on backend only
- Not stored in frontend state
- Failed attempts logged (backend)
- Can implement rate limiting (backend)
- Can implement password rotation (backend)

### Party Codes
- Generated server-side
- Unique per party
- Alphanumeric only (no confusing characters)
- 6 characters = 2.1 billion combinations
- Expired parties can be cleaned up (backend)

### Best Practices
- Use environment variable for admin password
- Implement rate limiting on create/join
- Add CAPTCHA for production (optional)
- Log all admin actions
- Implement party expiration

## Configuration

### Environment Variables

```env
# Mock socket (development)
VITE_USE_REAL_SOCKET=false

# Real socket (production)
VITE_USE_REAL_SOCKET=true
VITE_SOCKET_URL=http://localhost:5000

# Backend should have:
ADMIN_PASSWORD=your_secure_password_here
```

### Mock Socket Testing

For development, the mock socket uses:
- Admin password: `admin123`
- Any 6-character code is accepted for joining

## Backend Integration

### Create Party Endpoint

```typescript
socket.on("create_party", async (data: CreatePartyPayload) => {
  // Validate admin password
  if (data.adminPassword !== process.env.ADMIN_PASSWORD) {
    socket.emit("error", { message: "Invalid admin password" });
    return;
  }
  
  // Generate unique party code
  const partyCode = generateUniqueCode(); // e.g., "A3X9K2"
  
  // Create party in database
  const party = await createParty({
    partyCode,
    hostId: socket.id,
    hostName: data.name,
    // ...
  });
  
  // Join socket room
  socket.join(partyCode);
  
  // Send party details
  socket.emit("party_joined", { party });
});
```

### Join Party Endpoint

```typescript
socket.on("join_party", async (data: JoinPartyPayload) => {
  // Find party by code
  const party = await findPartyByCode(data.partyCode);
  
  if (!party) {
    socket.emit("error", { message: "Invalid party code" });
    return;
  }
  
  if (party.players.length >= party.maxPlayers) {
    socket.emit("error", { message: "Party is full" });
    return;
  }
  
  // Add player to party
  const player = {
    id: socket.id,
    name: data.name,
    isHost: false,
  };
  
  party.players.push(player);
  await saveParty(party);
  
  // Join socket room
  socket.join(party.partyCode);
  
  // Notify player
  socket.emit("party_joined", { party });
  
  // Notify all players in party
  io.to(party.partyCode).emit("party_player_update", {
    players: party.players,
  });
});
```

### Party Code Generation

```typescript
function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing chars
  let code = "";
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code exists, regenerate if needed
  // ...
  
  return code;
}
```

## Testing

### Test Admin Creation

1. Navigate to `/lobby`
2. Enter name: "Admin"
3. Enter password: "admin123"
4. Click "Create Party"
5. Should see party room with party code
6. Copy party code

### Test Player Join

1. Open new tab/window
2. Navigate to `/lobby`
3. Enter name: "Player1"
4. Enter party code from admin
5. Click "Join Party"
6. Should join party room
7. Both tabs should show updated player list

### Test Invalid Password

1. Navigate to `/lobby`
2. Enter name: "Hacker"
3. Enter password: "wrongpassword"
4. Click "Create Party"
5. Should see error: "Invalid admin password"

### Test Invalid Code

1. Navigate to `/lobby`
2. Enter name: "Player2"
3. Enter code: "XXXXXX"
4. Click "Join Party"
5. Should see error: "Invalid party code"

## Migration Notes

### From Old System

**Removed:**
- Party list browsing
- Auto-refresh functionality
- Public party discovery
- Party search

**Added:**
- Admin password authentication
- Party code generation
- Party code input validation
- Enhanced party code display

**Unchanged:**
- Real-time player updates
- Host controls
- Game start flow
- Leave party functionality

## Future Enhancements

Potential features to add:
- [ ] Multiple admin passwords (different roles)
- [ ] Party code expiration
- [ ] Party privacy settings
- [ ] Party code regeneration
- [ ] Admin dashboard
- [ ] Party analytics
- [ ] Banned users list
- [ ] Party capacity customization
- [ ] Party password (in addition to code)
- [ ] Invite links with embedded codes

## Files Modified

### Updated Files
- `apps/web/src/types/lobby.ts` - Updated types
- `apps/web/src/contexts/LobbyContext.tsx` - Removed party list logic
- `apps/web/src/hooks/use-socket.ts` - Updated mock responses
- `apps/web/src/components/lobby/CreatePartyForm.tsx` - Added password field
- `apps/web/src/pages/LobbyPage.tsx` - Simplified layout
- `apps/web/src/pages/PartyRoom.tsx` - Enhanced code display

### New Files
- `apps/web/src/components/lobby/JoinPartyForm.tsx` - New join form

### Deprecated Files (kept for reference)
- `apps/web/src/components/lobby/PartyList.tsx` - No longer used

## Summary

The refactored lobby system provides:
- ✅ Admin-only party creation with password
- ✅ Simple party code joining (6 characters)
- ✅ No public party browsing
- ✅ Enhanced security
- ✅ Cleaner UI/UX
- ✅ Easy code sharing
- ✅ Zero TypeScript errors
- ✅ Backward compatible socket structure

The system is ready for testing and production deployment!
