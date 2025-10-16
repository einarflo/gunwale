import express from 'express';
import { ollamaGenerate, DEFAULT_THREADS } from '../services/ollama.js';
import { getExactCache, fuzzyFindByPrompt, setCache, touchCacheHit, normalizeText } from '../services/cache.js';
import { logDebug, logInfo } from '../utils/logger.js';

export const router = express.Router();

router.post('/v1/generate', async (req, res) => {
  const { prompt, model = 'llama3.2:3b-instruct', format = 'json', prompt_version = 'v1', kind = 'generic' } = (req.body || {}) as any;
  if (!prompt || typeof prompt !== 'string') return res.status(400).send({ error: 'Missing prompt' });

  const cacheKey = `${kind}::${model}::${prompt_version}::${normalizeText(prompt).slice(0, 480)}`;
  const fuzzyParam = (req.query as any)?.fuzzy;
  const fuzzy = fuzzyParam === undefined ? 0 : Math.max(0, Math.min(1, Number(fuzzyParam)));

  try {
    const t0 = Date.now();
    const threadsParam = (req.query as any)?.threads ?? (req.body as any)?.threads;
    const threads = Math.max(1, Math.min(Number(threadsParam || DEFAULT_THREADS), 128));
    logInfo('req.generate.start', { kind, model, prompt_version, fuzzy, threads });
    const exact = await getExactCache(cacheKey);
    if (exact) {
      await touchCacheHit(exact.id, exact.hit_count);
      const ms = Date.now() - t0;
      res.setHeader('X-Cache-Status', 'HIT');
      res.setHeader('X-Elapsed-ms', String(ms));
      logDebug('req.generate.cache_hit', { cache_id: String(exact.id), ms });
      return res.send({ cached: true, source: 'exact', cache_id: String(exact.id), data: exact.result });
    }

    if (fuzzy > 0) {
      const best = await fuzzyFindByPrompt({ kind, model, promptVersion: prompt_version, prompt, threshold: fuzzy });
      if (best) {
        const row = best.row as any;
        await touchCacheHit(row.id, row.hit_count);
        const ms = Date.now() - t0;
        res.setHeader('X-Cache-Status', 'HIT-FUZZY');
        res.setHeader('X-Cache-Similarity', String(best.score));
        res.setHeader('X-Elapsed-ms', String(ms));
        logDebug('req.generate.cache_fuzzy', { cache_id: String(row.id), similarity: best.score, ms });
        return res.send({ cached: true, source: 'fuzzy', cache_id: String(row.id), similarity: best.score, data: row.result });
      }
    }

    const payload = await ollamaGenerate({ model, prompt, format, options: { num_predict: 120, temperature: 0.3, top_p: 0.9, repeat_penalty: 1.1, num_ctx: 2048, num_thread: threads } });

    let parsed: any;
    try { parsed = format === 'json' ? JSON.parse(payload) : { text: payload }; }
    catch { parsed = { raw: payload }; }

    const cacheId = await setCache({ kind, cacheKey, model, promptVersion: prompt_version, prompt, result: parsed });
    const ms = Date.now() - t0;
    res.setHeader('X-Cache-Status', 'MISS');
    res.setHeader('X-Elapsed-ms', String(ms));
    logInfo('req.generate.generated', { cache_id: String(cacheId), ms });
    res.send({ cached: false, source: 'generated', cache_id: String(cacheId), data: parsed });
  } catch (e: any) {
    const status = e?.response?.status || 500;
    res.status(status).send({ error: 'generation_failed', message: String(e?.message || e) });
  }
});
