import express from 'express';
import { ollamaGenerate } from '../services/ollama.js';
import { getExactCache, fuzzyFindByPrompt, setCache, touchCacheHit, normalizeText } from '../services/cache.js';

export const router = express.Router();

router.post('/v1/options', async (req, res) => {
  const {
    question,
    correct_answer = null,
    option_count = 4,
    model = 'llama3.2:3b-instruct',
    prompt_version = 'v1',
    language = 'nb'
  } = req.body || {};

  if (!question || typeof question !== 'string') return res.status(400).send({ error: 'Missing question' });
  const count = Math.max(2, Math.min(6, Number(option_count) || 4));

  const schema = JSON.stringify({ options: [{ text: 'string', isCorrect: true }] });
  const instr = `Du er en norsk quizforfatter. Returner KUN gyldig JSON som matcher schemaet. Skriv på ${language === 'nb' ? 'norsk bokmål' : 'norsk'}.`;
  const rules = [
    `Lag nøyaktig ${count} svaralternativer (korte, presise, unike).`,
    correct_answer
      ? `Inkluder nøyaktig ett korrekt alternativ som matcher fasit. Marker isCorrect true for kun dette, resten false.`
      : `Lag nøyaktig ett korrekt alternativ (basert på spørsmålet) og resten plausible men gale. Marker isCorrect true for kun det korrekte, resten false.`,
    'Ikke skriv forklaring. Ikke bruk "alle over"/"ingen av over". Unngå overlappende alternativer.'
  ].join(' ');

  const prompt = `SYSTEM:\n${instr}\n\nSCHEMA:\n${schema}\n\nOPPGAVE:\nSpørsmål: ${question}\n${correct_answer ? `Fasit: ${correct_answer}\n` : ''}\n\nKRAV:\n${rules}\n\nSVAR:`;

  const kind = 'options';
  const format = 'json';
  const cacheKey = `${kind}::${model}::${prompt_version}::${normalizeText(question).slice(0, 400)}::${normalizeText(correct_answer || '').slice(0, 60)}::${count}`;
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
      options: { num_predict: 160, temperature: 0.3, top_p: 0.9, repeat_penalty: 1.1, num_ctx: 1536 }
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

