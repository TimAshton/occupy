// client/src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS, GAME_STATUS } from '../../../shared/gameConstants.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export function useSocket() {
  const socketRef = useRef(null);
  const {
    setSocket, setConnected, setSession, setGameState,
    setStatus, setOpponentConnected, setLastResult, notify,
  } = useGameStore();

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // ── Game created (you're player 1) ────────────────────────────────────
    socket.on(SOCKET_EVENTS.GAME_CREATED, (data) => {
      setSession({
        gameId: data.gameId,
        playerId: data.playerId,
        role: data.role,
        gameMode: data.state ? 'local' : 'online',
        difficulty: data.difficulty,
        shareUrl: data.shareUrl,
      });
      if (data.state) {
        setGameState(data.state);
        setStatus(GAME_STATUS.ACTIVE);
      } else {
        setStatus(GAME_STATUS.WAITING);
      }
    });

    // ── You joined as player 2 ────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.GAME_JOINED, (data) => {
      setSession({
        gameId: data.gameId,
        playerId: data.playerId,
        role: data.role,
        gameMode: 'online',
      });
      setGameState(data.state);
      setStatus(GAME_STATUS.ACTIVE);
      setOpponentConnected(true);
    });

    // ── Opponent connected (player 1 gets this when player 2 joins) ───────
    socket.on(SOCKET_EVENTS.OPPONENT_CONNECTED, (data) => {
      setOpponentConnected(true);
      if (data?.state) setGameState(data.state);
      setStatus(GAME_STATUS.ACTIVE);
      notify('info', `${data?.opponentName || 'Opponent'} joined the game!`);
    });

    // ── Move result ────────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.MOVE_RESULT, (data) => {
      setLastResult({ ...data.result, isCpuMove: data.isCpuMove });
      setGameState(data.state);
    });

    // ── Game over ──────────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.GAME_OVER, (data) => {
      const { winner, scores } = data;
      useGameStore.getState().setStatus(GAME_STATUS.FINISHED);
      const myRole = useGameStore.getState().myRole;
      const iWon = winner === myRole;
      const isDraw = winner === 'draw';
      if (isDraw) notify('info', "It's a draw!");
      else if (iWon) notify('win', `You win! ${scores[myRole]} squares captured.`);
      else notify('lose', `You lose. ${scores[myRole]} squares captured.`);
    });

    // ── Opponent disconnected ──────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.OPPONENT_DISCONNECTED, () => {
      setOpponentConnected(false);
      notify('info', 'Opponent disconnected. Waiting for them to rejoin...');
    });

    // ── Errors ────────────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      notify('error', data.message || 'An error occurred');
    });

    return () => {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return socketRef;
}
