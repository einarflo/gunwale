import { Router, Request, Response } from 'express';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export const favoritesRouter = Router();

const toNumber = (value: number | bigint | null | undefined): number => {
  if (value == null) return 0;
  try {
    return typeof value === 'bigint' ? Number(value) : value;
  } catch {
    return 0;
  }
};

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

// List detailed favorite games (public only)
favoritesRouter.get('/details', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const favoriteRows = await prisma.favourite_games.findMany({
      where: { user_id: userId },
      select: { game_id: true },
    });
    const gameIds = favoriteRows.map(r => r.game_id);
    if (!gameIds.length) {
      return res.json([]);
    }

    const games = await prisma.game.findMany({
      where: {
        uuid: { in: gameIds },
        isPublic: 1,
        OR: [{ deleted: null }, { NOT: { deleted: '1' } }],
      },
    });

    const creatorIds = Array.from(
      new Set(
        games
          .map(g => (g.created_by ? String(g.created_by) : null))
          .filter((id): id is string => Boolean(id))
      )
    );
    const creatorMap = new Map<
      string,
      {
        userId: string;
        username: string;
        level: number;
        xp: number;
        totalPoints: number;
        playedQuizzes: number;
        createdQuizzes: number;
        premiumSince: Date | null;
      }
    >();
    if (creatorIds.length) {
      const creators = await prisma.users.findMany({
        where: { user_id: { in: creatorIds } },
        select: {
          user_id: true,
          username: true,
          level: true,
          xp: true,
          total_points: true,
          played_quizzes: true,
          created_quizzes: true,
          premium_since: true,
        },
      });
      for (const creator of creators) {
        creatorMap.set(creator.user_id, {
          userId: creator.user_id,
          username: creator.username,
          level: toNumber(creator.level),
          xp: toNumber(creator.xp),
          totalPoints: toNumber(creator.total_points),
          playedQuizzes: toNumber(creator.played_quizzes),
          createdQuizzes: toNumber(creator.created_quizzes),
          premiumSince: creator.premium_since ?? null,
        });
      }
    }

    const enriched = await Promise.all(
      games.map(async (g) => {
        let qcount = 0;
        let plays = 0;
        let favCount = 0;
        let participants = 0;
        let avgScore = 0;
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        try {
          qcount = await prisma.game_question.count({
            where: { game_id: g.uuid, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
          });
        } catch (_) {}
        try {
          plays = await prisma.game_instance.count({
            where: { game_id: g.uuid, OR: [{ is_deleted: null }, { NOT: { is_deleted: '1' } }] },
          });
        } catch (_) {}
        try {
          favCount = await prisma.favourite_games.count({ where: { game_id: g.uuid } });
        } catch (_) {}
        try {
          const players = await prisma.game_instance_players.findMany({
            where: { game_id: g.uuid },
            select: { score: true },
          });
          participants = players.length;
          const total = players.reduce((acc, p) => acc + Number(p.score || 0), 0);
          avgScore = participants ? Math.round(total / participants) : 0;
        } catch (_) {}
        if (qcount > 0) {
          const avgPerQ = avgScore / qcount;
          if (avgPerQ >= 750) difficulty = 'easy';
          else if (avgPerQ >= 450) difficulty = 'medium';
          else difficulty = 'hard';
        }

        const creatorInfo = g.created_by ? creatorMap.get(String(g.created_by)) : undefined;

        return {
          ...g,
          qcount,
          plays,
          favCount,
          participants,
          avgScore,
          difficulty,
          creator_username: creatorInfo?.username ?? g.created_by_name ?? null,
          creator_profile: creatorInfo
            ? {
                userId: creatorInfo.userId,
                username: creatorInfo.username,
                level: creatorInfo.level,
                xp: creatorInfo.xp,
                totalPoints: creatorInfo.totalPoints,
                playedQuizzes: creatorInfo.playedQuizzes,
                createdQuizzes: creatorInfo.createdQuizzes,
                premiumSince: creatorInfo.premiumSince,
              }
            : null,
        };
      })
    );

    res.json(enriched);
  } catch (err: any) {
    logger.error('favorites.details failed', { userId, message: err?.message });
    res.status(500).json({ message: 'Failed to load favorite games' });
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
