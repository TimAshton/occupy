// client/src/components/ActionPanel.jsx
import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS, TURN_ACTION } from '../../../shared/gameConstants.js';
import clsx from 'clsx';

export default function ActionPanel() {
  const { socket, pendingAction, gameState, myRole, difficulty, clearSelection } = useGameStore();
  const [settlers, setSettlers] = useState('');
  const [error, setError] = useState('');

  if (!pendingAction || !gameState) return null;

  const { squareIndex, action } = pendingAction;
  const square = gameState.board[squareIndex];
  const mySettlers = gameState.players[myRole]?.settlers ?? 0;
  const colLabel = (squareIndex % 10) + 1;
  const rowLabel = String.fromCharCode(65 + Math.floor(squareIndex / 10));

  function handleSubmit() {
    const count = parseInt(settlers, 10);
    if (!count || count < 1) { setError('Enter at least 1 settler'); return; }
    if (count > mySettlers) { setError(`You only have ${mySettlers} settlers`); return; }

    socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      squareIndex,
      action,
      settlers: count,
      difficulty,
    });

    setSettlers('');
    setError('');
    clearSelection();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { clearSelection(); setSettlers(''); setError(''); }
  }

  const isClaim = action === TURN_ACTION.CLAIM;

  return (
    <div className="card border-accent/40 bg-surface-raised">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-0.5">
            {isClaim ? 'Claim' : 'Challenge'}
          </p>
          <p className="font-display text-xl tracking-wider text-accent">
            Square {rowLabel}{colLabel}
          </p>
        </div>
        <button
          onClick={() => { clearSelection(); setSettlers(''); setError(''); }}
          className="text-text-muted hover:text-text-primary transition-colors text-xl"
          aria-label="Cancel"
        >
          ×
        </button>
      </div>

      {!isClaim && (
        <div className="mb-3 p-2 bg-surface-bg rounded text-xs text-text-secondary">
          ⚔️ This square is <strong className="text-territory-red">occupied</strong>.
          You don't know how many settlers are here. Guess high to win — but you'll lose what you send regardless.
        </div>
      )}

      {isClaim && (
        <div className="mb-3 p-2 bg-surface-bg rounded text-xs text-text-secondary">
          🏴 Empty territory. Place settlers to claim it.
          More settlers = harder to challenge later.
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="number"
          min={1}
          max={mySettlers}
          value={settlers}
          onChange={e => { setSettlers(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder={`1 – ${mySettlers}`}
          className="input flex-1 font-mono text-lg"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className={clsx('btn px-4', isClaim ? 'btn-primary' : 'btn-danger')}
        >
          {isClaim ? 'Claim' : 'Attack'}
        </button>
      </div>

      {/* Quick-pick percentages */}
      <div className="flex gap-1.5 mb-2">
        {[10, 25, 50, 100].map(pct => {
          const val = Math.max(1, Math.floor(mySettlers * pct / 100));
          return (
            <button
              key={pct}
              onClick={() => setSettlers(String(val))}
              className="text-xs px-2 py-1 bg-surface-bg border border-territory-border/40 rounded hover:border-accent/50 text-text-secondary hover:text-accent transition-colors"
            >
              {pct}% <span className="text-text-muted">({val})</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-territory-red text-xs">{error}</p>}

      <p className="text-text-muted text-xs mt-1">
        Your settlers: <span className="font-mono text-text-primary">{mySettlers}</span>
      </p>
    </div>
  );
}
