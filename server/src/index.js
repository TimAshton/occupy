// server/src/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import gamesRouter from './routes/games.js';
import { registerSocketHandlers } from './game/socketHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_ORIGIN, /localhost:\d+/],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: [CLIENT_ORIGIN, /localhost:\d+/], credentials: true }));
app.use(express.json());

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/games', gamesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve React build in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Socket.io ─────────────────────────────────────────────────────────────
io.on('connection', socket => registerSocketHandlers(io, socket));

// ── Start ──────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🏴 Occupy server running on http://localhost:${PORT}`);
});

export { app, httpServer };
