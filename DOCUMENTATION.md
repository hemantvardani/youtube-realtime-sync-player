# Watch Party - Technical Documentation

## Architecture Overview

The application follows a **client-server architecture** with real-time synchronization using WebSockets.

### How It Works

1. **Server as Single Source of Truth**
   - The backend maintains a single global video state (video ID, playback position, play/pause status)
   - When any client performs an action (play, pause, seek), the server updates its state and broadcasts to all connected clients

2. **Real-time Communication**
   - Socket.io handles bidirectional communication between server and clients
   - Server emits events: `INIT`, `PLAY`, `PAUSE`, `SEEK`, `RESET`
   - Clients emit events: `INIT`, `PLAY`, `PAUSE`, `SEEK`, `RESET`

3. **Client Synchronization**
   - Each client maintains local state via Redux that mirrors server state
   - YouTube IFrame API controls actual video playback
   - Periodic drift correction (every 2 seconds) ensures clients stay in sync even with network delays
   - Tab visibility detection syncs players when users switch tabs

4. **Time Synchronization Logic**
   - Server tracks `startedAt` timestamp (when playback started) and `currentPosition` (frozen position when paused)
   - Server calculates `currentTimeStamp` = `(serverTimeNow - startedAt) / 1000` when playing
   - Clients receive `currentTimeStamp` + `serverTimeNow` to account for network delay
   - Clients compute expected time: `currentTimeStamp + (clientTimeNow - serverTimeNow) / 1000`
   - If actual player time drifts > 1 second from expected, client seeks to correct position

### Data Flow

```
User Action (Play/Pause/Seek)
    ↓
Client sends event to server with currentTime
    ↓
Server updates state (startedAt, currentPosition, isPlaying)
    ↓
Server broadcasts event to ALL clients with currentTimeStamp + serverTimeNow
    ↓
All clients update Redux state
    ↓
YouTube player reacts to Redux state changes
    ↓
Periodic sync corrects any drift
```

## Key Technical Decisions

### 1. **Socket.io over Raw WebSockets**
   - **Why**: Built-in reconnection handling, fallback to polling 
   - **Trade-off**: Slightly larger bundle size, but much more reliable for production

### 2. **Server-Side State Management**
   - **Why**: Single source of truth prevents conflicts when multiple users interact simultaneously
   - **Alternative considered**: Peer-to-peer sync, but too complex and unreliable

### 3. **Redux for Client State**
   - **Why**: Centralized state makes it easy to sync YouTube player with server state
   - **Alternative considered**: Context API, but Redux provides better DevTools and predictable updates

### 4. **YouTube IFrame API over react-player**
   - **Why**: Direct API access gives more control over playback, seeking, and state management
   - **Trade-off**: More boilerplate, but better synchronization accuracy

### 5. **Periodic Drift Correction**
   - **Why**: Network delays, tab inactivity cause time drift
   - **Implementation**: Every 2 seconds, compare expected vs actual time, seek if drift > 1 second
   - **Trade-off**: Occasional small "jumps" in playback, but keeps all clients in sync

### 6. **Event Suppression Mechanism**
   - **Why**: When we programmatically control the player (via server sync), YouTube's `onStateChange` fires and would create a feedback loop
   - **Implementation**: Set a flag for 1.5 seconds after programmatic actions to ignore native events
 

## Known Limitations

1. **Single Global Session**
   - All users watch the same video - no support for multiple rooms/sessions
   - **Improvement**: Add room-based sessions with unique room IDs

2. **No User Authentication**
   - Anyone can control playback
   - **Improvement**: Add user roles (host/viewer) or voting system for control

3. **State Lost on Server Restart**
   - Server state is in-memory, so restart loses current video/position
   - **Improvement**: Persist state to Redis or database

4. **YouTube API Limitations**
   - Can't control autoplay in some browsers
   - Some videos may have restrictions (age-restricted, region-blocked)
   - **Improvement**: Add fallback player or better error handling

5. **Time Drift on Slow Networks**
   - Large network delays (>2 seconds) may cause noticeable sync issues
   - **Improvement**: Adaptive sync interval based on network latency
 