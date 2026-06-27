// client/src/store/gameStore.js
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // ── Connection ─────────────────────────────────────────────────────────────
  socket: null,
  connected: false,

  // ── Session ────────────────────────────────────────────────────────────────
  gameId: null,
  playerId: null,
  myRole: null,       // 'player1' | 'player2'
  gameMode: null,     // 'online' | 'local'
  difficulty: 'medium',

  // ── Game state ─────────────────────────────────────────────────────────────
  gameState: null,    // full state object from server
  status: 'idle',     // idle | waiting | active | finished
  shareUrl: null,
  opponentConnected: false,

  // ── UI state ───────────────────────────────────────────────────────────────
  selectedSquare: null,
  pendingAction: null,  // { squareIndex, action }
  lastResult: null,     // most recent move result
  notification: null,   // { type: 'info'|'win'|'lose', message }

  // ── Actions ────────────────────────────────────────────────────────────────

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),

  setSession: (data) => set({
    gameId: data.gameId,
    playerId: data.playerId,
    myRole: data.role,
    gameMode: data.gameMode || 'online',
    difficulty: data.difficulty || 'medium',
    shareUrl: data.shareUrl || null,
    opponentConnected: false,
  }),

  setGameState: (gameState) => set({ gameState, status: gameState.status }),

  setStatus: (status) => set({ status }),

  setOpponentConnected: (value) => set({ opponentConnected: value }),

  selectSquare: (index) => {
    const { gameState, myRole } = get();
    if (!gameState || gameState.currentTurn !== myRole) return;

    const square = gameState.board[index];
    const isOwnSquare =
      (myRole === 'player1' && square.owner === 'player1') ||
      (myRole === 'player2' && square.owner === 'player2');

    if (isOwnSquare) return; // can't interact with own square

    const action = square.owner === 'empty' ? 'claim' : 'challenge';
    set({ selectedSquare: index, pendingAction: { squareIndex: index, action } });
  },

  clearSelection: () => set({ selectedSquare: null, pendingAction: null }),

  setLastResult: (result) => set({ lastResult: result }),

  notify: (type, message) => set({ notification: { type, message } }),
  clearNotification: () => set({ notification: null }),

  reset: () => set({
    gameId: null, playerId: null, myRole: null, gameMode: null,
    gameState: null, status: 'idle', shareUrl: null,
    selectedSquare: null, pendingAction: null, lastResult: null,
    opponentConnected: false, notification: null,
  }),
}));
