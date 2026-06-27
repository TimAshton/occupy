// client/src/components/GameStatus.jsx
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import clsx from 'clsx';

export default function GameStatus() {
  const { gameState, myRole, lastResult, status } = useGameStore();
  const [flashResult, setFlashResult] = useState(null);

  useEffect(() => {
    if (!lastResult) return;
    setFlashResult(lastResult);
    const t = setTimeout(() => setFlashResult(null), 3000);
    return () => clearTimeout(t);
  }, [lastResult]);

  if (!gameState) return null;

  const { players, currentTurn, scores } = gameState;
  const isMyTurn = currentTurn === myRole;
  const oppRole = myRole === 'player1' ? 'player2' : 'player1';

  return (
    <div className="flex flex-col gap-3">
      {/* Turn indicator */}
      <div className={clsx(
        'card border transition-colors',
        isMyTurn ? 'border-accent/60 animate-pulse-turn' : 'border-territory-border/30'
      )}>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Turn</p>
        <p className={clsx('font-display text-2xl tracking-wider', isMyTurn ? 'text-accent' : 'text-text-secondary')}>
          {isMyTurn ? '⚡ Your move' : '⏳ Waiting...'}
        </p>
      </div>

      {/* Score */}
      <div className="card">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Squares</p>
        <div className="flex gap-3">
          <div className="flex-1 text-center">
            <div className="text-2xl font-mono font-semibold text-territory-red">{scores?.player1 ?? 0}</div>
            <div className="text-xs text-text-muted truncate">{players.player1.name}</div>
          </div>
          <div className="text-text-muted self-center text-sm">vs</div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-mono font-semibold text-territory-blue">{scores?.player2 ?? 0}</div>
            <div className="text-xs text-text-muted truncate">{players.player2.name}</div>
          </div>
        </div>
      </div>

      {/* Settlers */}
      <div className="card">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Settlers remaining</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-sm font-mono text-territory-red">{players.player1.settlers}</div>
            <div className="text-xs text-text-muted truncate">{players.player1.name}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-mono text-territory-blue">{players.player2.settlers}</div>
            <div className="text-xs text-text-muted truncate">{players.player2.name}</div>
          </div>
        </div>
      </div>

      {/* Last move result */}
      {flashResult && (
        <div className={clsx(
          'card text-sm transition-all',
          flashResult.winner === myRole ? 'border-green-600/60 text-green-400' : 'border-territory-red/60 text-territory-red'
        )}>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">
            {flashResult.isCpuMove ? 'CPU moved' : 'Last move'}
          </p>
          {flashResult.action === 'challenge' ? (
            <>
              <p>
                {flashResult.winner === myRole ? '✅ You captured' : '❌ Defended'}
                {' '}square with <span className="font-mono">{flashResult.attackerSettlers}</span> settlers
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                Defender had <span className="font-mono text-text-secondary">{flashResult.revealed}</span>
              </p>
            </>
          ) : (
            <p>
              {flashResult.winner === myRole ? '🏴 Claimed' : '🤖 CPU claimed'} a square
              {' '}with <span className="font-mono">{flashResult.settlers}</span> settlers
            </p>
          )}
        </div>
      )}
    </div>
  );
}
