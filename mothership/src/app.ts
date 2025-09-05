import express, { Request, Response, NextFunction } from 'express';
import { gamesRouter } from './routes/games';
import { requireAuth } from './middleware/auth';
import { logger } from './lib/logger';
import crypto from 'crypto';

export function createApp() {
  const app = express();

  // Body parsing
  app.use(express.json());

  // CORS (allow local frontend during development)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const dev = process.env.NODE_ENV !== 'production';
    const defaultOrigin = dev ? 'http://localhost:3000' : undefined;
    const allowed = (process.env.CORS_ORIGIN || defaultOrigin || '*').split(',').map(s => s.trim());
    const origin = req.headers.origin as string | undefined;
    if (origin && allowed.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin && allowed.includes('*')) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (allowed.includes('*')) {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Basic request logging with timing
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const reqId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    (req as any).id = reqId;
    logger.info('Incoming request', { id: reqId, method: req.method, path: req.path });
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('Request complete', { id: reqId, status: res.statusCode, durationMs: duration });
    });
    next();
  });

  // Health/root
  app.get('/', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Example secure route
  app.get('/secure', requireAuth(), (_req: Request, res: Response) => {
    res.json({ message: 'secure data' });
  });

  // Routes
  app.use('/games', gamesRouter);

  return app;
}
