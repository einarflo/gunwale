import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';

export const gameQuestionsRouter = Router();
export const gameQuestionByIdRouter = Router();

async function resolveGame(selector: string) {
  const maybeId = Number(selector);
  const where = Number.isNaN(maybeId) ? { uuid: selector } : { id: maybeId };
  const game = await prisma.game.findFirst({ where });
  if (!game) throw Object.assign(new Error('Game not found'), { status: 404 });
  return game;
}

// List questions for a game (selector can be numeric id or uuid)
gameQuestionsRouter.get('/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  try {
    const game = await resolveGame(selector);
    logger.debug('List questions for game', { selector, gameId: game.id, uuid: game.uuid });
    const questions = await prisma.game_question.findMany({
      where: { game_id: game.uuid, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
      orderBy: { number_in_line: 'asc' as any },
    });
    res.json(questions);
  } catch (err: any) {
    if (err.status === 404) return res.status(404).json({ message: 'Game not found' });
    logger.error('Failed to list questions', { selector, error: err.message });
    res.status(500).json({ message: 'Failed to list questions', error: err.message });
  }
});

// List soft-deleted questions for a game
gameQuestionsRouter.get('/trash/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  try {
    const game = await resolveGame(selector);
    const questions = await prisma.game_question.findMany({
      where: { game_id: game.uuid, deleted: '1' },
      orderBy: { number_in_line: 'asc' as any },
    });
    res.json(questions);
  } catch (err: any) {
    if (err.status === 404) return res.status(404).json({ message: 'Game not found' });
    res.status(500).json({ message: 'Failed to list deleted questions', error: err.message });
  }
});

// Get a single question by id or uuid
gameQuestionByIdRouter.get('/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  const maybeId = Number(selector);
  try {
    logger.debug('Fetch question', { selector });
    const question = Number.isNaN(maybeId)
      ? await prisma.game_question.findFirst({ where: { uuid: selector } })
      : await prisma.game_question.findUnique({ where: { id: maybeId } });
    if (!question || question.deleted === '1') return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err: any) {
    logger.error('Failed to fetch question', { selector, error: err.message });
    res.status(500).json({ message: 'Failed to fetch question', error: err.message });
  }
});

// Create a question
gameQuestionsRouter.post('/', requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const {
      game_id,
      text,
      description,
      number_in_line,
      status,
      score,
      alt1,
      alt2,
      alt3,
      alt4,
      correct,
      time,
    } = req.body || {};

    if (!game_id) return res.status(400).json({ message: 'Field "game_id" is required' });
    const selector = String(game_id);
    const game = await resolveGame(selector);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }

    const questionUuid = (req.body?.uuid && typeof req.body.uuid === 'string' && req.body.uuid) ||
      ((global as any).crypto?.randomUUID ? (global as any).crypto.randomUUID() : Math.random().toString(36).slice(2));

    const created = await prisma.game_question.create({
      data: {
        game_id: game.uuid,
        uuid: questionUuid,
        text: text ?? null,
        description: description ?? null,
        number_in_line: String(number_in_line ?? ''),
        status: status ?? null,
        score: String(score ?? ''),
        alt1: alt1 ?? null,
        alt2: alt2 ?? null,
        alt3: alt3 ?? null,
        alt4: alt4 ?? null,
        correct: correct ?? null,
        time: String(time ?? ''),
      },
      select: { id: true, uuid: true },
    });
    logger.info('Question created', { id: created.id, uuid: created.uuid, gameUuid: game.uuid });
    // Return UUID for routing on frontend
    res.status(201).json(created.uuid || created.id);
  } catch (err: any) {
    logger.error('Failed to create question', { error: err.message });
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
});

// Update question (also used for soft delete via deleted flag)
gameQuestionsRouter.put('/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  const maybeId = Number(selector);
  const userId = getUserId(req);
  try {
    const existing = Number.isNaN(maybeId)
      ? await prisma.game_question.findFirst({ where: { uuid: selector } })
      : await prisma.game_question.findUnique({ where: { id: maybeId } });
    if (!existing) return res.status(404).json({ message: 'Question not found' });
    const game = await prisma.game.findFirst({ where: { uuid: existing.game_id } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }

    const allowedKeys = [
      'text',
      'description',
      'number_in_line',
      'status',
      'score',
      'alt1',
      'alt2',
      'alt3',
      'alt4',
      'correct',
      'time',
      'deleted',
    ] as const;
    const data: any = {};
    for (const key of allowedKeys) {
      if (key in req.body) {
        const value = (req.body as any)[key];
        data[key] = value ?? null;
      }
    }

    if (Object.keys(data).length === 0) return res.status(400).json({ message: 'No valid fields provided' });

    const updated = await prisma.game_question.update({ where: { id: existing.id }, data });
    logger.info('Question updated', { id: updated.id, uuid: updated.uuid });
    res.json(updated);
  } catch (err: any) {
    if ((err as any).code === 'P2025') return res.status(404).json({ message: 'Question not found' });
    logger.error('Failed to update question', { selector, error: err.message });
    res.status(500).json({ message: 'Failed to update question', error: err.message });
  }
});

// Optional hard delete
gameQuestionsRouter.delete('/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  const maybeId = Number(selector);
  const userId = getUserId(req);
  try {
    const existing = Number.isNaN(maybeId)
      ? await prisma.game_question.findFirst({ where: { uuid: selector } })
      : await prisma.game_question.findUnique({ where: { id: maybeId } });
    if (!existing) return res.status(404).json({ message: 'Question not found' });
    const game = await prisma.game.findFirst({ where: { uuid: existing.game_id } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) {
      return res.status(403).json({ message: 'Not owner of this game' });
    }
    await prisma.game_question.delete({ where: { id: existing.id } });
    logger.info('Question deleted', { id: existing.id, uuid: existing.uuid });
    res.status(204).send();
  } catch (err: any) {
    logger.error('Failed to delete question', { selector, error: err.message });
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
});

// Restore a soft-deleted question by id or uuid
gameQuestionsRouter.put('/restore/:selector', requireAuth(), async (req: Request, res: Response) => {
  const selector = req.params.selector;
  const maybeId = Number(selector);
  const userId = getUserId(req);
  try {
    const existing = Number.isNaN(maybeId)
      ? await prisma.game_question.findFirst({ where: { uuid: selector } })
      : await prisma.game_question.findUnique({ where: { id: maybeId } });
    if (!existing) return res.status(404).json({ message: 'Question not found' });
    const game = await prisma.game.findFirst({ where: { uuid: existing.game_id } });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.created_by || game.created_by !== userId) return res.status(403).json({ message: 'Not owner of this game' });
    const updated = await prisma.game_question.update({ where: { id: existing.id }, data: { deleted: null } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to restore question', error: err.message });
  }
});
