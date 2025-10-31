import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, getUserId } from '../middleware/auth';
import { logger } from '../lib/logger';
import crypto from 'crypto';

export const gamesRouter = Router();

const toNumber = (value: number | bigint | null | undefined): number => {
  if (value == null) return 0;
  try {
    return typeof value === 'bigint' ? Number(value) : value;
  } catch {
    return 0;
  }
};

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
        let plays = 0;
        let participants = 0;
        let avgScore = 0;
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        try {
          qcount = await prisma.game_question.count({
            where: { game_id: g.uuid, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
          });
        } catch (e) {
          // ignore count failure; default 0
        }
        try {
          plays = await prisma.game_instance.count({ where: { game_id: g.uuid, OR: [{ is_deleted: null }, { NOT: { is_deleted: '1' } }] } });
        } catch (e) {
          // ignore
        }
        try {
          const players = await prisma.game_instance_players.findMany({ where: { game_id: g.uuid }, select: { score: true } });
          participants = players.length;
          const total = players.reduce((acc, p) => acc + Number(p.score || 0), 0);
          avgScore = participants ? Math.round(total / participants) : 0;
        } catch (e) {
          // ignore
        }
        if (qcount > 0) {
          const avgPerQ = avgScore / qcount; // 0..1000 scale per question
          if (avgPerQ >= 750) difficulty = 'easy';
          else if (avgPerQ >= 450) difficulty = 'medium';
          else difficulty = 'hard';
        }
        return {
          ...g,
          qcount,
          plays,
          participants,
          avgScore,
          difficulty,
          username: g.created_by || null,
          favorite: undefined,
          popular: undefined,
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

// List public games (discover) - keep before "/:id" to avoid conflicts
gamesRouter.get('/public', async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const tagsParam = (req.query.tags as string | undefined)?.trim();
  const mode = String((req.query.mode as string | undefined) || 'any').toLowerCase();
  try {
    let gameIdsFilter: string[] | null = null;
    if (tagsParam) {
      const slugs = [...new Set(tagsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))];
      if (slugs.length) {
        const tagRows = await prisma.tags.findMany({ where: { slug: { in: slugs } } });
        const tagIds = tagRows.map(t => t.id);
        if (tagIds.length) {
          const rows = await prisma.game_tags.findMany({ where: { tag_id: { in: tagIds } }, select: { game_id: true, tag_id: true } });
          if (mode === 'all') {
            const counts = new Map<string, number>();
            for (const r of rows) counts.set(r.game_id, (counts.get(r.game_id) || 0) + 1);
            gameIdsFilter = [...counts.entries()].filter(([, c]) => c >= tagIds.length).map(([id]) => id);
          } else {
            gameIdsFilter = [...new Set(rows.map(r => r.game_id))];
          }
          if (gameIdsFilter.length === 0) {
            return res.json([]);
          }
        }
      }
    }

    const where: any = {
      isPublic: 1,
      OR: [{ deleted: null }, { NOT: { deleted: '1' } }],
      ...(gameIdsFilter ? { uuid: { in: gameIdsFilter } } : {}),
    };
    if (q) {
      where.AND = [
        {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
      ];
    }

    const games = await prisma.game.findMany({ where });

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

    // Collect tags for all returned games in a single query
    const uuids = games.map(g => g.uuid).filter(Boolean) as string[];
    const tagMap = new Map<string, Array<{ slug: string; name: string }>>();
    if (uuids.length) {
      const links = await prisma.game_tags.findMany({
        where: { game_id: { in: uuids } },
        include: { tags: true },
      });
      for (const l of links) {
        if (!l?.game_id || !l?.tags) continue;
        const arr = tagMap.get(l.game_id) || [];
        arr.push({ slug: l.tags.slug, name: l.tags.name });
        tagMap.set(l.game_id, arr);
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
            where: { game_id: g.uuid, OR: [{ deleted: null }, { NOT: { deleted: '1' } }] },
          });
        } catch (_) {}
        try {
          favCount = await prisma.favourite_games.count({ where: { game_id: g.uuid } });
        } catch (_) {}
        try {
          plays = await prisma.game_instance.count({ where: { game_id: g.uuid, OR: [{ is_deleted: null }, { NOT: { is_deleted: '1' } }] } });
        } catch (_) {}
        try {
          const players = await prisma.game_instance_players.findMany({ where: { game_id: g.uuid }, select: { score: true } });
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
        const creatorInfo = g.created_by ? creatorMap.get(String(g.created_by)) : undefined;
        return {
          ...g,
          qcount,
          favCount,
          plays,
          tags,
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
        } as any;
      })
    );
    res.json(enriched);
  } catch (err: any) {
    logger.error('Failed to list public games', { error: err.message });
    res.status(500).json({ message: 'Failed to list public games', error: err.message });
  }
});

