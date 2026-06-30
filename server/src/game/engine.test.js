// server/src/game/engine.test.js
import { describe, it, expect } from 'vitest';
import { createBoard, createPlayersState, applyMove, getBoardView } from './engine.js';
import { SQUARE_STATE, TURN_ACTION, GAME_STATUS } from '../../../shared/gameConstants.js';

function freshState(overrides = {}) {
  return {
    id: 'test-game',
    status: 'active',
    currentTurn: 'player1',
    board: createBoard(),
    players: createPlayersState('Alice', 'Bob'),
    moveHistory: [],
    gameMode: 'online',
    ...overrides,
  };
}

describe('createBoard', () => {
  it('creates 16 squares', () => {
    const board = createBoard();
    expect(board).toHaveLength(16);
  });

  it('all squares start empty', () => {
    const board = createBoard();
    expect(board.every(sq => sq.owner === SQUARE_STATE.EMPTY)).toBe(true);
    expect(board.every(sq => sq.settlers === 0)).toBe(true);
  });

  it('square indices are sequential', () => {
    const board = createBoard();
    board.forEach((sq, i) => expect(sq.index).toBe(i));
  });
});

describe('applyMove — claim', () => {
  it('player can claim an empty square', () => {
    const state = freshState();
    const { newState, result } = applyMove(state, {
      playerRole: 'player1',
      squareIndex: 5,
      action: TURN_ACTION.CLAIM,
      settlers: 50,
    });
    expect(result.winner).toBe('player1');
    expect(newState.board[5].owner).toBe(SQUARE_STATE.PLAYER_1);
    expect(newState.board[5].settlers).toBe(50);
    expect(newState.players.player1.settlers).toBe(950);
  });

  it('advances turn after claim', () => {
    const state = freshState();
    const { newState } = applyMove(state, {
      playerRole: 'player1', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 10,
    });
    expect(newState.currentTurn).toBe('player2');
  });

  it('cannot claim an occupied square', () => {
    const state = freshState();
    const { newState } = applyMove(state, {
      playerRole: 'player1', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 10,
    });
    const { error } = applyMove(newState, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 10,
    });
    expect(error).toBeTruthy();
  });

  it('cannot commit more settlers than available', () => {
    const state = freshState();
    const { error } = applyMove(state, {
      playerRole: 'player1', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 9999,
    });
    expect(error).toBeTruthy();
  });

  it('cannot play out of turn', () => {
    const state = freshState();
    const { error } = applyMove(state, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 10,
    });
    expect(error).toMatch(/not your turn/i);
  });
});

describe('applyMove — challenge', () => {
  function stateWithOccupied(defenderSettlers = 100) {
    const state = freshState();
    // player1 claims square 0
    const { newState } = applyMove(state, {
      playerRole: 'player1', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: defenderSettlers,
    });
    return newState; // now player2's turn
  }

  it('attacker wins when committing more settlers', () => {
    const state = stateWithOccupied(50);
    const { newState, result } = applyMove(state, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CHALLENGE, settlers: 100,
    });
    expect(result.winner).toBe('player2');
    expect(newState.board[0].owner).toBe(SQUARE_STATE.PLAYER_2);
  });

  it('defender wins when attacker commits fewer settlers', () => {
    const state = stateWithOccupied(200);
    const { newState, result } = applyMove(state, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CHALLENGE, settlers: 50,
    });
    expect(result.winner).toBe('player1');
    expect(newState.board[0].owner).toBe(SQUARE_STATE.PLAYER_1);
  });

  it('attacker loses settlers regardless of outcome', () => {
    const state = stateWithOccupied(200);
    const before = state.players.player2.settlers;
    const { newState } = applyMove(state, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CHALLENGE, settlers: 50,
    });
    expect(newState.players.player2.settlers).toBe(before - 50);
  });

  it('reveals defender count in result', () => {
    const state = stateWithOccupied(75);
    const { result } = applyMove(state, {
      playerRole: 'player2', squareIndex: 0, action: TURN_ACTION.CHALLENGE, settlers: 100,
    });
    expect(result.revealed).toBe(75);
  });
});

describe('getBoardView', () => {
  it('hides opponent settler counts', () => {
    const board = createBoard();
    board[0] = { index: 0, owner: SQUARE_STATE.PLAYER_1, settlers: 200 };
    board[1] = { index: 1, owner: SQUARE_STATE.PLAYER_2, settlers: 150 };

    const p1View = getBoardView(board, 'player1');
    expect(p1View[0].settlers).toBe(200); // own square visible
    expect(p1View[1].settlers).toBeNull(); // opponent hidden

    const p2View = getBoardView(board, 'player2');
    expect(p2View[1].settlers).toBe(150); // own square visible
    expect(p2View[0].settlers).toBeNull(); // opponent hidden
  });
});

describe('game over', () => {
  it('detects when a player runs out of settlers', () => {
    // Give player2 only 1 settler
    const state = freshState({ players: { player1: { name: 'A', settlers: 500 }, player2: { name: 'B', settlers: 1 } } });
    // p1 claims sq 0
    const { newState: s1 } = applyMove(state, {
      playerRole: 'player1', squareIndex: 0, action: TURN_ACTION.CLAIM, settlers: 10,
    });
    // p2 spends last settler
    const { newState: s2 } = applyMove(s1, {
      playerRole: 'player2', squareIndex: 1, action: TURN_ACTION.CLAIM, settlers: 1,
    });
    expect(s2.status).toBe(GAME_STATUS.FINISHED);
  });
});