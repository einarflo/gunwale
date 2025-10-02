import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export const gameInstancePlayersRouter = Router();

// Helper to parse possibly stringified JSON bodies (some clients send JSON with urlencoded header)
function parseBody(input: any) {
  if (!input) return {};
  // Case 1: raw JSON string
  if (typeof input === 'string') {
    try { return JSON.parse(input); } catch { return {}; }
  }
  // Case 2: urlencoded with a single JSON key and empty value
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input);
    if (keys.length === 1) {
      const onlyKey = keys[0];
      const val = (input as any)[onlyKey];
      if ((val === '' || val == null) && (onlyKey.startsWith('{') || onlyKey.startsWith('['))) {
        try { return JSON.parse(onlyKey); } catch { /* ignore */ }
      }
    }
  }
  return input;
}

// Create a game instance player (public)
// Body: { game_id, game_instance_id, username, score, colour? }
gameInstancePlayersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = parseBody(req.body);
    const { game_id, game_instance_id, username, score, colour } = body || {};
    if (!game_id || !game_instance_id || !username || !score ) {
      console.log('Missing required fields to create player', { body });
      console.log('game_id:', game_id, 'game_instance_id:', game_instance_id, 'username:', username, 'score:', score);
      return res.status(400).json({ message: 'Fields "game_id", "game_instance_id", "username", and "score" are required' });
    }

    const created = await prisma.game_instance_players.create({
      data: {
        game_id: String(game_id),
        game_instance_id: String(game_instance_id),
        username: String(username),
        score: String(score),
        colour: colour != null ? String(colour) : null,
      },
      select: { id: true },
    });
    logger.info('Player created', { id: created.id, game_instance_id });
    // For compatibility with existing clients, return raw id
    res.status(201).json(created.id);
  } catch (err: any) {
    logger.error('Failed to create player', { error: err.message });
    res.status(500).json({ message: 'Failed to create player', error: err.message });
  }
});

// Update a player by id (public)
// Body: { score?, colour?, lottery?, spending?, username? }
gameInstancePlayersRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const body = parseBody(req.body);
  const allowedKeys = [ 'score', 'colour', 'lottery', 'spending', 'username' ] as const;
  const data: any = {};
  for (const key of allowedKeys) {
    if (key in (body || {})) {
      const value = body[key];
      data[key] = value != null ? String(value) : null;
    }
  }
  if (Object.keys(data).length === 0) return res.status(400).json({ message: 'No valid fields provided' });

  try {
    const updated = await prisma.game_instance_players.update({ where: { id }, data });
    res.json(updated);
  } catch (err: any) {
    if ((err as any).code === 'P2025') return res.status(404).json({ message: 'Player not found' });
    logger.error('Failed to update player', { id, error: err.message });
    res.status(500).json({ message: 'Failed to update player', error: err.message });
  }
});

// List players for a given game instance id (public)
// GET /game_instance_players/:gameInstanceId?checkUser=true
gameInstancePlayersRouter.get('/:gameInstanceId', async (req: Request, res: Response) => {
  const gameInstanceId = String(req.params.gameInstanceId || '');
  if (!gameInstanceId) return res.status(400).json({ message: 'Missing gameInstanceId' });
  try {
    const players = await prisma.game_instance_players.findMany({
      where: { game_instance_id: gameInstanceId },
      orderBy: { id: 'asc' as any },
    });
    res.json(players);
  } catch (err: any) {
    logger.error('Failed to list players', { gameInstanceId, error: err.message });
    res.status(500).json({ message: 'Failed to list players', error: err.message });
  }
});
