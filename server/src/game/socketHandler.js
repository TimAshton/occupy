// server/src/game/socketHandler.js
import { v4 as uuid } from 'uuid';
import {
  getGame, updateGame, addPlayer, getPlayerBySocket,
  getGamePlayers, createGame,
} from '../db/database.js';
import { applyMove, createBoard, createPlayersState, getPublicState } from './engine.js';
import { getCpuMove } from './ai.js';
import { SOCKET_EVENTS, GAME_STATUS, DIFFICULTY } from '../../../shared/gameConstants.js';

export function registerSocketHandlers(io, socket) {
  console.log(`[socket] connected: ${socket.id}`);

  // ── Create game ────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CREATE_GAME, ({ playerName = 'Player 1', mode = 'online', difficulty = DIFFICULTY.MEDIUM } = {}) => {
    const gameId = uuid();
    const playerId = uuid();

    const board = createBoard();
    const players = createPlayersState(playerName, mode === 'local' ? 'CPU' : 'Waiting...');
    createGame(gameId, board, players, mode);
    addPlayer(playerId, gameId, 'player1', playerName, socket.id);

    socket.join(gameId);
    socket.data = { playerId, gameId, role: 'player1' };

    if (mode === 'local') {
      // Start immediately vs CPU
      updateGame(gameId, { status: GAME_STATUS.ACTIVE });
      const game = getGame(gameId);
      socket.emit(SOCKET_EVENTS.GAME_CREATED, {
        gameId,
        playerId,
        role: 'player1',
        difficulty,
        state: getPublicState(game, 'player1'),
      });
    } else {
      socket.emit(SOCKET_EVENTS.GAME_CREATED, {
        gameId,
        playerId,
        role: 'player1',
        shareUrl: `/join/${gameId}`,
      });
    }
  });

  // ── Join game ──────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_GAME, ({ gameId, playerName = 'Player 2', playerId: existingPlayerId } = {}) => {
    const game = getGame(gameId);
    if (!game) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game not found' });
      return;
    }

    const dbPlayers = getGamePlayers(gameId);

    // Check if rejoining
    if (existingPlayerId) {
      const existing = dbPlayers.find(p => p.id === existingPlayerId);
      if (existing) {
        socket.join(gameId);
        socket.data = { playerId: existingPlayerId, gameId, role: existing.role };
        socket.emit(SOCKET_EVENTS.GAME_JOINED, {
          gameId,
          playerId: existingPlayerId,
          role: existing.role,
          state: getPublicState(game, existing.role),
        });
        socket.to(gameId).emit(SOCKET_EVENTS.OPPONENT_CONNECTED);
        return;
      }
    }

    if (dbPlayers.length >= 2) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game is full' });
      return;
    }
    if (game.status !== GAME_STATUS.WAITING) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game already in progress' });
      return;
    }

    const playerId = uuid();
    addPlayer(playerId, gameId, 'player2', playerName, socket.id);
    socket.join(gameId);
    socket.data = { playerId, gameId, role: 'player2' };

    // Update player2 name in game state
    const updatedPlayers = {
      ...game.players,
      player2: { ...game.players.player2, name: playerName },
    };
    updateGame(gameId, { status: GAME_STATUS.ACTIVE, players: updatedPlayers });

    const updatedGame = getGame(gameId);

    socket.emit(SOCKET_EVENTS.GAME_JOINED, {
      gameId,
      playerId,
      role: 'player2',
      state: getPublicState(updatedGame, 'player2'),
    });

    // Notify player1 that opponent joined
    socket.to(gameId).emit(SOCKET_EVENTS.OPPONENT_CONNECTED, {
      opponentName: playerName,
      state: getPublicState(updatedGame, 'player1'),
    });
  });

  // ── Make move ──────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.MAKE_MOVE, async ({ squareIndex, action, settlers, difficulty = DIFFICULTY.MEDIUM } = {}) => {
    const { role, gameId } = socket.data || {};
    if (!gameId) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not in a game' });
      return;
    }

    const game = getGame(gameId);
    if (!game) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game not found' });
      return;
    }
    if (game.status !== GAME_STATUS.ACTIVE) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game is not active' });
      return;
    }

    const move = { playerRole: role, squareIndex, action, settlers };
    const { newState, result, error } = applyMove(game, move);

    if (error) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: error });
      return;
    }

    // Persist
    updateGame(gameId, {
      board: newState.board,
      players: newState.players,
      currentTurn: newState.currentTurn,
      status: newState.status,
      moveHistory: newState.moveHistory,
    });

    // Broadcast move result with appropriate hidden info per player
    socket.emit(SOCKET_EVENTS.MOVE_RESULT, {
      result,
      state: getPublicState(newState, role),
    });

    if (game.gameMode === 'online') {
      socket.to(gameId).emit(SOCKET_EVENTS.MOVE_RESULT, {
        result,
        state: getPublicState(newState, role === 'player1' ? 'player2' : 'player1'),
      });
    }

    // Game over check
    if (newState.status === GAME_STATUS.FINISHED) {
      io.to(gameId).emit(SOCKET_EVENTS.GAME_OVER, {
        winner: newState.winner,
        scores: newState.scores,
        players: newState.players,
      });
      return;
    }

    // ── CPU move (local mode) ──────────────────────────────────────────────
    if (game.gameMode === 'local' && newState.currentTurn === 'player2') {
      scheduleCpuMove(socket, io, gameId, difficulty, 800);
    }
  });

  // ── Disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { gameId, role } = socket.data || {};
    if (gameId) {
      socket.to(gameId).emit(SOCKET_EVENTS.OPPONENT_DISCONNECTED, { role });
    }
    console.log(`[socket] disconnected: ${socket.id}`);
  });
}

/**
 * Schedule a CPU move after a delay.
 * If after the CPU moves it's still the CPU's turn (player1 has 0 settlers),
 * keep scheduling more CPU moves until player1 gets settlers back or game ends.
 */
function scheduleCpuMove(socket, io, gameId, difficulty, delay) {
  setTimeout(() => {
    const freshGame = getGame(gameId);
    if (!freshGame || freshGame.status !== GAME_STATUS.ACTIVE) return;
    if (freshGame.currentTurn !== 'player2') return;

    const cpuMoveData = getCpuMove(freshGame, difficulty);
    if (!cpuMoveData) return;

    const cpuMove = { playerRole: 'player2', ...cpuMoveData };
    const { newState: afterCpu, result: cpuResult, error: cpuError } = applyMove(freshGame, cpuMove);

    if (cpuError) return;

    updateGame(gameId, {
      board: afterCpu.board,
      players: afterCpu.players,
      currentTurn: afterCpu.currentTurn,
      status: afterCpu.status,
      moveHistory: afterCpu.moveHistory,
    });

    socket.emit(SOCKET_EVENTS.MOVE_RESULT, {
      result: cpuResult,
      state: getPublicState(afterCpu, 'player1'),
      isCpuMove: true,
    });

    if (afterCpu.status === GAME_STATUS.FINISHED) {
      socket.emit(SOCKET_EVENTS.GAME_OVER, {
        winner: afterCpu.winner,
        scores: afterCpu.scores,
        players: afterCpu.players,
      });
      return;
    }

    // If still CPU's turn (player1 has 0 settlers), keep going
    if (afterCpu.currentTurn === 'player2') {
      scheduleCpuMove(socket, io, gameId, difficulty, 1000);
    }
  }, delay);
}