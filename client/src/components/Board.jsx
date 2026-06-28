// client/src/components/Board.jsx
import { useGameStore } from '../store/gameStore.js';
import clsx from 'clsx';

const OWNER_STYLES = {
  empty:   'bg-territory-empty border-territory-border/40 active:border-accent/80',
  player1: 'bg-territory-red/80 border-territory-red/80',
  player2: 'bg-territory-blue/80 border-territory-blue/80',
};

export default function Board() {
  const { gameState, myRole, selectedSquare, selectSquare, status } = useGameStore();

  if (!gameState) return null;

  const { board, currentTurn } = gameState;
  const isMyTurn = currentTurn === myRole && status === 'active';

  return (
    <div className="select-none w-full">
      {/* Grid — fills full width on mobile */}
      <div className="grid grid-cols-10 gap-0.5 w-full">
        {board.map((square) => {
          const isSelected = selectedSquare === square.index;
          const isOwn =
            (myRole === 'player1' && square.owner === 'player1') ||
            (myRole === 'player2' && square.owner === 'player2');
          const isInteractable = isMyTurn && !isOwn;
          const isEnemy = square.owner !== 'empty' && !isOwn;

          return (
            <button
              key={square.index}
              onClick={() => isInteractable && selectSquare(square.index)}
              disabled={!isInteractable}
              aria-label={`Square ${square.index}`}
              className={clsx(
                // Square — aspect-ratio keeps it square at any width
                'relative border transition-all duration-100 touch-manipulation',
                'aspect-square w-full rounded-sm',
                OWNER_STYLES[square.owner] || OWNER_STYLES.empty,
                isSelected && 'ring-2 ring-accent ring-offset-1 ring-offset-surface-bg scale-110 z-10',
                isInteractable && 'active:scale-95',
                !isInteractable && 'cursor-default',
              )}
            >
              {/* Own settler count */}
              {isOwn && square.settlers > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-mono text-white/90 font-bold leading-none">
                  {square.settlers >= 1000 ? '1k+' : square.settlers}
                </span>
              )}
              {/* Enemy marker */}
              {isEnemy && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/30" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2 text-[10px] sm:text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-territory-red flex-shrink-0" />
          You
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-territory-blue flex-shrink-0" />
          Opponent
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-territory-empty border border-territory-border/50 flex-shrink-0" />
          Empty
        </span>
      </div>
    </div>
  );
}
