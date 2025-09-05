import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';
import crypto from 'crypto';

export const gamesRouter = Router();

// List games for current user (by token sub)
gamesRouter.get('/', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  logger.debug('List games for user', { userId, reqId: (req as any).id });
  try {
    const games = await prisma.game.findMany({
      where: {
        created_by: userId ?? undefined,
        OR: [{ deleted: null }, { NOT: { deleted: '1' } }],
      },
    });
    // Enrich with qcount and username for frontend compatibility
    const enriched = await Promise.all(
      games.map(async (g) => {
        let qcount = 0;
        try {
          qcount = await prisma.game_question.count({
            where: { game_id: g.uuid, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
          });
        } catch (e) {
          // ignore count failure; default 0
        }
        return {
          ...g,
          qcount,
          username: g.created_by || null,
          favorite: undefined,
          popular: undefined,
          plays: undefined,
        } as any;
      })
    );
    logger.info('List games result', { count: enriched.length, userId });
    res.json(enriched);
  } catch (err: any) {
    logger.error('Failed to list games', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to list games', error: err.message });
  }
});

// Get single game by id
gamesRouter.get('/:id', async (req: Request, res: Response) => {
  const param = req.params.id;
  const id = Number(param);
  try {
    logger.debug('Fetch game', { selector: param, reqId: (req as any).id });
    const game = Number.isNaN(id)
      ? await prisma.game.findFirst({ where: { uuid: param } })
      : await prisma.game.findUnique({ where: { id } });
    if (!game || game.deleted === '1') return res.status(404).json({ message: 'Game not found' });
    logger.info('Fetched game', { id: game.id, uuid: game.uuid || null });
    res.json(game);
  } catch (err: any) {
    logger.error('Failed to fetch game', { selector: param, error: err.message });
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
    const gameUuid = uuid && typeof uuid === 'string' && uuid.length > 0 ? uuid : (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const isPublicNum = typeof isPublic === 'number' ? isPublic : (typeof isPublic === 'string' ? Number(isPublic) : undefined);

    const created = await prisma.game.create({
      data: {
        name,
        created_by: userId ?? null,
        description: description ?? null,
        status: status ?? null,
        currentquestion: currentquestion ?? null,
        starttime: starttime ?? null,
        deleted: deleted ?? null,
        ...(isPublicNum !== undefined ? { isPublic: isPublicNum } : {}),
        uuid: gameUuid,
      },
    });
    logger.info('Game created', { id: created.id, uuid: created.uuid, userId });
    res.status(201).json(created);
  } catch (err: any) {
    logger.error('Failed to create game', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to create game', error: err.message });
  }
});

// Update game (protected, ownership)
gamesRouter.put('/:id', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const numericId = Number(selector);
  const userId = getUserId(req);

  try {
    const existing = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!existing) return res.status(404).json({ message: 'Game not found' });
    if (!existing.created_by || existing.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }
  } catch (err: any) {
    logger.error('Ownership check failed', { selector, error: err.message, userId });
    return res.status(500).json({ message: 'Failed to validate ownership', error: err.message });
  }

  const allowedKeys = [
    'name',
    'description',
    'status',
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
      if (key === 'isPublic') {
        const num = typeof value === 'number' ? value : (typeof value === 'string' ? Number(value) : undefined);
        if (num !== undefined) data[key] = num;
      } else {
        data[key] = value ?? null;
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  try {
    logger.debug('Update game attempt', { selector, userId, fields: Object.keys(data) });
    const updated = Number.isNaN(numericId)
      ? await prisma.game.updateMany({ where: { uuid: selector }, data }).then(async () => (await prisma.game.findFirst({ where: { uuid: selector } }))!)
      : await prisma.game.update({ where: { id: numericId }, data });
    logger.info('Game updated', { id: updated.id, uuid: updated.uuid || null, userId });
    res.json(updated);
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      return res.status(404).json({ message: 'Game not found' });
    }
    logger.error('Failed to update game', { selector, error: err.message, userId });
    res.status(500).json({ message: 'Failed to update game', error: err.message });
  }
});

// Delete game (protected, ownership)
gamesRouter.delete('/:id', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const numericId = Number(selector);
  try {
    const existing = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    const userId = getUserId(req);
    if (!existing) return res.status(404).json({ message: 'Game not found' });
    if (!existing.created_by || existing.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }
    logger.debug('Soft-delete game attempt', { selector, userId });
    if (Number.isNaN(numericId)) {
      await prisma.game.updateMany({ where: { uuid: selector }, data: { deleted: '1' } });
    } else {
      await prisma.game.update({ where: { id: numericId }, data: { deleted: '1' } });
    }
    logger.info('Game soft-deleted', { selector, userId });
    res.status(204).send();
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      return res.status(404).json({ message: 'Game not found' });
    }
    logger.error('Failed to delete game', { selector, error: err.message });
    res.status(500).json({ message: 'Failed to delete game', error: err.message });
  }
});

// Optional: list only my games
gamesRouter.get('/mine/list', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const games = await prisma.game.findMany({
      where: { created_by: userId ?? undefined, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
    });
    logger.info('List my games', { userId, count: games.length });
    res.json(games);
  } catch (err: any) {
    logger.error('Failed to list user games', { error: err.message, userId });
    res.status(500).json({ message: 'Failed to list user games', error: err.message });
  }
});
// List soft-deleted games for current user
gamesRouter.get('/trash', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const games = await prisma.game.findMany({ where: { created_by: userId ?? undefined, deleted: '1' } });
    const enriched = await Promise.all(
      games.map(async (g) => ({
        ...g,
        qcount: await prisma.game_question.count({ where: { game_id: g.uuid, deleted: '1' } }).catch(() => 0),
        username: g.created_by || null,
      }))
    );
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to list deleted games', error: err.message });
  }
});

// Restore a soft-deleted game
gamesRouter.put('/:id/restore', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const numericId = Number(selector);
  const userId = getUserId(req);
  try {
    const existing = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!existing) return res.status(404).json({ message: 'Game not found' });
    if (!existing.created_by || existing.created_by !== userId) return res.status(403).json({ message: 'Not owner of this game' });
    const updated = Number.isNaN(numericId)
      ? await prisma.game.updateMany({ where: { uuid: selector }, data: { deleted: null } })
      : await prisma.game.update({ where: { id: numericId }, data: { deleted: null } });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to restore game', error: err.message });
  }
});
