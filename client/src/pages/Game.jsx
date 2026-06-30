// client/src/pages/Game.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Board from '../components/Board.jsx';
import ActionPanel from '../components/ActionPanel.jsx';
import GameStatus from '../components/GameStatus.jsx';
import Notification from '../components/Notification.jsx';

export default function Game() {
  const navigate = useNavigate();
  const {
    gameState, status, myRole, gameId,
    opponentConnected, notification, reset, pendingAction,
  } = useGameStore();

  useEffect(() => {
    if (!gameId) navigate('/');
  }, [gameId]);

  function handleCopyLink() {
    const url = `${window.location.origin}/join/${gameId}`;
    navigator.clipboard.writeText(url);
  }

  function handlePlayAgain() {
    reset();
    navigate('/');
  }

  // Waiting for opponent
  if (!gameState && status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5">
        <h1 className="font-display text-4xl sm:text-5xl tracking-widest text-accent text-center">
          WAITING FOR OPPONENT
        </h1>
        <p className="text-text-secondary text-sm text-center">Share this code:</p>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full max-w-sm">
          <code className="bg-surface-card border border-territory-border/40 px-4 py-3 rounded font-mono text-text-primary text-sm flex-1 text-center break-all">
            {gameId}
          </code>
          <button onClick={handleCopyLink} className="btn-ghost w-full sm:w-auto">
            Copy Link
          </button>
        </div>
        <div className="flex gap-2 items-center text-text-muted text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          Listening for connection...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-territory-border/30 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="font-display text-xl tracking-widest text-accent"
        >
          OCCUPY
        </button>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {myRole && (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              myRole === 'player1'
                ? 'bg-territory-red/20 text-territory-red'
                : 'bg-territory-blue/20 text-territory-blue'
            }`}>
              {myRole === 'player1' ? 'RED' : 'BLUE'}
            </span>
          )}
          {gameId && (
            <span className="font-mono text-text-muted hidden sm:inline">
              #{gameId.slice(0, 8)}
            </span>
          )}
        </div>
      </header>

      {/* 
        Mobile layout: board on top, status below, action panel as bottom sheet.
        Desktop: board left, sidebar right.
      */}
      <main className="flex-1 flex flex-col md:flex-row md:gap-4 md:p-4 md:max-w-4xl md:mx-auto md:w-full">

        {/* Board — full width on mobile, constrained on desktop */}
        <div className="px-3 pt-3 pb-1 md:p-0 md:flex-1 md:flex md:items-start">
          <Board />
        </div>

        {/* Status — horizontal strip on mobile, sidebar on desktop */}
        <div className="px-3 pb-2 md:p-0 md:w-52 md:flex-shrink-0 md:flex md:flex-col md:gap-3">
          <GameStatus />

          {/* Invite strip (online, waiting for opponent) */}
          {status === 'active' && !opponentConnected && gameMode === 'online' && (
            <button
              onClick={handleCopyLink}
              className="btn-ghost w-full text-xs mt-2 md:mt-0"
            >
              Copy invite link
            </button>
          )}

          {/* Game over */}
          {status === 'finished' && (
            <button
              onClick={handlePlayAgain}
              className="btn-primary w-full py-3 font-display tracking-widest text-base mt-2 md:mt-0"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </main>

      {/* Action panel — bottom sheet on mobile when square selected */}
      {pendingAction && <ActionPanel />}

      {/* Toast */}
      {notification && <Notification />}
    </div>
  );
}
