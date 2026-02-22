# Pong Online Multiplayer Server

Backend server for real-time multiplayer Pong game using Socket.io and Node.

## Features

- **Real-time multiplayer** - Two players can play together over the internet
- **Room-based matchmaking** - Create or join rooms with 4-letter codes
- **Server-authoritative physics** - Prevents cheating and ensures both players see the same game state
- **60 FPS game loop** - Smooth gameplay experience
- **WebSocket communication** - Low-latency bidirectional communication

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **TypeScript** - Type-safe development
- **CORS** - Cross-origin resource sharing

## Installation

```bash
# Clone the repository
git clone https://github.com/Ramzi-Abidi/Pong-server.git
cd Pong-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## Environment Variables

Create a `.env` file with the following:

```env
PORT=3001
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```
The server will automatically restart on file changes.

### Production Mode
```bash
npm run build
npm start
```

## API Documentation

### Socket.io Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ playerName: string }` | Creates a new game room |
| `join_room` | `{ roomCode: string, playerName: string }` | Joins an existing room |
| `player_ready` | `{ roomCode: string }` | Marks player as ready to start |
| `paddle_move` | `{ roomCode: string, direction: 'up' | 'down' | 'stop' }` | Sends paddle movement input |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room_created` | `{ roomCode: string, playerNumber: 1 | 2 }` | Room created successfully |
| `room_joined` | `{ roomCode: string, playerNumber: 1 | 2 }` | Room joined successfully |
| `player_joined` | `{ players: PlayerInfo[] }` | Another player joined the room |
| `player_ready_status` | `{ players: PlayerInfo[] }` | Updated ready status of players |
| `game_start` | `{ gameState: GameState }` | Game starts with initial state |
| `game_state` | `{ gameState: GameState }` | Current game state (60 FPS) |
| `goal_scored` | `{ playerScored: number, score: Score }` | A goal was scored |
| `game_over` | `{ winner: number, winnerName: string }` | Game ended with winner |
| `opponent_disconnected` | - | Opponent left the game |
| `error` | `{ message: string }` | Error occurred |

### Data Types

```typescript
interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  score: Score;
  isPlaying: boolean;
  gameId: string;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  stopPlayer: boolean;
}

interface Ball {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

interface Score {
  [key: number]: number; // { 1: number, 2: number }
}
```

## Game Flow

1. **Room Creation**: Player 1 creates a room and gets a 4-letter code
2. **Room Joining**: Player 2 joins using the code
3. **Ready State**: Both players mark themselves as ready
4. **Game Start**: Server starts the 60 FPS game loop
5. **Gameplay**: Players send paddle movements, server updates physics
6. **Game End**: First to 10 points wins, server broadcasts result

## Deployment

### Render.com (Recommended)

1. Push this repository to GitHub
2. Go to [Render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Set environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
6. Build Command: `npm install && npm run build`
7. Start Command: `npm start`

### Railway

1. Push to GitHub
2. Connect repository to [Railway](https://railway.app)
3. Railway will auto-detect Node.js and deploy

## Frontend Integration

The frontend should connect to this server using Socket.io:

```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-server-url.onrender.com');

// Listen for game state updates
socket.on('game_state', (data) => {
  // Update your canvas with data.gameState
});

// Send paddle movements
socket.emit('paddle_move', {
  roomCode: 'ABCD',
  direction: 'up'
});
```

## Architecture

```
Client A ←→ WebSocket ←→ Server ←→ WebSocket ←→ Client B
                              ↓
                         Game Physics Engine
                         (60 FPS Loop)
                              ↓
                         Room Management
                         (Matchmaking)
```

## Performance

- **60 FPS updates** for smooth gameplay
- **Efficient collision detection** using bounding box checks
- **Memory-efficient room storage** using Map data structure
- **Automatic cleanup** of disconnected players

## Security

- **Server-authoritative physics** prevents client-side cheating
- **Room code validation** prevents unauthorized access
- **CORS configuration** restricts origins in production

## Development

```bash
# Install new dependencies
npm install socket.io@latest

# Run in development with auto-restart
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT License - see LICENSE file for details
