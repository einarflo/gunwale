export function normalizeText(s: string = ''): string {
  try {
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s\t\n\r]+/g, ' ')
      .replace(/[^a-z0-9æøåäöüéèáàùîôç\s]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } catch {
    return String(s || '').toLowerCase().trim();
  }
}

function bigrams(s: string): string[] {
  const arr: string[] = [];
  for (let i = 0; i < s.length - 1; i++) arr.push(s.slice(i, i + 2));
  return arr;
}

export function jaccardSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const A = new Set(bigrams(a));
  const B = new Set(bigrams(b));
  const inter = new Set([...A].filter((x) => B.has(x)));
  const union = new Set([...A, ...B]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