gamesRouter.get('/recent-played', requireAuth(), async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const instances = await prisma.$queryRaw<Array<{ id: number; game_id: string | null; created_at: string | null; starttime: string | null }>>`
      SELECT gi.id, gi.game_id, gi.created_at, gi.starttime
      FROM game_instance gi
      WHERE gi.created_by = ${userId}
        AND gi.game_id IS NOT NULL
        AND gi.game_id <> ''
        AND (gi.is_deleted IS NULL OR gi.is_deleted <> '1')
      ORDER BY gi.id DESC
      LIMIT 400
    `;

    const ordered: Array<{ gameId: string; lastPlayedRaw: string | null }>
      = [];
    const seen = new Set<string>();
    for (const inst of instances) {
      const gid = inst.game_id ? String(inst.game_id) : '';
      if (!gid || seen.has(gid)) continue;
      seen.add(gid);
      const last = inst.created_at && inst.created_at.trim().length ? inst.created_at : (inst.starttime || null);
      ordered.push({ gameId: gid, lastPlayedRaw: last });
      if (ordered.length >= 100) break;
    }

    if (!ordered.length) return res.json([]);

    const games = await prisma.game.findMany({ where: { uuid: { in: ordered.map(o => o.gameId) } } });
    const gameMap = new Map<string, typeof games[number]>();
    for (const g of games) {
      if (g.uuid) gameMap.set(g.uuid, g);
    }

    const creatorIds = Array.from(new Set(ordered.flatMap(({ gameId }) => {
      const g = gameMap.get(gameId);
      return g?.created_by ? [String(g.created_by)] : [];
    })));
    const creatorMap = new Map<string, {
      userId: string;
      username: string;
      level: number;
      xp: number;
      totalPoints: number;
      playedQuizzes: number;
      createdQuizzes: number;
      premiumSince: Date | null;
    }>();
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
      for (const c of creators) {
        creatorMap.set(c.user_id, {
          userId: c.user_id,
          username: c.username,
          level: Number(c.level ?? 0),
          xp: Number(c.xp ?? 0),
          totalPoints: Number(c.total_points ?? 0),
          playedQuizzes: Number(c.played_quizzes ?? 0),
          createdQuizzes: Number(c.created_quizzes ?? 0),
          premiumSince: c.premium_since ?? null,
        });
      }
    }

    const results = await Promise.all(
      ordered.map(async ({ gameId, lastPlayedRaw }) => {
        const g = gameMap.get(gameId);
        if (!g) return null;

        let qcount = 0;
        let plays = 0;
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

        const tagRows = await prisma.game_tags.findMany({
          where: { game_id: g.uuid },
          include: { tags: true },
        }).catch(() => []);
        const tags = tagRows
          .map(tr => tr.tags)
          .filter(Boolean)
          .map(tag => ({ slug: tag.slug, name: tag.name }));

        const creatorInfo = g.created_by ? creatorMap.get(String(g.created_by)) : undefined;

        return {
          ...g,
          qcount,
          plays,
          tags,
          creator_username: creatorInfo?.username ?? g.created_by_name ?? null,
          creator_profile: creatorInfo ? {
            userId: creatorInfo.userId,
            username: creatorInfo.username,
            level: creatorInfo.level,
            xp: creatorInfo.xp,
            totalPoints: creatorInfo.totalPoints,
            playedQuizzes: creatorInfo.playedQuizzes,
            createdQuizzes: creatorInfo.createdQuizzes,
            premiumSince: creatorInfo.premiumSince,
          } : null,
          lastPlayedAt: lastPlayedRaw,
        } as any;
      })
    );

    const sorted = results
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aDate = a?.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
        const bDate = b?.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
        return bDate - aDate;
      });

    res.json(sorted);
  } catch (err: any) {
    logger.error('Failed to list recent games', { userId, error: err?.message || err });
    res.status(500).json({ message: 'Failed to list recent games', error: err?.message || String(err) });
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
    'cover_image_url',
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
// (moved '/public' route above '/:id' to avoid conflicts)
