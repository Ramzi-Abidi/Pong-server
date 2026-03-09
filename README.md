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

## Game Flow

1. **Room Creation**: Player 1 creates a room and gets a 4-letter code
2. **Room Joining**: Player 2 joins using the code
3. **Ready State**: Both players mark themselves as ready
4. **Game Start**: Server starts the 60 FPS game loop
5. **Gameplay**: Players send paddle movements, server updates physics
6. **Game End**: First to 10 points wins, server broadcasts result
