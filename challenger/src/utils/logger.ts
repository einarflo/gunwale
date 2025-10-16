type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as Level;
const THRESH = LEVELS[envLevel] ?? LEVELS.info;

function ts() {
  return new Date().toISOString();
}

function fmt(meta?: any) {
  if (!meta) return '';
  try { return ' ' + JSON.stringify(meta); } catch { return ' ' + String(meta); }
}

export function logDebug(msg: string, meta?: any) {
  if (THRESH <= LEVELS.debug) console.log(`[${ts()}] DEBUG ${msg}${fmt(meta)}`);
}
export function logInfo(msg: string, meta?: any) {
  if (THRESH <= LEVELS.info) console.log(`[${ts()}] INFO  ${msg}${fmt(meta)}`);
}
export function logWarn(msg: string, meta?: any) {
  if (THRESH <= LEVELS.warn) console.warn(`[${ts()}] WARN  ${msg}${fmt(meta)}`);
}
export function logError(msg: string, meta?: any) {
  if (THRESH <= LEVELS.error) console.error(`[${ts()}] ERROR ${msg}${fmt(meta)}`);
}

