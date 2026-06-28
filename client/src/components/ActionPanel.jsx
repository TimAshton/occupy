// client/src/components/ActionPanel.jsx
// Mobile: slides up as a bottom sheet. Desktop: inline card.
import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS, TURN_ACTION } from '../../../shared/gameConstants.js';
import clsx from 'clsx';

export default function ActionPanel() {
  const { socket, pendingAction, gameState, myRole, difficulty, clearSelection } = useGameStore();
  const [settlers, setSettlers] = useState('');
  const [error, setError] = useState('');

  // Reset input when a new square is selected
  useEffect(() => {
    setSettlers('');
    setError('');
  }, [pendingAction?.squareIndex]);

  if (!pendingAction || !gameState) return null;

  const { squareIndex, action } = pendingAction;
  const mySettlers = gameState.players[myRole]?.settlers ?? 0;
  const isClaim = action === TURN_ACTION.CLAIM;
  const col = (squareIndex % 10) + 1;
  const row = String.fromCharCode(65 + Math.floor(squareIndex / 10));

  function handleSubmit() {
    const count = parseInt(settlers, 10);
    if (!count || count < 1) { setError('Enter at least 1'); return; }
    if (count > mySettlers) { setError(`Max ${mySettlers}`); return; }
    socket.emit(SOCKET_EVENTS.MAKE_MOVE, { squareIndex, action, settlers: count, difficulty });
    setSettlers('');
    setError('');
    clearSelection();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { clearSelection(); setSettlers(''); setError(''); }
  }

  const quickPicks = [10, 25, 50, 100].map(pct => ({
    pct,
    val: Math.max(1, Math.floor(mySettlers * pct / 100)),
  }));

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={() => { clearSelection(); setSettlers(''); setError(''); }}
      />

      {/* Panel — bottom sheet on mobile, inline on md+ */}
      <div className={clsx(
        'fixed bottom-0 left-0 right-0 z-40 md:static md:z-auto',
        'bg-surface-card border-t border-territory-border/50 md:border md:rounded',
        'p-4 pb-safe md:p-4',
        'transition-transform duration-200',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={clsx(
              'text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded',
              isClaim ? 'bg-accent/20 text-accent' : 'bg-territory-red/20 text-territory-red'
            )}>
              {isClaim ? 'CLAIM' : 'ATTACK'}
            </span>
            <span className="font-mono text-text-secondary text-sm">{row}{col}</span>
          </div>
          <button
            onClick={() => { clearSelection(); setSettlers(''); setError(''); }}
            className="text-text-muted hover:text-text-primary text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >×</button>
        </div>

        {/* Context message */}
        <p className="text-xs text-text-muted mb-3">
          {isClaim
            ? 'Place settlers to claim this empty square.'
            : "You can't see how many defenders are here. Guess wisely — you lose what you send either way."}
        </p>

        {/* Quick picks */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {quickPicks.map(({ pct, val }) => (
            <button
              key={pct}
              onClick={() => { setSettlers(String(val)); setError(''); }}
              className={clsx(
                'py-2 rounded text-xs border transition-colors',
                settlers === String(val)
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-territory-border/40 text-text-muted hover:border-accent/50 hover:text-text-secondary'
              )}
            >
              <div className="font-semibold">{pct}%</div>
              <div className="text-[10px] opacity-70">{val}</div>
            </button>
          ))}
        </div>

        {/* Custom input + submit */}
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={mySettlers}
            value={settlers}
            onChange={e => { setSettlers(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder={`1–${mySettlers}`}
            className="input flex-1 font-mono text-base"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            className={clsx(
              'px-5 py-2.5 rounded font-display tracking-widest text-sm font-bold transition-all active:scale-95',
              isClaim
                ? 'bg-accent text-surface-bg hover:brightness-110'
                : 'bg-territory-red text-white hover:brightness-110'
            )}
          >
            {isClaim ? 'CLAIM' : 'ATTACK'}
          </button>
        </div>

        {error && <p className="text-territory-red text-xs mt-1.5">{error}</p>}

        <p className="text-text-muted text-xs mt-2">
          Your settlers: <span className="font-mono text-text-primary">{mySettlers.toLocaleString()}</span>
        </p>
      </div>
    </>
  );
}
