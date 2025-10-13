import { prisma } from '../prisma.js';
import { normalizeText, jaccardSimilarity } from '../utils/text.js';

export async function getExactCache(cacheKey: string) {
  const row = await prisma.ai_cache.findUnique({ where: { cache_key: cacheKey }, select: { id: true, result: true, hit_count: true } });
  return row as { id: bigint; result: any; hit_count: number } | null;
}

export async function touchCacheHit(id: bigint, hitCount: number) {
  await prisma.ai_cache.update({ where: { id }, data: { hit_count: hitCount + 1, last_hit_at: new Date() } });
}

export async function setCache(params: { kind: string; cacheKey: string; model?: string; promptVersion?: string; prompt: string; result: any }) {
  const { kind, cacheKey, model, promptVersion, prompt, result } = params;
  const created = await prisma.ai_cache.create({
    data: {
      kind,
      cache_key: cacheKey,
      model: model || null,
      prompt_version: promptVersion || null,
      prompt: { prompt },
      result,
      hit_count: 1,
      created_at: new Date()
    },
    select: { id: true }
  });
  return created.id;
}

export async function fuzzyFindByPrompt(params: { kind: string; model?: string; promptVersion?: string; prompt: string; threshold?: number; limit?: number }) {
  const { kind, model, promptVersion, prompt, threshold = 0.9, limit = 200 } = params;
  const cands = await prisma.ai_cache.findMany({
    where: {
      kind,
      model: model || undefined,
      OR: [
        { prompt_version: promptVersion || undefined },
        { prompt_version: null }
      ]
    },
    orderBy: [{ last_hit_at: 'desc' }, { created_at: 'desc' }],
    take: limit,
    select: { id: true, result: true, hit_count: true, prompt: true }
  });
  const norm = normalizeText(prompt);
  let best: { row: any; score: number } | null = null;
  for (const r of cands) {
    const ptxt = (() => {
      try { return normalizeText((r as any).prompt?.prompt || ''); } catch { return ''; }
    })();
    const score = jaccardSimilarity(norm, ptxt);
    if (!best || score > best.score) best = { row: r, score };
  }
  if (best && best.score >= threshold) return best;
  return null;
}

export { normalizeText };

