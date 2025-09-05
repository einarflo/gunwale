import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';

export const gameInstancesRouter = Router();

// Create a game instance
gameInstancesRouter.post('/', requireAuth(), async (req: Request, res: Response) => {
  try {
    // Some clients send JSON body with urlencoded header; ensure object
    let body: any = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    const userId = getUserId(req);
    const { game_id, game_pin, status } = body || {};
    if (!game_id || !game_pin) {
      return res.status(400).json({ message: 'Fields "game_id" and "game_pin" are required' });
    }
    const created = await prisma.game_instance.create({
      data: {
        game_id: String(game_id),
        game_pin: String(game_pin),
        status: status ?? 'created',
        created_by: userId ?? null,
        created_at: new Date().toISOString(),
      },
      select: { id: true },
    });
    logger.info('Game instance created', { id: created.id, game_pin });
    // Frontend expects raw id in body
    res.status(201).json(created.id);
  } catch (err: any) {
    logger.error('Failed to create game instance', { error: err.message });
    res.status(500).json({ message: 'Failed to create game instance', error: err.message });
  }
});

// Get a game instance by pin (public)
gameInstancesRouter.get('/:pin', async (req: Request, res: Response) => {
  const pin = req.params.pin;
  try {
    const inst = await prisma.game_instance.findFirst({
      where: { game_pin: pin },
      orderBy: { id: 'desc' as any },
    });
    if (!inst) return res.status(404).json({ message: 'Game instance not found' });
    res.json(inst);
  } catch (err: any) {
    logger.error('Failed to fetch game instance', { pin, error: err.message });
    res.status(500).json({ message: 'Failed to fetch game instance', error: err.message });
  }
});

// Update a game instance by numeric id (owner only)
gameInstancesRouter.put('/:id', requireAuth(), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  const userId = getUserId(req);

  // Accept both JSON object and stringified JSON for urlencoded header
  let body: any = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }

  try {
    const existing = await prisma.game_instance.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Game instance not found' });
    if (!existing.created_by || existing.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game instance' });
    }

    const allowedKeys = [ 'status', 'currentquestion', 'starttime', 'is_deleted' ] as const;
    const data: any = {};
    for (const key of allowedKeys) {
      if (key in (body || {})) {
        data[key] = body[key] ?? null;
      }
    }
    if (Object.keys(data).length === 0) return res.status(400).json({ message: 'No valid fields provided' });

    const updated = await prisma.game_instance.update({ where: { id }, data });
    res.json(updated);
  } catch (err: any) {
    if ((err as any).code === 'P2025') return res.status(404).json({ message: 'Game instance not found' });
    logger.error('Failed to update game instance', { id, error: err.message });
    res.status(500).json({ message: 'Failed to update game instance', error: err.message });
  }
});

