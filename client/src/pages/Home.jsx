// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS, DIFFICULTY } from '../../../shared/gameConstants.js';

export default function Home() {
  const navigate = useNavigate();
  const { socket, connected, gameId } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState('online');
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM);
  const [tab, setTab] = useState('create');
  const [launching, setLaunching] = useState(false);

  // Only navigate once the server has actually confirmed a session
  // (gameId gets set by useSocket.js after GAME_CREATED / GAME_JOINED).
  // This avoids a race where we navigate before the socket event arrives,
  // which would otherwise bounce back to Home via Game.jsx's gameId guard.
  useEffect(() => {
    if (launching && gameId) navigate('/game');
  }, [launching, gameId]);

  function handleCreate() {
    const name = playerName.trim() || 'Player 1';
    setLaunching(true);
    socket.emit(SOCKET_EVENTS.CREATE_GAME, { playerName: name, mode, difficulty });
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    const name = playerName.trim() || 'Player 2';
    setLaunching(true);
    socket.emit(SOCKET_EVENTS.JOIN_GAME, { gameId: joinCode.trim(), playerName: name });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-6">
        <h1 className="font-display text-7xl sm:text-8xl tracking-[0.2em] text-accent mb-1">OCCUPY</h1>
        <p className="text-text-muted text-xs tracking-widest uppercase">Claim · Bluff · Conquer</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="card">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-surface-bg rounded p-1">
            {['create', 'join'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm rounded capitalize transition-colors ${
                  tab === t
                    ? 'bg-surface-raised text-text-primary font-semibold'
                    : 'text-text-muted'
                }`}
              >
                {t === 'create' ? 'New Game' : 'Join Game'}
              </button>
            ))}
          </div>

          {tab === 'create' && (
            <>
              {/* Mode */}
              <div className="mb-3">
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">Mode</label>
                <div className="grid grid-cols-2 gap-1">
                  {[['online', '🌐 Online'], ['local', '🤖 vs CPU']].map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2.5 text-sm rounded border transition-colors ${
                        mode === m
                          ? 'border-accent text-accent bg-accent/10 font-semibold'
                          : 'border-territory-border/40 text-text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Name */}
          <div className="mb-3">
            <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">Your name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder={tab === 'create' ? 'Player 1' : 'Player 2'}
              maxLength={20}
              className="input w-full"
            />
          </div>

          {tab === 'create' && (
            <>
              {/* Difficulty */}
              {mode === 'local' && (
                <div className="mb-3">
                  <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD].map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-2.5 text-sm capitalize rounded border transition-colors ${
                          difficulty === d
                            ? 'border-accent text-accent bg-accent/10 font-semibold'
                            : 'border-territory-border/40 text-text-muted'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!connected || launching}
                className="btn-primary w-full py-3.5 text-base font-display tracking-widest"
              >
                {!connected ? 'Connecting...' : launching ? 'Launching...' : 'LAUNCH'}
              </button>
            </>
          )}

          {tab === 'join' && (
            <>
              <div className="mb-3">
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">Game code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="Paste invite code"
                  className="input w-full font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!connected || !joinCode.trim() || launching}
                className="btn-primary w-full py-3.5 text-base font-display tracking-widest"
              >
                {!connected ? 'Connecting...' : launching ? 'Joining...' : 'JOIN'}
              </button>
            </>
          )}
        </div>

        {/* Rules accordion */}
        <details className="mt-3 card text-xs text-text-muted">
          <summary className="text-text-secondary font-semibold cursor-pointer">How to play</summary>
          <ul className="mt-2 space-y-1.5 pl-3 list-disc marker:text-accent">
            <li>Each player starts with <strong className="text-text-secondary">1,000 settlers</strong></li>
            <li>Tap an empty square to <strong className="text-text-secondary">claim</strong> it — place as many settlers as you want</li>
            <li>Tap an enemy square to <strong className="text-text-secondary">challenge</strong> it — you never see how many defenders are there</li>
            <li>Most settlers <strong className="text-text-secondary">wins the square</strong>. Attacker always loses what they send.</li>
            <li><strong className="text-text-secondary">Most squares wins</strong> when all are claimed or someone runs out of settlers</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
