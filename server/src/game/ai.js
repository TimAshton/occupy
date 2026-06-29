// server/src/game/ai.js
import { SQUARE_STATE, GAME_CONFIG, TURN_ACTION, DIFFICULTY } from '../../../shared/gameConstants.js';

/**
 * Pick a move for the CPU player.
 * Returns { squareIndex, action, settlers }
 *
 * The AI plays as 'player2' by convention in local mode.
 */
export function getCpuMove(gameState, difficulty = DIFFICULTY.MEDIUM) {
  switch (difficulty) {
    case DIFFICULTY.EASY:   return easyMove(gameState);
    case DIFFICULTY.HARD:   return hardMove(gameState);
    default:                return mediumMove(gameState);
  }
}

// ── Easy ──────────────────────────────────────────────────────────────────────
// Picks random square, commits random settlers (1–30% of remaining)
function easyMove(state) {
  const { board, players } = state;
  const mySettlers = players.player2.settlers;

  // pick any non-own square
  const candidates = board.filter(sq => sq.owner !== SQUARE_STATE.PLAYER_2);
  const sq = candidates[Math.floor(Math.random() * candidates.length)];

  const maxCommit = Math.max(1, Math.floor(mySettlers * 0.30));
  const settlers = randInt(1, Math.min(maxCommit, mySettlers));

  return {
    squareIndex: sq.index,
    action: sq.owner === SQUARE_STATE.EMPTY ? TURN_ACTION.CLAIM : TURN_ACTION.CHALLENGE,
    settlers,
  };
}

// ── Medium ────────────────────────────────────────────────────────────────────
// Prioritises empty squares; challenges with moderate guesses; saves settlers.
function mediumMove(state) {
  const { board, players } = state;
  const mySettlers = players.player2.settlers;
  const totalSquares = GAME_CONFIG.TOTAL_SQUARES;

  const emptySquares = board.filter(sq => sq.owner === SQUARE_STATE.EMPTY);
  const enemySquares = board.filter(sq => sq.owner === SQUARE_STATE.PLAYER_1);

  // Prefer claiming empty squares early
  if (emptySquares.length > 0 && (emptySquares.length > totalSquares * 0.2 || enemySquares.length === 0)) {
    const sq = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    // Commit 5–15% of settlers, trying to be economical
    const settlers = randInt(
      Math.max(1, Math.floor(mySettlers * 0.05)),
      Math.max(1, Math.floor(mySettlers * 0.15))
    );
    return { squareIndex: sq.index, action: TURN_ACTION.CLAIM, settlers };
  }

  // Otherwise challenge a random enemy square
  if (enemySquares.length > 0) {
    const sq = enemySquares[Math.floor(Math.random() * enemySquares.length)];
    // Guess ~40–70% of average possible settler count there
    const guess = randInt(
      Math.max(1, Math.floor(mySettlers * 0.10)),
      Math.max(1, Math.floor(mySettlers * 0.25))
    );
    return { squareIndex: sq.index, action: TURN_ACTION.CHALLENGE, settlers: Math.min(guess, mySettlers) };
  }

  // Fallback: claim an empty square
  const sq = emptySquares[0];
  return { squareIndex: sq.index, action: TURN_ACTION.CLAIM, settlers: Math.max(1, Math.floor(mySettlers * 0.05)) };
}

// ── Hard ──────────────────────────────────────────────────────────────────────
// Tracks revealed settler counts; prioritises high-value targets; manages resources.
function hardMove(state) {
  const { board, players, moveHistory = [] } = state;
  const mySettlers = players.player2.settlers;

  // Build a map of known enemy square strengths from history
  const knownStrengths = {};
  for (const move of moveHistory) {
    if (move.action === TURN_ACTION.CHALLENGE && move.revealed !== undefined) {
      knownStrengths[move.squareIndex] = move.revealed;
    }
  }

  const emptySquares = board.filter(sq => sq.owner === SQUARE_STATE.EMPTY);
  const enemySquares = board.filter(sq => sq.owner === SQUARE_STATE.PLAYER_1);

  // If there are known-weak enemy squares we can beat cheaply, target them
  const beatable = enemySquares.filter(sq => {
    const known = knownStrengths[sq.index];
    return known !== undefined && mySettlers > known + 5;
  });

  if (beatable.length > 0) {
    // Pick the weakest one
    beatable.sort((a, b) => (knownStrengths[a.index] || 999) - (knownStrengths[b.index] || 999));
    const sq = beatable[0];
    const needed = knownStrengths[sq.index] + randInt(1, 10); // beat it comfortably
    return { squareIndex: sq.index, action: TURN_ACTION.CHALLENGE, settlers: Math.min(needed, mySettlers) };
  }

  // Strategic claiming: place large garrisons on empty squares to deter challenges
  if (emptySquares.length > 0) {
    const sq = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    // Hard AI places 10–25% of settlers to create credible threats
    const settlers = randInt(
      Math.max(1, Math.floor(mySettlers * 0.10)),
      Math.max(1, Math.floor(mySettlers * 0.25))
    );
    return { squareIndex: sq.index, action: TURN_ACTION.CLAIM, settlers };
  }

  // Late game: make educated guesses on unknown enemy squares
  if (enemySquares.length > 0) {
    // Pick the enemy square with the most uncertainty (no known strength)
    const unknown = enemySquares.filter(sq => knownStrengths[sq.index] === undefined);
    const target = unknown.length > 0
      ? unknown[Math.floor(Math.random() * unknown.length)]
      : enemySquares[Math.floor(Math.random() * enemySquares.length)];

    // Commit 15–35%: enough to win most contests
    const settlers = randInt(
      Math.max(1, Math.floor(mySettlers * 0.15)),
      Math.max(1, Math.floor(mySettlers * 0.35))
    );
    return { squareIndex: target.index, action: TURN_ACTION.CHALLENGE, settlers: Math.min(settlers, mySettlers) };
  }

  return null; // no moves available (shouldn't happen)
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
