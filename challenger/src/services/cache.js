import { getPool } from '../db.js';
import { normalizeText, jaccardSimilarity } from '../utils/text.js';

export async function getExactCache(cacheKey) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, result, hit_count FROM ai_cache WHERE cache_key = ? LIMIT 1', [cacheKey]);
  return rows[0] || null;
}

export async function touchCacheHit(id, hitCount) {
  const pool = getPool();
  await pool.query('UPDATE ai_cache SET hit_count = ?, last_hit_at = CURRENT_TIMESTAMP WHERE id = ?', [hitCount + 1, id]);
}

export async function setCache({ kind, cacheKey, model, promptVersion, prompt, result }) {
  const pool = getPool();
  const [ins] = await pool.query(
    'INSERT INTO ai_cache (kind, cache_key, model, prompt_version, prompt, result, hit_count, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)'
    , [kind, cacheKey, model, promptVersion, JSON.stringify({ prompt }), JSON.stringify(result)]
  );
  return ins?.insertId;
}

export async function fuzzyFindByPrompt({ kind, model, promptVersion, prompt, threshold = 0.9, limit = 200 }) {
  const pool = getPool();
  const [cands] = await pool.query(
    'SELECT id, result, hit_count, prompt FROM ai_cache WHERE kind = ? AND model = ? AND (prompt_version = ? OR ? IS NULL) ORDER BY COALESCE(last_hit_at, created_at) DESC LIMIT ?',
    [kind, model, promptVersion, promptVersion, Number(limit)]
  );
  const norm = normalizeText(prompt);
  let best = null;
  for (const r of cands) {
    const ptxt = (() => {
      try { return normalizeText(JSON.parse(r.prompt)?.prompt || ''); } catch { return normalizeText(String(r.prompt || '')); }
    })();
    const score = jaccardSimilarity(norm, ptxt);
    if (!best || score > best.score) best = { row: r, score };
  }
  if (best && best.score >= threshold) return best;
  return null;
}

export { normalizeText };

