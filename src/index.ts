import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Room, GameState } from './types';
import { createInitialGameState, updateGameState } from './gameLogic';
import { GAME_CONFIG } from './constants';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development, allow all. In production, restrict to your Netlify domain.
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// In-memory store for rooms
const rooms = new Map<string, Room>();

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new room
  socket.on('create_room', (data: { playerName: string }) => {
    const roomCode = generateRoomCode();
    
    const newRoom: Room = {
      id: roomCode,
      host: socket.id,
      players: {
        [socket.id]: {
          playerNumber: 1,
          name: data.playerName || 'Player 1',
          ready: false,
        },
      },
      gameState: createInitialGameState(roomCode),
    };

    rooms.set(roomCode, newRoom);
    socket.join(roomCode);
    
    socket.emit('room_created', { roomCode, playerNumber: 1 });
    console.log(`Room ${roomCode} created by ${socket.id}`);
  });

  // Join an existing room
  socket.on('join_room', (data: { roomCode: string; playerName: string }) => {
    const { roomCode, playerName } = data;
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const playerKeys = Object.keys(room.players);
    if (playerKeys.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Add player 2 to the room
    room.players[socket.id] = {
      playerNumber: 2,
      name: playerName || 'Player 2',
      ready: false,
    };

    socket.join(roomCode);
    socket.emit('room_joined', { roomCode, playerNumber: 2 });
    
    // Notify others in the room
    io.to(roomCode).emit('player_joined', { 
      players: Object.values(room.players).map(p => ({ name: p.name, playerNumber: p.playerNumber }))
    });
    
    console.log(`User ${socket.id} joined room ${roomCode}`);
  });

  // Player ready to start
  socket.on('player_ready', (data: { roomCode: string }) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (!room || !room.players[socket.id]) return;

    room.players[socket.id].ready = true;

    // Check if both players are ready
    const allPlayersReady = Object.values(room.players).length === 2 && 
                           Object.values(room.players).every(p => p.ready);

    io.to(roomCode).emit('player_ready_status', { 
      players: Object.values(room.players)
    });

    if (allPlayersReady && !room.gameState.isPlaying) {
      room.gameState.isPlaying = true;
      io.to(roomCode).emit('game_start', { gameState: room.gameState });
      console.log(`Game started in room ${roomCode}`);
    }
  });

  // Handle paddle movement
  socket.on('paddle_move', (data: { roomCode: string; direction: 'up' | 'down' | 'stop' }) => {
    const { roomCode, direction } = data;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameState.isPlaying) return;

    const playerNumber = room.players[socket.id]?.playerNumber;
    if (!playerNumber) return;

    const player = playerNumber === 1 ? room.gameState.player1 : room.gameState.player2;

    if (direction === 'up') {
      player.velocityY = -GAME_CONFIG.PLAYER_VELOCITY;
      player.stopPlayer = false;
    } else if (direction === 'down') {
      player.velocityY = GAME_CONFIG.PLAYER_VELOCITY;
      player.stopPlayer = false;
    } else if (direction === 'stop') {
      player.stopPlayer = true;
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find rooms where the user was
    rooms.forEach((room, roomCode) => {
      if (room.players[socket.id]) {
        // Notify the other player
        io.to(roomCode).emit('opponent_disconnected');
        
        // Remove the room
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted due to disconnect`);
      }
    });
  });
});

// Game loop (60 FPS)
setInterval(() => {
  rooms.forEach((room, roomCode) => {
    if (room.gameState.isPlaying) {
      const { state, goal, winner } = updateGameState(room);
      
      // Emit state to players
      io.to(roomCode).emit('game_state', { gameState: state });

      // Handle goals
      if (goal > 0) {
        io.to(roomCode).emit('goal_scored', { playerScored: goal, score: state.score });
      }

      // Handle win
      if (winner > 0) {
        io.to(roomCode).emit('game_over', { 
          winner, 
          winnerName: Object.values(room.players).find(p => p.playerNumber === winner)?.name 
        });
        
        // Reset room ready states so they can play again
        Object.values(room.players).forEach(p => p.ready = false);
      }
    }
  });
}, 1000 / GAME_CONFIG.FPS);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
