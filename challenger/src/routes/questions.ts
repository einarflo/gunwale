import express from 'express';
import { ollamaGenerate, DEFAULT_THREADS } from '../services/ollama.js';
import { getExactCache, fuzzyFindByPrompt, setCache, touchCacheHit, normalizeText } from '../services/cache.js';
import { logDebug, logInfo } from '../utils/logger.js';

export const router = express.Router();

router.post('/v1/questions', async (req, res) => {
  const {
    title,
    description = '',
    existingQuestions = [],
    count = 5,
    difficulty = 'mixed',
    language = 'nb',
    model = 'llama3.2:3b-instruct',
    prompt_version = 'v1'
  } = (req.body || {}) as any;

  if (!title || typeof title !== 'string') return res.status(400).send({ error: 'Missing title' });
  const n = Math.max(1, Math.min(10, Number(count) || 5));

  const schema = JSON.stringify({ questions: [{ text: 'string', difficulty: 'easy|medium|hard', topic: 'string' }] });
  const instr = `Du er en norsk quizforfatter. Returner KUN gyldig JSON som matcher schemaet. Skriv på ${language === 'nb' ? 'norsk bokmål' : 'norsk'}.`;
  const rules = [
    `Lag ${n} varierte, korte og presise spørsmål.`,
    difficulty === 'mixed' ? 'Bland vanskelighetsgrad (lett/medium/vanskelig).' : `Hold vanskelighetsgrad: ${difficulty}.`,
    'Unngå overlapp og repetisjon. Ikke skriv forklaringer.'
  ].join(' ');

  const existingList = (Array.isArray(existingQuestions) ? existingQuestions : []).slice(0, 20)
    .map((q: any) => `- ${String(q).slice(0, 140)}`).join('\n');

  const prompt = `SYSTEM:\n${instr}\n\nSCHEMA:\n${schema}\n\nKONTEKST:\nTittel: ${title}\nBeskrivelse: ${description || '(ingen)'}\nEksisterende spørsmål (unngå overlapp):\n${existingList || '(ingen)'}\n\nKRAV:\n${rules}\n\nSVAR:`;

  const kind = 'questions';
  const format = 'json';
  const existingSig = normalizeText((existingQuestions || []).join(' | ')).slice(0, 240);
  const cacheKey = `${kind}::${model}::${prompt_version}::${normalizeText(title).slice(0, 160)}::${normalizeText(description).slice(0, 200)}::${existingSig}::${n}::${difficulty}`;
  const fuzzyParam = (req.query as any)?.fuzzy;
  const fuzzy = fuzzyParam === undefined ? 0 : Math.max(0, Math.min(1, Number(fuzzyParam)));

  try {
    const t0 = Date.now();
    const threadsParam = (req.query as any)?.threads ?? (req.body as any)?.threads;
    const threads = Math.max(1, Math.min(Number(threadsParam || DEFAULT_THREADS), 128));
    logInfo('req.questions.start', { model, prompt_version, fuzzy, count: n, difficulty, threads });
    const exact = await getExactCache(cacheKey);
    if (exact) {
      await touchCacheHit(exact.id, exact.hit_count);
      const ms = Date.now() - t0;
      res.setHeader('X-Cache-Status', 'HIT');
      res.setHeader('X-Elapsed-ms', String(ms));
      logDebug('req.questions.cache_hit', { cache_id: String(exact.id), ms });
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
        logDebug('req.questions.cache_fuzzy', { cache_id: String(row.id), similarity: best.score, ms });
        return res.send({ cached: true, source: 'fuzzy', cache_id: String(row.id), similarity: best.score, data: row.result });
      }
    }

    const payload = await ollamaGenerate({ model, prompt, format, options: { num_predict: 220, temperature: 0.4, top_p: 0.9, repeat_penalty: 1.1, num_ctx: 2048, num_thread: threads } });

    let parsed: any;
    try { parsed = JSON.parse(payload); }
    catch { parsed = { raw: payload }; }

    const cacheId = await setCache({ kind, cacheKey, model, promptVersion: prompt_version, prompt, result: parsed });
    const ms = Date.now() - t0;
    res.setHeader('X-Cache-Status', 'MISS');
    res.setHeader('X-Elapsed-ms', String(ms));
    logInfo('req.questions.generated', { cache_id: String(cacheId), ms });
    res.send({ cached: false, source: 'generated', cache_id: String(cacheId), data: parsed });
  } catch (e: any) {
    const status = e?.response?.status || 500;
    res.status(status).send({ error: 'generation_failed', message: String(e?.message || e) });
  }
});
