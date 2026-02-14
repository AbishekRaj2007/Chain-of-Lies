# Lobby System - Quick Start Guide (Admin + Party Code)

## Testing the Admin Lobby System

The lobby now uses an admin-only creation model with party codes. No backend setup needed for testing!

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to the Lobby

Open your browser and go to:
```
http://localhost:5173/lobby
```

### 3. Test Creating a Party (Admin)

1. Enter your name (e.g., "Admin")
2. Enter admin password: `admin123`
3. Click "Create Party"
4. You'll be taken to the party room
5. You'll see a 6-character party code (e.g., "A3X9K2")
6. Copy the party code using the "Copy Code" button

### 4. Test Joining a Party (Player)

1. Open a second browser tab/window
2. Go to `http://localhost:5173/lobby`
3. Enter a different name (e.g., "Player1")
4. Enter the party code you copied
5. Click "Join Party"
6. You'll join the party room

### 5. Test Real-Time Updates

1. In the admin tab, you should see the new player appear
2. The player count updates automatically
3. Both tabs show the same player list

### 6. Test Starting the Game

1. In the admin tab (host), click "Start Game"
2. Both tabs should navigate to `/game`
3. The game view will load with the 2D canvas

### 7. Test Invalid Admin Password

1. Open a new tab to `/lobby`
2. Enter a name
3. Enter wrong password (e.g., "wrongpass")
4. Click "Create Party"
5. You'll see error: "Invalid admin password"

### 8. Test Invalid Party Code

1. Open a new tab to `/lobby`
2. Enter a name
3. Enter invalid code (e.g., "XXXXXX")
4. Click "Join Party"
5. You'll see error: "Invalid party code"

## Mock Socket Behavior

The mock socket simulates:
- Admin password validation (accepts "admin123")
- Party code generation (random 6-character codes)
- Party code validation (accepts any 6-character code)
- Player join/leave events
- Game start events
- 300ms network delay

## Switching to Real Backend

When your backend is ready:

1. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Update the socket configuration:
   ```env
   VITE_USE_REAL_SOCKET=true
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

The frontend will now connect to your real backend!

## Expected Backend Socket Events

Your backend should implement these socket.io events:

### Server Listens For:
- `create_party` - Create new party (with admin password validation)
- `join_party` - Join party by code
- `leave_party` - Leave current party
- `start_game` - Start the game (host only)

### Server Emits:
- `party_joined` - Confirm party join/creation
- `party_player_update` - Update player list
- `party_started` - Game has started
- `error` - Send error message

See `LOBBY_ADMIN_SYSTEM.md` for detailed event payloads and implementation guide.

## Troubleshooting

### "Invalid admin password"
- Use "admin123" for testing with mock socket
- Check for typos in password field
- In production, use environment variable

### "Invalid party code"
- Code must be exactly 6 characters
- Code is case-insensitive (auto-converted to uppercase)
- Get code from party host
- Check for typos

### Player list not updating
- Make sure both tabs are in the same party
- Check browser console for socket events
- Mock socket logs all events to console

### Can't start game
- Need at least 2 players in party
- Only host can start game
- Check for host badge (crown icon)

### Navigation not working
- Check browser console for errors
- Verify wouter routes in App.tsx
- Clear browser cache and reload

## Features to Test

✅ Create party with admin password
✅ Join party with party code
✅ See real-time player updates
✅ Host badge display
✅ Start game (host only)
✅ Leave party
✅ Copy party code
✅ Party capacity (8 players max)
✅ Empty player slots display
✅ Error messages (invalid password/code)
✅ Loading states
✅ 6-character code validation

## Next Steps

Once you've tested the lobby:
1. Implement backend socket handlers
2. Test with real backend
3. Add additional features (chat, settings, etc.)
4. Deploy to production

## Need Help?

Check these files:
- `LOBBY_ADMIN_SYSTEM.md` - Admin system documentation
- `LOBBY_SYSTEM.md` - Original system documentation
- `apps/web/src/hooks/use-socket.ts` - Socket implementation
- `apps/web/src/contexts/LobbyContext.tsx` - State management
- `apps/web/src/pages/LobbyPage.tsx` - Lobby UI
- `apps/web/src/pages/PartyRoom.tsx` - Party room UI
