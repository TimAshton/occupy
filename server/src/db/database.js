// server/src/db/database.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../data/occupy.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'waiting',
      current_turn TEXT NOT NULL DEFAULT 'player1',
      board TEXT NOT NULL,
      players TEXT NOT NULL,
      move_history TEXT NOT NULL DEFAULT '[]',
      game_mode TEXT NOT NULL DEFAULT 'online',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      role TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'Player',
      socket_id TEXT,
      joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_players_game ON players(game_id);
    CREATE INDEX IF NOT EXISTS idx_players_socket ON players(socket_id);
  `);
}

// ── Game queries ──────────────────────────────────────────────────────────────

export function createGame(id, board, players, mode = 'online') {
  const db = getDb();
  db.prepare(`
    INSERT INTO games (id, status, board, players, game_mode)
    VALUES (?, 'waiting', ?, ?, ?)
  `).run(id, JSON.stringify(board), JSON.stringify(players), mode);
}

export function getGame(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  if (!row) return null;
  return deserializeGame(row);
}

export function updateGame(id, updates) {
  const db = getDb();
  const fields = Object.keys(updates)
    .map(k => `${toSnake(k)} = ?`)
    .join(', ');
  const values = Object.values(updates).map(v =>
    typeof v === 'object' ? JSON.stringify(v) : v
  );
  db.prepare(`
    UPDATE games SET ${fields}, updated_at = unixepoch() WHERE id = ?
  `).run(...values, id);
}

export function listActiveGames() {
  const db = getDb();
  return db.prepare("SELECT * FROM games WHERE status != 'finished'")
    .all()
    .map(deserializeGame);
}

// ── Player queries ────────────────────────────────────────────────────────────

export function addPlayer(id, gameId, role, displayName, socketId) {
  const db = getDb();
  db.prepare(`
    INSERT INTO players (id, game_id, role, display_name, socket_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, gameId, role, displayName, socketId);
}

export function updatePlayerSocket(playerId, socketId) {
  const db = getDb();
  db.prepare('UPDATE players SET socket_id = ? WHERE id = ?').run(socketId, playerId);
}

export function getPlayerBySocket(socketId) {
  const db = getDb();
  return db.prepare('SELECT * FROM players WHERE socket_id = ?').get(socketId);
}

export function getGamePlayers(gameId) {
  const db = getDb();
  return db.prepare('SELECT * FROM players WHERE game_id = ?').all(gameId);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deserializeGame(row) {
  return {
    ...row,
    board: JSON.parse(row.board),
    players: JSON.parse(row.players),
    moveHistory: JSON.parse(row.move_history),
    currentTurn: row.current_turn,
    gameMode: row.game_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSnake(str) {
  return str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
}

export function closeDb() {
  if (db) { db.close(); db = null; }
}
