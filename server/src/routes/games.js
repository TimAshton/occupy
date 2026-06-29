// server/src/routes/games.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import {
  createGame, getGame, addPlayer, getGamePlayers, listActiveGames,
} from '../db/database.js';
import { createBoard, createPlayersState } from '../game/engine.js';
import { GAME_STATUS } from '../../../shared/gameConstants.js';

const router = Router();

// GET /api/games — list open games (waiting for second player)
router.get('/', (req, res) => {
  const games = listActiveGames().filter(g => g.status === GAME_STATUS.WAITING);
  res.json({ games: games.map(g => ({
    id: g.id,
    status: g.status,
    createdAt: g.createdAt,
    playerCount: g.players.player1 ? (g.players.player2 ? 2 : 1) : 0,
  }))});
});

// POST /api/games — create a new game
router.post('/', (req, res) => {
  const { playerName = 'Player 1', mode = 'online' } = req.body;
  const gameId = uuid();
  const playerId = uuid();

  const board = createBoard();
  const players = createPlayersState(playerName, mode === 'local' ? 'CPU' : 'Player 2');

  createGame(gameId, board, players, mode);
  addPlayer(playerId, gameId, 'player1', playerName, null);

  res.status(201).json({ gameId, playerId, role: 'player1' });
});

// GET /api/games/:id — get game info (for reconnect / share link)
router.get('/:id', (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const dbPlayers = getGamePlayers(req.params.id);
  res.json({
    id: game.id,
    status: game.status,
    mode: game.gameMode,
    playerCount: dbPlayers.length,
    createdAt: game.createdAt,
  });
});

// POST /api/games/:id/join — join an existing game as player 2
router.post('/:id/join', (req, res) => {
  const { playerName = 'Player 2' } = req.body;
  const game = getGame(req.params.id);

  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== GAME_STATUS.WAITING) return res.status(409).json({ error: 'Game already started' });

  const players = getGamePlayers(req.params.id);
  if (players.length >= 2) return res.status(409).json({ error: 'Game is full' });

  const playerId = uuid();
  addPlayer(playerId, req.params.id, 'player2', playerName, null);

  res.json({ gameId: req.params.id, playerId, role: 'player2' });
});

export default router;
