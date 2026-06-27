// client/src/components/Board.jsx
import { useGameStore } from '../store/gameStore.js';
import clsx from 'clsx';

const OWNER_STYLES = {
  empty:   'bg-territory-empty border-territory-border/50 hover:border-accent/60',
  player1: 'bg-territory-red/80 border-territory-red',
  player2: 'bg-territory-blue/80 border-territory-blue',
};

const OWNER_LABEL = {
  empty:   '',
  player1: 'R',
  player2: 'B',
};

export default function Board() {
  const { gameState, myRole, selectedSquare, selectSquare, status } = useGameStore();

  if (!gameState) return null;

  const { board, currentTurn } = gameState;
  const isMyTurn = currentTurn === myRole && status === 'active';

  return (
    <div className="select-none">
      {/* Column labels */}
      <div className="grid grid-cols-10 gap-1 mb-1 pl-6">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="text-center text-xs text-text-muted font-mono">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Row labels */}
        <div className="flex flex-col gap-1 justify-start">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="w-5 flex items-center justify-center text-xs text-text-muted font-mono"
              style={{ height: '2.5rem' }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-10 gap-1 flex-1">
          {board.map((square) => {
            const isSelected = selectedSquare === square.index;
            const isOwn =
              (myRole === 'player1' && square.owner === 'player1') ||
              (myRole === 'player2' && square.owner === 'player2');
            const isInteractable = isMyTurn && !isOwn && square.owner !== (myRole === 'player1' ? 'player1' : 'player2');
            const isEnemy = square.owner !== 'empty' && !isOwn;

            return (
              <button
                key={square.index}
                onClick={() => isInteractable && selectSquare(square.index)}
                disabled={!isInteractable}
                aria-label={`Square ${square.index} — ${square.owner}`}
                className={clsx(
                  'relative h-10 w-full rounded-sm border transition-all duration-100',
                  OWNER_STYLES[square.owner] || OWNER_STYLES.empty,
                  isSelected && 'ring-2 ring-accent scale-110 z-10',
                  isInteractable && 'cursor-pointer hover:scale-105 hover:z-10',
                  !isInteractable && 'cursor-default',
                  isOwn && 'animate-none',
                  isMyTurn && isOwn && 'opacity-80',
                )}
              >
                {/* Settler count — visible only for own squares */}
                {isOwn && square.settlers > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/90 font-semibold">
                    {square.settlers > 999 ? '1k+' : square.settlers}
                  </span>
                )}

                {/* Enemy flag — no count visible */}
                {isEnemy && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60">
                    {OWNER_LABEL[square.owner]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 pl-6 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-territory-red" /> You (P1)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-territory-blue" /> Opponent (P2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-territory-empty border border-territory-border/50" /> Unclaimed
        </span>
      </div>
    </div>
  );
}
