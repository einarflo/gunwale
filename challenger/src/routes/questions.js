import express from 'express';
import { ollamaGenerate } from '../services/ollama.js';
import { getExactCache, fuzzyFindByPrompt, setCache, touchCacheHit, normalizeText } from '../services/cache.js';

export const router = express.Router();

// Suggest quiz questions from title/description/existing
// Body: { title: string, description?: string, existingQuestions?: string[], count?: number, difficulty?: 'easy'|'medium'|'hard', language?: string, model?: string, prompt_version?: string }
// Query: ?fuzzy=0..1 (optional)
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
  } = req.body || {};

  if (!title || typeof title !== 'string') return res.status(400).send({ error: 'Missing title' });
  const n = Math.max(1, Math.min(10, Number(count) || 5));

  // Keep schema small (we generate options separately)
  const schema = JSON.stringify({ questions: [{ text: 'string', difficulty: 'easy|medium|hard', topic: 'string' }] });
  const instr = `Du er en norsk quizforfatter. Returner KUN gyldig JSON som matcher schemaet. Skriv på ${language === 'nb' ? 'norsk bokmål' : 'norsk'}.`;
  const rules = [
    `Lag ${n} varierte, korte og presise spørsmål.`,
    difficulty === 'mixed' ? 'Bland vanskelighetsgrad (lett/medium/vanskelig).' : `Hold vanskelighetsgrad: ${difficulty}.`,
    'Unngå overlapp og repetisjon. Ikke skriv forklaringer.'
  ].join(' ');

  const existingList = (Array.isArray(existingQuestions) ? existingQuestions : []).slice(0, 20)
    .map((q) => `- ${String(q).slice(0, 140)}`).join('\n');

  const prompt = `SYSTEM:\n${instr}\n\nSCHEMA:\n${schema}\n\nKONTEKST:\nTittel: ${title}\nBeskrivelse: ${description || '(ingen)'}\nEksisterende spørsmål (unngå overlapp):\n${existingList || '(ingen)'}\n\nKRAV:\n${rules}\n\nSVAR:`;

  const kind = 'questions';
  const format = 'json';
  // Cache key uses normalized title/desc and rough signature of existing questions
  const existingSig = normalizeText((existingQuestions || []).join(' | ')).slice(0, 240);
  const cacheKey = `${kind}::${model}::${prompt_version}::${normalizeText(title).slice(0, 160)}::${normalizeText(description).slice(0, 200)}::${existingSig}::${n}::${difficulty}`;
  const fuzzyParam = req.query?.fuzzy;
  const fuzzy = fuzzyParam === undefined ? 0 : Math.max(0, Math.min(1, Number(fuzzyParam)));

  try {
    const exact = await getExactCache(cacheKey);
    if (exact) {
      await touchCacheHit(exact.id, exact.hit_count);
      return res.send({ cached: true, source: 'exact', cache_id: exact.id, data: exact.result });
    }

    if (fuzzy > 0) {
      const best = await fuzzyFindByPrompt({ kind, model, promptVersion: prompt_version, prompt, threshold: fuzzy });
      if (best) {
        const row = best.row;
        await touchCacheHit(row.id, row.hit_count);
        return res.send({ cached: true, source: 'fuzzy', cache_id: row.id, similarity: best.score, data: row.result });
      }
    }

    const payload = await ollamaGenerate({
      model,
      prompt,
      format,
      options: { num_predict: 220, temperature: 0.4, top_p: 0.9, repeat_penalty: 1.1, num_ctx: 2048 }
    });

    let parsed;
    try { parsed = JSON.parse(payload); }
    catch { parsed = { raw: payload }; }

    const cacheId = await setCache({ kind, cacheKey, model, promptVersion: prompt_version, prompt, result: parsed });
    res.send({ cached: false, source: 'generated', cache_id: cacheId, data: parsed });
  } catch (e) {
    const status = e?.response?.status || 500;
    res.status(status).send({ error: 'generation_failed', message: String(e?.message || e) });
  }
});

