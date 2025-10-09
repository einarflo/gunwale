import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';

export const tagsRouter = Router();

// List all tags
tagsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.tags.findMany({ orderBy: { name: 'asc' } });
    res.json(rows);
  } catch (e: any) {
    logger.error('tags.list failed', { message: e?.message });
    res.status(500).json({ message: 'Failed to list tags' });
  }
});

// Get tags for a game (id or uuid)
tagsRouter.get('/game/:id', async (req: Request, res: Response) => {
  const selector = req.params.id;
  const numericId = Number(selector);
  try {
    const game = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    const mappings = await prisma.game_tags.findMany({ where: { game_id: game.uuid } });
    const ids = mappings.map(m => m.tag_id);
    const rows = ids.length ? await prisma.tags.findMany({ where: { id: { in: ids } }, orderBy: { name: 'asc' } }) : [];
    res.json(rows);
  } catch (e: any) {
    logger.error('tags.getForGame failed', { selector, message: e?.message });
    res.status(500).json({ message: 'Failed to get game tags' });
  }
});

// Replace tags for a game (owner only)
tagsRouter.put('/game/:id', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const numericId = Number(selector);
  const userId = getUserId(req);
  const slugs: string[] = Array.isArray(req.body?.slugs)
    ? (req.body.slugs as string[]).map(s => String(s).toLowerCase())
    : [];
  try {
    const game = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) return res.status(403).json({ message: 'Not owner of this game' });

    const all = await prisma.tags.findMany({ where: { slug: { in: slugs } } });
    const tagIds = new Set(all.map(t => t.id));

    const existing = await prisma.game_tags.findMany({ where: { game_id: game.uuid } });
    const existingIds = new Set(existing.map(e => e.tag_id));

    // To add
    const toAdd = [...tagIds].filter(id => !existingIds.has(id));
    // To remove
    const toRemove = [...existingIds].filter(id => !tagIds.has(id));

    if (toAdd.length) {
      await prisma.game_tags.createMany({ data: toAdd.map(tag_id => ({ game_id: game.uuid, tag_id })) });
    }
    if (toRemove.length) {
      await prisma.game_tags.deleteMany({ where: { game_id: game.uuid, tag_id: { in: toRemove } } });
    }
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('tags.replaceForGame failed', { selector, message: e?.message, userId });
    res.status(500).json({ message: 'Failed to update tags for game' });
  }
});

// Add a single tag by slug (owner only)
tagsRouter.post('/game/:id/:slug', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const slug = String(req.params.slug || '').toLowerCase();
  const numericId = Number(selector);
  const userId = getUserId(req);
  try {
    const game = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) return res.status(403).json({ message: 'Not owner of this game' });
    const tag = await prisma.tags.findFirst({ where: { slug } });
    if (!tag) return res.status(400).json({ message: 'Unknown tag' });
    const existing = await prisma.game_tags.findFirst({ where: { game_id: game.uuid, tag_id: tag.id } });
    if (existing) return res.json({ ok: true });
    await prisma.game_tags.create({ data: { game_id: game.uuid, tag_id: tag.id } });
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('tags.addForGame failed', { selector, slug, message: e?.message, userId });
    res.status(500).json({ message: 'Failed to add tag' });
  }
});

// Remove a single tag by slug (owner only)
tagsRouter.delete('/game/:id/:slug', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.id;
  const slug = String(req.params.slug || '').toLowerCase();
  const numericId = Number(selector);
  const userId = getUserId(req);
  try {
    const game = Number.isNaN(numericId)
      ? await prisma.game.findFirst({ where: { uuid: selector } })
      : await prisma.game.findUnique({ where: { id: numericId } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) return res.status(403).json({ message: 'Not owner of this game' });
    const tag = await prisma.tags.findFirst({ where: { slug } });
    if (!tag) return res.status(400).json({ message: 'Unknown tag' });
    await prisma.game_tags.deleteMany({ where: { game_id: game.uuid, tag_id: tag.id } });
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('tags.removeForGame failed', { selector, slug, message: e?.message, userId });
    res.status(500).json({ message: 'Failed to remove tag' });
  }
});

