// client/src/pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS, DIFFICULTY } from '../../../shared/gameConstants.js';

export default function Home() {
  const navigate = useNavigate();
  const { socket, connected } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState('online'); // 'online' | 'local'
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM);
  const [tab, setTab] = useState('create'); // 'create' | 'join'

  function handleCreate() {
    const name = playerName.trim() || 'Player 1';
    socket.emit(SOCKET_EVENTS.CREATE_GAME, { playerName: name, mode, difficulty });
    navigate('/game');
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    const name = playerName.trim() || 'Player 2';
    socket.emit(SOCKET_EVENTS.JOIN_GAME, { gameId: joinCode.trim(), playerName: name });
    navigate('/game');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-display text-8xl tracking-[0.2em] text-accent mb-2">OCCUPY</h1>
        <p className="text-text-secondary text-sm tracking-widest uppercase">
          Claim. Bluff. Conquer.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="card">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-5 bg-surface-bg rounded p-1">
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                tab === 'create' ? 'bg-surface-raised text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              New Game
            </button>
            <button
              onClick={() => setTab('join')}
              className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                tab === 'join' ? 'bg-surface-raised text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Join Game
            </button>
          </div>

          {/* Name field — shared */}
          <div className="mb-4">
            <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">
              Your name
            </label>
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
              {/* Mode selector */}
              <div className="mb-4">
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">
                  Game mode
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setMode('online')}
                    className={`flex-1 py-2 text-sm rounded border transition-colors ${
                      mode === 'online'
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-territory-border/40 text-text-muted hover:border-territory-border'
                    }`}
                  >
                    🌐 Online
                  </button>
                  <button
                    onClick={() => setMode('local')}
                    className={`flex-1 py-2 text-sm rounded border transition-colors ${
                      mode === 'local'
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-territory-border/40 text-text-muted hover:border-territory-border'
                    }`}
                  >
                    🤖 vs CPU
                  </button>
                </div>
              </div>

              {/* Difficulty — only for local */}
              {mode === 'local' && (
                <div className="mb-4">
                  <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">
                    CPU difficulty
                  </label>
                  <div className="flex gap-1">
                    {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD].map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 text-sm capitalize rounded border transition-colors ${
                          difficulty === d
                            ? 'border-accent text-accent bg-accent/10'
                            : 'border-territory-border/40 text-text-muted hover:border-territory-border'
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
                disabled={!connected}
                className="btn-primary w-full py-3 text-base font-display tracking-widest"
              >
                {connected ? 'LAUNCH' : 'Connecting...'}
              </button>
            </>
          )}

          {tab === 'join' && (
            <>
              <div className="mb-4">
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">
                  Game code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="Paste invite code"
                  className="input w-full font-mono"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={!connected || !joinCode.trim()}
                className="btn-primary w-full py-3 text-base font-display tracking-widest"
              >
                {connected ? 'JOIN' : 'Connecting...'}
              </button>
            </>
          )}
        </div>

        {/* Rules quick-ref */}
        <details className="mt-4 card text-xs text-text-muted cursor-pointer">
          <summary className="text-text-secondary font-semibold mb-1 cursor-pointer">How to play</summary>
          <ul className="mt-2 space-y-1 pl-3 list-disc marker:text-accent">
            <li>Each player starts with <strong className="text-text-secondary">1,000 settlers</strong> and a 10×10 board.</li>
            <li>On your turn, select any square. Empty squares can be <strong className="text-text-secondary">claimed</strong> by leaving settlers there.</li>
            <li>Occupied enemy squares can be <strong className="text-text-secondary">challenged</strong> — but you never see how many settlers are there. Guess wisely.</li>
            <li>Highest settler count <strong className="text-text-secondary">wins the square</strong>. The attacker always loses their committed settlers, win or lose.</li>
            <li>Game ends when all squares are claimed or a player runs out of settlers. <strong className="text-text-secondary">Most squares wins.</strong></li>
          </ul>
        </details>
      </div>
    </div>
  );
}
