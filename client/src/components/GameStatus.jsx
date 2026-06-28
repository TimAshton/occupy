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
  const myScore = scores?.[myRole] ?? 0;
  const oppRole = myRole === 'player1' ? 'player2' : 'player1';
  const oppScore = scores?.[oppRole] ?? 0;
  const mySettlers = players[myRole]?.settlers ?? 0;
  const oppSettlers = players[oppRole]?.settlers ?? 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Turn banner */}
      <div className={clsx(
        'rounded px-3 py-2 text-center text-sm font-bold tracking-widest font-display transition-colors',
        isMyTurn
          ? 'bg-accent/20 text-accent border border-accent/40 animate-pulse-turn'
          : 'bg-surface-raised text-text-muted border border-territory-border/30'
      )}>
        {isMyTurn ? '⚡ YOUR TURN' : '⏳ OPPONENT\'S TURN'}
      </div>

      {/* Scores — compact two-column */}
      <div className="grid grid-cols-2 gap-2">
        {/* Me */}
        <div className={clsx(
          'card py-2 text-center',
          myRole === 'player1' ? 'border-territory-red/40' : 'border-territory-blue/40'
        )}>
          <div className={clsx(
            'text-2xl font-mono font-bold',
            myRole === 'player1' ? 'text-territory-red' : 'text-territory-blue'
          )}>{myScore}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">You</div>
          <div className="text-xs text-text-secondary mt-1 font-mono">{mySettlers.toLocaleString()} settlers</div>
        </div>

        {/* Opponent */}
        <div className={clsx(
          'card py-2 text-center',
          oppRole === 'player1' ? 'border-territory-red/40' : 'border-territory-blue/40'
        )}>
          <div className={clsx(
            'text-2xl font-mono font-bold',
            oppRole === 'player1' ? 'text-territory-red' : 'text-territory-blue'
          )}>{oppScore}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Opponent</div>
          <div className="text-xs text-text-secondary mt-1 font-mono">{oppSettlers.toLocaleString()} settlers</div>
        </div>
      </div>

      {/* Last move flash */}
      {flashResult && (
        <div className={clsx(
          'card py-2 px-3 text-xs border transition-all',
          flashResult.winner === myRole
            ? 'border-green-600/50 text-green-400'
            : 'border-territory-red/50 text-territory-red'
        )}>
          {flashResult.action === 'challenge' ? (
            <div>
              <span className="font-bold">
                {flashResult.isCpuMove ? '🤖 CPU' : flashResult.winner === myRole ? '✅ Won' : '❌ Lost'}
              </span>
              {' '}— defender had <span className="font-mono">{flashResult.revealed}</span> settlers
            </div>
          ) : (
            <div>
              {flashResult.isCpuMove ? '🤖 CPU claimed' : '🏴 Claimed'} with{' '}
              <span className="font-mono">{flashResult.settlers}</span> settlers
            </div>
          )}
        </div>
      )}
    </div>
  );
}
