type Level = 'debug' | 'info' | 'warn' | 'error';

const DEBUG_ENABLED = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

function ts() {
  return new Date().toISOString();
}

function fmt(level: Level, msg: string, meta?: Record<string, unknown>) {
  const base = `[${ts()}] [${level.toUpperCase()}] ${msg}`;
  if (!meta || Object.keys(meta).length === 0) return base;
  try {
    return `${base} :: ${JSON.stringify(meta)}`;
  } catch {
    return base;
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (DEBUG_ENABLED) console.debug(fmt('debug', msg, meta));
  },
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(fmt('info', msg, meta));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(fmt('warn', msg, meta));
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(fmt('error', msg, meta));
  },
};

