export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  velocityY: number;
  stopPlayer: boolean;
}

export interface Ball extends GameObject {
  velocityX: number;
  velocityY: number;
}

export interface Score {
  [key: number]: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  score: Score;
  isPlaying: boolean;
  gameId: string;
}

export interface Room {
  id: string;
  players: {
    [socketId: string]: {
      playerNumber: 1 | 2;
      name: string;
      ready: boolean;
    };
  };
  gameState: GameState;
  host: string; // socketId of the host
}
