import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';

export const gamesRouter = Router();

// List games for current user (by token sub)
gamesRouter.get('/', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  logger.debug('List games for user', { userId, reqId: (req as any).id });
  try {
    const games = await prisma.game.findMany({ where: { created_by: userId ?? undefined } });
    logger.info('List games result', { count: games.length, userId });
    res.json(games);
  } catch (err: any) {
    logger.error('Failed to list games', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to list games', error: err.message });
  }
});

// Get single game by id
gamesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    logger.debug('Fetch game', { id, reqId: (req as any).id });
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    logger.info('Fetched game', { id });
    res.json(game);
  } catch (err: any) {
    logger.error('Failed to fetch game', { id, error: err.message });
    res.status(500).json({ message: 'Failed to fetch game', error: err.message });
  }
});

// Create game (protected)
gamesRouter.post('/', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const {
    name,
    description,
    status,
    players,
    currentquestion,
    starttime,
    deleted,
    isPublic,
    uuid,
  } = req.body || {};

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Field "name" is required' });
  }

  try {
    logger.debug('Create game attempt', { userId, bodyKeys: Object.keys(req.body || {}) });
    const created = await prisma.game.create({
      data: {
        name,
        created_by: userId ?? null,
        description: description ?? null,
        status: status ?? null,
        players: typeof players === 'number' ? players : null,
        currentquestion: currentquestion ?? null,
        starttime: starttime ?? null,
        deleted: deleted ?? null,
        isPublic: isPublic ?? null,
        uuid: uuid ?? null,
      },
    });
    logger.info('Game created', { id: created.id, userId });
    res.status(201).json(created);
  } catch (err: any) {
    logger.error('Failed to create game', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to create game', error: err.message });
  }
});

// Update game (protected, ownership)
gamesRouter.put('/:id', requireAuth(), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  const userId = getUserId(req);

  try {
    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Game not found' });
    if (!existing.created_by || existing.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }
  } catch (err: any) {
    logger.error('Ownership check failed', { id, error: err.message, userId });
    return res.status(500).json({ message: 'Failed to validate ownership', error: err.message });
  }

  const allowedKeys = [
    'name',
    'description',
    'status',
    'players',
    'currentquestion',
    'starttime',
    'deleted',
    'isPublic',
    'uuid',
  ] as const;

  const data: any = {};
  for (const key of allowedKeys) {
    if (key in req.body) {
      const value = (req.body as any)[key];
      if (key === 'players') {
        data[key] = typeof value === 'number' ? value : null;
      } else {
        data[key] = value ?? null;
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  try {
    logger.debug('Update game attempt', { id, userId, fields: Object.keys(data) });
    const updated = await prisma.game.update({ where: { id }, data });
    logger.info('Game updated', { id, userId });
    res.json(updated);
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      return res.status(404).json({ message: 'Game not found' });
    }
    logger.error('Failed to update game', { id, error: err.message, userId });
    res.status(500).json({ message: 'Failed to update game', error: err.message });
  }
});

// Delete game (protected, ownership)
gamesRouter.delete('/:id', requireAuth(), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const existing = await prisma.game.findUnique({ where: { id } });
    const userId = getUserId(req);
    if (!existing) return res.status(404).json({ message: 'Game not found' });
    if (!existing.created_by || existing.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }
    logger.debug('Delete game attempt', { id, userId });
    await prisma.game.delete({ where: { id } });
    logger.info('Game deleted', { id, userId });
    res.status(204).send();
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      return res.status(404).json({ message: 'Game not found' });
    }
    logger.error('Failed to delete game', { id, error: err.message });
    res.status(500).json({ message: 'Failed to delete game', error: err.message });
  }
});

// Optional: list only my games
gamesRouter.get('/mine/list', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const games = await prisma.game.findMany({ where: { created_by: userId ?? undefined } });
    logger.info('List my games', { userId, count: games.length });
    res.json(games);
  } catch (err: any) {
    logger.error('Failed to list user games', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to list user games', error: err.message });
  }
});
