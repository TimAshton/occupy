// shared/gameConstants.js
// Shared between client and server — no framework imports allowed here

export const GAME_CONFIG = {
  BOARD_SIZE: 4,
  STARTING_SETTLERS: 1000,
  TOTAL_SQUARES: 16,
};

export const GAME_STATUS = {
  WAITING: 'waiting',      // lobby, waiting for second player
  ACTIVE: 'active',        // game in progress
  FINISHED: 'finished',    // game over
};

export const PLAYER_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  READY: 'ready',
};

export const TURN_ACTION = {
  CLAIM: 'claim',        // place settlers on empty square
  CHALLENGE: 'challenge', // attack occupied square
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const SQUARE_STATE = {
  EMPTY: 'empty',
  PLAYER_1: 'player1',
  PLAYER_2: 'player2',
};

// Socket event names — single source of truth
export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_GAME: 'join_game',
  CREATE_GAME: 'create_game',
  MAKE_MOVE: 'make_move',
  REJOIN_GAME: 'rejoin_game',
  PLAYER_READY: 'player_ready',

  // Server → Client
  GAME_CREATED: 'game_created',
  GAME_JOINED: 'game_joined',
  GAME_STATE: 'game_state',
  MOVE_RESULT: 'move_result',
  OPPONENT_CONNECTED: 'opponent_connected',
  OPPONENT_DISCONNECTED: 'opponent_disconnected',
  GAME_OVER: 'game_over',
  ERROR: 'error',
};

/**
 * Compute the winner of a square contest.
 * Returns 'attacker' | 'defender' | 'draw'
 */
export function resolveContest(attackerCount, defenderCount) {
  if (attackerCount > defenderCount) return 'attacker';
  if (defenderCount > attackerCount) return 'defender';
  return 'draw'; // draw: attacker loses settlers, defender keeps square
}

/**
 * Check if the game is over: all squares claimed, or one player has no settlers.
 */
export function checkGameOver(gameState) {
  const { board, players } = gameState;
  const allClaimed = board.every(sq => sq.owner !== SQUARE_STATE.EMPTY);
  const p1Out = players.player1.settlers === 0;
  const p2Out = players.player2.settlers === 0;
  return allClaimed || p1Out || p2Out;
}

/**
 * Calculate scores: squares owned by each player.
 */
export function calculateScores(board) {
  return board.reduce(
    (acc, sq) => {
      if (sq.owner === SQUARE_STATE.PLAYER_1) acc.player1++;
      else if (sq.owner === SQUARE_STATE.PLAYER_2) acc.player2++;
      return acc;
    },
    { player1: 0, player2: 0 }
  );
}