// client/src/components/Board.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from './Board.jsx';
import { useGameStore } from '../store/gameStore.js';

// Mock the store
vi.mock('../store/gameStore.js', () => ({
  useGameStore: vi.fn(),
}));

function makeBoard(overrides = []) {
  const board = Array.from({ length: 16 }, (_, i) => ({
    index: i, owner: 'empty', settlers: 0,
  }));
  overrides.forEach(o => { board[o.index] = { ...board[o.index], ...o }; });
  return board;
}

const baseStore = {
  gameState: null,
  myRole: 'player1',
  selectedSquare: null,
  status: 'active',
  selectSquare: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Board', () => {
  it('renders nothing when no gameState', () => {
    useGameStore.mockReturnValue(baseStore);
    const { container } = render(<Board />);
    expect(container.firstChild).toBeNull();
  });

  it('renders 16 square buttons', () => {
    useGameStore.mockReturnValue({
      ...baseStore,
      gameState: { board: makeBoard(), currentTurn: 'player1' },
    });
    render(<Board />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(16);
  });

  it('calls selectSquare when clicking an empty square on own turn', () => {
    const selectSquare = vi.fn();
    useGameStore.mockReturnValue({
      ...baseStore,
      selectSquare,
      gameState: { board: makeBoard(), currentTurn: 'player1' },
    });
    render(<Board />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(selectSquare).toHaveBeenCalledWith(0);
  });

  it('does not call selectSquare when it is not your turn', () => {
    const selectSquare = vi.fn();
    useGameStore.mockReturnValue({
      ...baseStore,
      selectSquare,
      gameState: { board: makeBoard(), currentTurn: 'player2' }, // not player1's turn
    });
    render(<Board />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(selectSquare).not.toHaveBeenCalled();
  });

  it('shows settler count on own squares', () => {
    const board = makeBoard([{ index: 5, owner: 'player1', settlers: 200 }]);
    useGameStore.mockReturnValue({
      ...baseStore,
      myRole: 'player1',
      gameState: { board, currentTurn: 'player2' },
    });
    render(<Board />);
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('hides settler count on enemy squares', () => {
    const board = makeBoard([{ index: 5, owner: 'player2', settlers: null }]);
    useGameStore.mockReturnValue({
      ...baseStore,
      myRole: 'player1',
      gameState: { board, currentTurn: 'player1' },
    });
    render(<Board />);
    // settler count should not appear for enemy squares
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });
});
