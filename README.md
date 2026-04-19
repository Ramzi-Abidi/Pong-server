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
CORS_ORIGINS=https://your-frontend.example.com
```

## Running the Server

### Development Mode
```bash
npm run dev
```
