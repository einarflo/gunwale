import { Router, Request, Response } from 'express';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export const favoritesRouter = Router();

// List favorite game ids for current user
favoritesRouter.get('/', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const rows = await prisma.favourite_games.findMany({ where: { user_id: String(userId || '') } });
    const ids = rows.map(r => r.game_id);
    res.json({ gameIds: ids });
  } catch (e: any) {
    logger.error('favorites.list failed', { userId, message: e?.message });
    res.status(500).json({ message: 'Failed to list favorites' });
  }
});

// Add favorite
favoritesRouter.post('/:gameId', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const gameId = req.params.gameId;
  if (!gameId) return res.status(400).json({ message: 'Missing gameId' });
  try {
    const existing = await prisma.favourite_games.findFirst({ where: { user_id: String(userId || ''), game_id: String(gameId) } });
    if (existing) return res.status(200).json({ ok: true });
    await prisma.favourite_games.create({ data: { user_id: String(userId || ''), game_id: String(gameId) } });
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('favorites.add failed', { userId, gameId, message: e?.message });
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});

// Remove favorite
favoritesRouter.delete('/:gameId', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const gameId = req.params.gameId;
  if (!gameId) return res.status(400).json({ message: 'Missing gameId' });
  try {
    await prisma.favourite_games.deleteMany({ where: { user_id: String(userId || ''), game_id: String(gameId) } });
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('favorites.remove failed', { userId, gameId, message: e?.message });
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});

