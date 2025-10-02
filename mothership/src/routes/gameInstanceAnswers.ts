import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export const gameInstanceAnswersRouter = Router();

function parseBody(input: any) {
  if (!input) return {};
  if (typeof input === 'string') { try { return JSON.parse(input); } catch { return {}; } }
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input);
    if (keys.length === 1) {
      const onlyKey = keys[0];
      const val = (input as any)[onlyKey];
      if ((val === '' || val == null) && (onlyKey.startsWith('{') || onlyKey.startsWith('['))) {
        try { return JSON.parse(onlyKey); } catch {}
      }
    }
  }
  return input;
}

// Create an answer (public)
// Body: { game_instance_id, game_instance_player_id, game_question_id, game_id, points, alternative, correct }
gameInstanceAnswersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = parseBody(req.body);
    const { game_instance_id, game_instance_player_id, game_question_id, game_id, points, alternative, correct } = body || {};
    if (!game_instance_id || !game_instance_player_id || !game_question_id || !game_id || points == null || !alternative || correct == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const created = await prisma.game_instance_answers.create({
      data: {
        game_instance_id: String(game_instance_id),
        game_instance_player_id: String(game_instance_player_id),
        game_question_id: String(game_question_id),
        game_id: String(game_id),
        points: String(points),
        alternative: String(alternative),
        correct: String(correct),
      },
    });
    res.status(201).json(created);
  } catch (err: any) {
    logger.error('Failed to create answer', { error: err.message });
    res.status(500).json({ message: 'Failed to create answer', error: err.message });
  }
});

// List answers for a game instance (public)
gameInstanceAnswersRouter.get('/:gameInstanceId', async (req: Request, res: Response) => {
  const gameInstanceId = String(req.params.gameInstanceId || '');
  try {
    const answers = await prisma.game_instance_answers.findMany({
      where: { game_instance_id: gameInstanceId },
      orderBy: { id: 'asc' as any },
    });
    res.json(answers);
  } catch (err: any) {
    logger.error('Failed to fetch answers', { error: err.message, gameInstanceId });
    res.status(500).json({ message: 'Failed to fetch answers', error: err.message });
  }
});

