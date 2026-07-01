// server/src/game/engine.js
import {
  GAME_CONFIG,
  SQUARE_STATE,
  TURN_ACTION,
  GAME_STATUS,
  resolveContest,
  checkGameOver,
  calculateScores,
} from '../../../shared/gameConstants.js';

/**
 * Build a fresh, empty board: array of 100 square objects.
 */
export function createBoard() {
  return Array.from({ length: GAME_CONFIG.TOTAL_SQUARES }, (_, i) => ({
    index: i,
    owner: SQUARE_STATE.EMPTY,
    settlers: 0,
  }));
}

/**
 * Build the initial players state.
 */
export function createPlayersState(p1Name = 'Player 1', p2Name = 'Player 2') {
  return {
    player1: { name: p1Name, settlers: GAME_CONFIG.STARTING_SETTLERS },
    player2: { name: p2Name, settlers: GAME_CONFIG.STARTING_SETTLERS },
  };
}

/**
 * Apply a move to the game state.
 * Returns { newState, result } where result describes what happened.
 *
 * move = {
 *   playerRole: 'player1' | 'player2',
 *   squareIndex: number,
 *   action: 'claim' | 'challenge',
 *   settlers: number,           // how many settlers to commit
 * }
 */
export function applyMove(state, move) {
  const { board, players, currentTurn } = state;
  const { playerRole, squareIndex, action, settlers } = move;

  // ── Validation ────────────────────────────────────────────────────────────
  if (playerRole !== currentTurn) {
    return { error: 'Not your turn' };
  }
  if (squareIndex < 0 || squareIndex >= GAME_CONFIG.TOTAL_SQUARES) {
    return { error: 'Invalid square' };
  }
  if (!Number.isInteger(settlers) || settlers < 1) {
    return { error: 'Must commit at least 1 settler' };
  }
  if (settlers > players[playerRole].settlers) {
    return { error: 'Not enough settlers' };
  }

  const square = board[squareIndex];
  const opponent = playerRole === 'player1' ? 'player2' : 'player1';

  // Shallow clone to avoid mutation
  const newBoard = board.map(sq => ({ ...sq }));
  const newPlayers = {
    player1: { ...players.player1 },
    player2: { ...players.player2 },
  };

  let result;

  if (action === TURN_ACTION.CLAIM) {
    // ── Claim: square must be empty ──────────────────────────────────────
    if (square.owner !== SQUARE_STATE.EMPTY) {
      return { error: 'Square is already occupied — use challenge instead' };
    }
    newBoard[squareIndex] = {
      index: squareIndex,
      owner: playerRole === 'player1' ? SQUARE_STATE.PLAYER_1 : SQUARE_STATE.PLAYER_2,
      settlers,
    };
    newPlayers[playerRole].settlers -= settlers;
    result = { action: TURN_ACTION.CLAIM, squareIndex, settlers, winner: playerRole };

  } else if (action === TURN_ACTION.CHALLENGE) {
    // ── Challenge: square must be owned by opponent ───────────────────────
    if (square.owner === SQUARE_STATE.EMPTY) {
      return { error: 'Square is empty — use claim instead' };
    }
    if (
      (playerRole === 'player1' && square.owner === SQUARE_STATE.PLAYER_1) ||
      (playerRole === 'player2' && square.owner === SQUARE_STATE.PLAYER_2)
    ) {
      return { error: 'You already own this square' };
    }

    const defenderCount = square.settlers;
    const contestResult = resolveContest(settlers, defenderCount);

    // Attacker always loses their committed settlers
    newPlayers[playerRole].settlers -= settlers;

    if (contestResult === 'attacker') {
      // Attacker wins: takes the square with their committed count
      // and gains the defender's settlers as spoils
      newBoard[squareIndex] = {
        index: squareIndex,
        owner: playerRole === 'player1' ? SQUARE_STATE.PLAYER_1 : SQUARE_STATE.PLAYER_2,
        settlers,
      };
      newPlayers[playerRole].settlers += defenderCount;
      result = {
        action: TURN_ACTION.CHALLENGE,
        squareIndex,
        attackerSettlers: settlers,
        defenderSettlers: defenderCount,
        winner: playerRole,
        revealed: defenderCount,
        spoils: defenderCount,
      };
    } else {
      // Defender wins or draw: square stays
      // Defender gains the attacker's committed settlers as spoils
      newPlayers[opponent].settlers += settlers;
      result = {
        action: TURN_ACTION.CHALLENGE,
        squareIndex,
        attackerSettlers: settlers,
        defenderSettlers: defenderCount,
        winner: opponent,
        revealed: defenderCount,
        spoils: settlers,
      };
    }
  } else {
    return { error: 'Invalid action' };
  }

  // ── Advance turn ─────────────────────────────────────────────────────────
  // If the next player has no settlers, skip back to the current player
  // so they can keep playing until both are out (game over condition).
  const nextTurn = newPlayers[opponent].settlers === 0 ? playerRole : opponent;
  if (nextTurn === playerRole) result.turnSkipped = true;

  const newState = {
    ...state,
    board: newBoard,
    players: newPlayers,
    currentTurn: nextTurn,
    moveHistory: [...(state.moveHistory || []), result],
  };

  // ── Check game over ───────────────────────────────────────────────────────
  if (checkGameOver(newState)) {
    newState.status = GAME_STATUS.FINISHED;
    newState.scores = calculateScores(newBoard);
    const { player1, player2 } = newState.scores;
    newState.winner =
      player1 > player2 ? 'player1' :
      player2 > player1 ? 'player2' : 'draw';
  }

  return { newState, result };
}

/**
 * Generate a "safe" board view for a given player:
 * opponent-owned squares show the owner but NOT the settler count.
 */
export function getBoardView(board, playerRole) {
  const opponentState =
    playerRole === 'player1' ? SQUARE_STATE.PLAYER_2 : SQUARE_STATE.PLAYER_1;

  return board.map(sq => {
    if (sq.owner === opponentState) {
      return { ...sq, settlers: null }; // hidden
    }
    return sq;
  });
}

/**
 * Get a public game summary (no hidden info).
 */
export function getPublicState(gameState, viewerRole) {
  return {
    id: gameState.id,
    status: gameState.status,
    currentTurn: gameState.currentTurn,
    board: getBoardView(gameState.board, viewerRole),
    players: {
      player1: { name: gameState.players.player1.name, settlers: gameState.players.player1.settlers },
      player2: { name: gameState.players.player2.name, settlers: gameState.players.player2.settlers },
    },
    scores: calculateScores(gameState.board),
    winner: gameState.winner || null,
    moveCount: (gameState.moveHistory || []).length,
  };
}