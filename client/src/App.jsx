// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';
import Join from './pages/Join.jsx';

export default function App() {
  // Initialise socket connection for the entire app lifetime
  useSocket();

  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/game"       element={<Game />} />
      <Route path="/join/:gameId" element={<Join />} />
    </Routes>
  );
}
