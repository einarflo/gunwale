import express from 'express';
import { prisma } from '../prisma.js';

export const router = express.Router();

router.post('/v1/cache/:id/feedback', async (req, res) => {
  const id = BigInt(req.params.id || '0');
  const { vote, user_ref = null, source = 'ui' } = (req.body || {}) as any;
  if (!id || (vote !== 'up' && vote !== 'down')) return res.status(400).send({ error: 'invalid_request' });
  try {
    const exists = await prisma.ai_cache.findUnique({ where: { id } });
    if (!exists) return res.status(404).send({ error: 'not_found' });

    await prisma.ai_cache_feedback.create({ data: { cache_id: id, vote, user_ref, source } });
    if (vote === 'up') {
      await prisma.ai_cache.update({ where: { id }, data: { upvotes: { increment: 1 } } });
    } else {
      await prisma.ai_cache.update({ where: { id }, data: { downvotes: { increment: 1 } } });
    }

    res.send({ ok: true });
  } catch (e: any) {
    res.status(500).send({ error: 'feedback_failed', message: String(e?.message || e) });
  }
});

