import express from 'express';
import { getPool } from '../db.js';

export const router = express.Router();

router.post('/v1/cache/:id/feedback', async (req, res) => {
  const pool = getPool();
  const id = Number(req.params.id || 0);
  const { vote, user_ref = null, source = 'ui' } = req.body || {};
  if (!id || (vote !== 'up' && vote !== 'down')) return res.status(400).send({ error: 'invalid_request' });
  try {
    const [rows] = await pool.query('SELECT id FROM ai_cache WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).send({ error: 'not_found' });

    await pool.query('INSERT INTO ai_cache_feedback (cache_id, vote, user_ref, source) VALUES (?, ?, ?, ?)', [id, vote, user_ref, source]);
    if (vote === 'up') {
      await pool.query('UPDATE ai_cache SET upvotes = upvotes + 1 WHERE id = ?', [id]);
    } else {
      await pool.query('UPDATE ai_cache SET downvotes = downvotes + 1 WHERE id = ?', [id]);
    }

    res.send({ ok: true });
  } catch (e) {
    res.status(500).send({ error: 'feedback_failed', message: String(e?.message || e) });
  }
});

