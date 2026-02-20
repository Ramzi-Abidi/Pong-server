import { Room, GameState, Player, Ball } from './types';
import { GAME_CONFIG, INITIAL_VELOCITY_X, INITIAL_VELOCITY_Y } from './constants';

export const createInitialGameState = (gameId: string): GameState => {
  return {
    gameId,
    isPlaying: false,
    score: { 1: 0, 2: 0 },
    player1: {
      x: GAME_CONFIG.PLAYER_OFFSET,
      y: GAME_CONFIG.BOARD_HEIGHT / 2,
      width: GAME_CONFIG.PLAYER_WIDTH,
      height: GAME_CONFIG.PLAYER_HEIGHT,
      velocityY: 0,
      stopPlayer: false,
    },
    player2: {
      x: GAME_CONFIG.BOARD_WIDTH - GAME_CONFIG.PLAYER_WIDTH - GAME_CONFIG.PLAYER_OFFSET,
      y: GAME_CONFIG.BOARD_HEIGHT / 2,
      width: GAME_CONFIG.PLAYER_WIDTH,
      height: GAME_CONFIG.PLAYER_HEIGHT,
      velocityY: 0,
      stopPlayer: false,
    },
    ball: {
      x: GAME_CONFIG.BOARD_WIDTH / 2,
      y: GAME_CONFIG.BOARD_HEIGHT / 2,
      width: GAME_CONFIG.BALL_SIZE,
      height: GAME_CONFIG.BALL_SIZE,
      velocityX: INITIAL_VELOCITY_X,
      velocityY: INITIAL_VELOCITY_Y,
    },
  };
};

const detectCollision = (a: Player | Ball, b: Player | Ball): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const outOfBound = (y: number): boolean => {
  return y < 0 || y + GAME_CONFIG.PLAYER_HEIGHT > GAME_CONFIG.BOARD_HEIGHT;
};

const resetBall = (state: GameState, direction: number) => {
  state.ball = {
    x: GAME_CONFIG.BOARD_WIDTH / 2,
    y: GAME_CONFIG.BOARD_HEIGHT / 2,
    width: GAME_CONFIG.BALL_SIZE,
    height: GAME_CONFIG.BALL_SIZE,
    velocityX: direction,
    velocityY: INITIAL_VELOCITY_Y,
  };
};

export const updateGameState = (room: Room): { state: GameState, goal: number, winner: number } => {
  const { gameState } = room;
  let goal = 0; // 0 = no goal, 1 = player 1 scored, 2 = player 2 scored
  let winner = 0; // 0 = no winner, 1 = player 1 won, 2 = player 2 won

  if (!gameState.isPlaying) return { state: gameState, goal, winner };

  const player1 = gameState.player1;
  const player2 = gameState.player2;
  const ball = gameState.ball;

  // Move player 1
  if (!outOfBound(player1.y + player1.velocityY)) {
    if (!player1.stopPlayer) {
      player1.y += player1.velocityY;
    }
  }

  // Move player 2
  if (!outOfBound(player2.y + player2.velocityY)) {
    if (!player2.stopPlayer) {
      player2.y += player2.velocityY;
    }
  }

  // Move ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y + ball.height >= GAME_CONFIG.BOARD_HEIGHT) {
    ball.velocityY *= -1;
  }

  // Ball collision with paddles
  if (detectCollision(ball, player1)) {
    if (ball.x <= player1.x + player1.width) {
      ball.velocityX *= -1;
    }
  } else if (detectCollision(ball, player2)) {
    if (ball.x + GAME_CONFIG.BALL_SIZE >= player2.x) {
      ball.velocityX *= -1;
    }
  }

  // Scoring
  if (ball.x < 0) {
    gameState.score[2] += 1;
    goal = 2;
    resetBall(gameState, INITIAL_VELOCITY_X * -1);
  } else if (ball.x + GAME_CONFIG.BALL_SIZE > GAME_CONFIG.BOARD_WIDTH) {
    gameState.score[1] += 1;
    goal = 1;
    resetBall(gameState, INITIAL_VELOCITY_X);
  }

  // Check for winner
  if (gameState.score[1] >= GAME_CONFIG.WINNING_SCORE) {
    gameState.isPlaying = false;
    winner = 1;
  } else if (gameState.score[2] >= GAME_CONFIG.WINNING_SCORE) {
    gameState.isPlaying = false;
    winner = 2;
  }

  return { state: gameState, goal, winner };
};
