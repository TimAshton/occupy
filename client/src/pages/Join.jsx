// client/src/pages/Join.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import { SOCKET_EVENTS } from '../../../shared/gameConstants.js';

export default function Join() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useGameStore();
  const [playerName, setPlayerName] = useState('');

  function handleJoin() {
    const name = playerName.trim() || 'Player 2';
    socket.emit(SOCKET_EVENTS.JOIN_GAME, { gameId, playerName: name });
    navigate('/game');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-6xl tracking-widest text-accent mb-2">OCCUPY</h1>
      <p className="text-text-secondary mb-8 tracking-widest uppercase text-sm">You've been challenged</p>

      <div className="card w-full max-w-sm">
        <p className="text-text-muted text-xs mb-1">Joining game</p>
        <code className="font-mono text-text-secondary text-sm block mb-5 truncate">{gameId}</code>

        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1">Your name</label>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="Player 2"
          maxLength={20}
          className="input w-full mb-4"
          autoFocus
        />

        <button
          onClick={handleJoin}
          disabled={!connected}
          className="btn-primary w-full py-3 font-display tracking-widest text-base"
        >
          {connected ? 'ENTER BATTLE' : 'Connecting...'}
        </button>
      </div>
    </div>
  );
}
