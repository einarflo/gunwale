import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { buildProfileResponse, ensureUserProfile } from '../services/userProfile';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

const toNumber = (value: number | bigint | null | undefined): number => {
  if (value == null) return 0;
  try {
    return typeof value === 'bigint' ? Number(value) : value;
  } catch {
    return 0;
  }
};

usersRouter.get('/me', requireAuth(), async (req: Request, res: Response) => {
  try {
    const decoded: any = (req as any).user;
    const ensuredProfile = (req as any).userProfile;
    const userId = decoded?.sub || decoded?.email || decoded?.preferred_username;
    if (!userId) {
      return res.status(500).json({ message: 'Invalid token payload: missing subject' });
    }
    const profile = ensuredProfile ?? await ensureUserProfile({
      userId,
      username: decoded?.preferred_username || decoded?.nickname || decoded?.name || decoded?.email,
      email: decoded?.email,
      name: decoded?.name,
      isPremium: Array.isArray(decoded?.realm_access?.roles) && decoded.realm_access.roles.includes('premium'),
    });
    const response = buildProfileResponse(profile, {
      email: decoded?.email,
      name: decoded?.name,
      preferredUsername: decoded?.preferred_username || decoded?.nickname || null,
    });
    res.json(response);
  } catch (err: any) {
    logger.error('Failed to load current user profile', { error: err?.message || err });
    res.status(500).json({ message: 'Failed to load profile', error: err?.message || String(err) });
  }
});

usersRouter.get('/top-creators', async (req: Request, res: Response) => {
  const limitParam = Number.parseInt(String(req.query.limit ?? ''), 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10;
  try {
    const query = `
      SELECT
        g.created_by AS userId,
        COALESCE(u.username, MAX(g.created_by_name), g.created_by) AS username,
        SUM(COALESCE(fg.favCount, 0)) AS heartCount,
        COUNT(DISTINCT g.uuid) AS createdQuizCount,
        MAX(u.level) AS level,
        MAX(u.xp) AS xp,
        MAX(u.total_points) AS totalPoints,
        MAX(u.premium_since) AS premiumSince,
        MAX(u.member_since) AS memberSince
      FROM game g
      LEFT JOIN (
        SELECT game_id, COUNT(*) AS favCount
        FROM favourite_games
        GROUP BY game_id
      ) fg ON fg.game_id = g.uuid
      LEFT JOIN users u ON u.user_id = g.created_by
      WHERE g.isPublic = 1
        AND (g.deleted IS NULL OR g.deleted <> '1')
        AND g.created_by IS NOT NULL
        AND g.created_by <> ''
      GROUP BY g.created_by, u.user_id, u.username
      ORDER BY heartCount DESC, createdQuizCount DESC, g.created_by ASC
      LIMIT ?
    `;

    const rows = await prisma.$queryRawUnsafe<
      Array<{
        userId: string;
        username: string;
        heartCount: number | bigint | null;
        createdQuizCount: number | bigint | null;
        level: number | bigint | null;
        xp: number | bigint | null;
        totalPoints: number | bigint | null;
        premiumSince: Date | null;
        memberSince: Date | null;
      }>
    >(query, limit);

    const payload = rows.map((row) => ({
      userId: row.userId,
      username: row.username,
      heartCount: toNumber(row.heartCount),
      createdQuizCount: toNumber(row.createdQuizCount),
      level: row.level == null ? null : toNumber(row.level),
      xp: row.xp == null ? null : toNumber(row.xp),
      totalPoints: row.totalPoints == null ? null : toNumber(row.totalPoints),
      premiumSince: row.premiumSince ?? null,
      memberSince: row.memberSince ?? null,
    }));

    res.json(payload);
  } catch (err: any) {
    logger.error('Failed to load top creators', { error: err?.message || err });
    res.status(500).json({ message: 'Failed to load top creators', error: err?.message || String(err) });
  }
});

usersRouter.get('/:userId/public-games', async (req: Request, res: Response) => {
  const userId = String(req.params.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }
  try {
    const user = await prisma.users.findUnique({ where: { user_id: userId } });

    const games = await prisma.game.findMany({
      where: {
        created_by: userId,
        isPublic: 1,
        OR: [{ deleted: null }, { NOT: { deleted: '1' } }],
      },
    });

    const uuids = games.map(g => g.uuid).filter(Boolean) as string[];
    const tagMap = new Map<string, Array<{ slug: string; name: string }>>();
    if (uuids.length) {
      const links = await prisma.game_tags.findMany({
        where: { game_id: { in: uuids } },
        include: { tags: true },
      });
      for (const link of links) {
        if (!link?.game_id || !link?.tags) continue;
        const arr = tagMap.get(link.game_id) || [];
        arr.push({ slug: link.tags.slug, name: link.tags.name });
        tagMap.set(link.game_id, arr);
      }
    }

    const enriched = await Promise.all(
      games.map(async (g) => {
        let qcount = 0;
        let favCount = 0;
        let plays = 0;
        let participants = 0;
        let avgScore = 0;
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        try {
          qcount = await prisma.game_question.count({
            where: {
              game_id: g.uuid,
              OR: [{ deleted: null }, { NOT: { deleted: '1' } }],
              AND: [{ OR: [{ type: null }, { type: { not: 'slide' } }] }],
            },
          });
        } catch (_) {}
        try {
          favCount = await prisma.favourite_games.count({ where: { game_id: g.uuid } });
        } catch (_) {}
        try {
          plays = await prisma.game_instance.count({
            where: { game_id: g.uuid, OR: [{ is_deleted: null }, { NOT: { is_deleted: '1' } }] },
          });
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
        const tags = tagMap.get(g.uuid) || [];
        return {
          ...g,
          qcount,
          favCount,
          plays,
          participants,
          avgScore,
          difficulty,
          tags,
        } as any;
      })
    );

    const fallbackName =
      user?.username ||
      games.find(g => g.created_by_name)?.created_by_name ||
      userId;

    const profile = user
      ? {
          userId: user.user_id,
          username: user.username,
          level: toNumber(user.level),
          xp: toNumber(user.xp),
          totalPoints: toNumber(user.total_points),
          playedQuizzes: toNumber(user.played_quizzes),
          createdQuizzes: toNumber(user.created_quizzes),
          premiumSince: user.premium_since ?? null,
          memberSince: user.member_since ?? null,
        }
      : {
          userId,
          username: fallbackName,
          level: null,
          xp: null,
          totalPoints: null,
          playedQuizzes: games.length,
          createdQuizzes: games.length,
          premiumSince: null,
          memberSince: null,
        };

    res.json({
      user: profile,
      games: enriched,
    });
  } catch (err: any) {
    logger.error('Failed to list public games for user', { userId, error: err?.message || err });
    res.status(500).json({ message: 'Failed to list user games', error: err?.message || String(err) });
  }
});
