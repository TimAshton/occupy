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
    gameState, status, myRole, shareUrl, gameId,
    opponentConnected, notification, reset,
  } = useGameStore();

  // Redirect to home if no session
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

  if (!gameState && status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-display text-5xl tracking-widest text-accent">WAITING FOR OPPONENT</h1>
        <p className="text-text-secondary text-sm">Share this code with your opponent:</p>
        <div className="flex gap-2 items-center">
          <code className="bg-surface-card border border-territory-border/40 px-4 py-2 rounded font-mono text-text-primary text-sm">
            {gameId}
          </code>
          <button onClick={handleCopyLink} className="btn-ghost text-xs">Copy Link</button>
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
      <header className="flex items-center justify-between px-5 py-3 border-b border-territory-border/30">
        <button
          onClick={() => navigate('/')}
          className="font-display text-2xl tracking-widest text-accent hover:text-white transition-colors"
        >
          OCCUPY
        </button>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {gameId && (
            <span className="font-mono">
              #{gameId.slice(0, 8)}
            </span>
          )}
          {myRole && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              myRole === 'player1' ? 'bg-territory-red/20 text-territory-red' : 'bg-territory-blue/20 text-territory-blue'
            }`}>
              {myRole === 'player1' ? 'RED' : 'BLUE'}
            </span>
          )}
        </div>
      </header>

      {/* Main layout */}
      <main className="flex flex-1 gap-5 p-5 max-w-5xl mx-auto w-full">
        {/* Board */}
        <div className="flex-1 flex items-start">
          <Board />
        </div>

        {/* Sidebar */}
        <aside className="w-60 flex flex-col gap-3 flex-shrink-0">
          <GameStatus />
          <ActionPanel />

          {/* Share link for online games */}
          {status === 'active' && !opponentConnected && (
            <div className="card text-xs text-text-muted">
              <p className="mb-1">Invite opponent:</p>
              <button onClick={handleCopyLink} className="btn-ghost w-full text-xs">
                Copy invite link
              </button>
            </div>
          )}

          {/* Game over */}
          {status === 'finished' && (
            <button onClick={handlePlayAgain} className="btn-primary w-full py-3 font-display tracking-widest text-base">
              PLAY AGAIN
            </button>
          )}
        </aside>
      </main>

      {/* Notification toast */}
      {notification && <Notification />}
    </div>
  );
}
