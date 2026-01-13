import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { router as healthRouter } from './routes/health.js';
import { router as generateRouter } from './routes/generate.js';
import { router as optionsRouter } from './routes/options.js';
import { router as cacheRouter } from './routes/cache.js';
import { router as questionsRouter } from './routes/questions.js';
import { router as streamRouter } from './routes/stream.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  // CORS: allow cross-origin calls from configured origins (defaults include localhost for dev)
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://ovh.tavl.no',
    'https://ai.tavl.no',
  ];
  const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowAll = envOrigins.includes('*');
  const allowedOrigins = allowAll ? [] : Array.from(new Set([...envOrigins, ...defaultOrigins]));

  const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
      if (
        allowAll ||
        !origin ||
        allowedOrigins.includes(origin) ||
        origin === 'http://localhost:3000' ||
        origin === 'http://127.0.0.1:3000'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: false,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(morgan('tiny'));

  app.get('/', (_req, res) => res.send({ service: 'challenger', endpoints: ['/health', '/v1/generate', '/v1/options', '/v1/questions', '/v1/stream', '/v1/cache/:id/feedback'] }));

  app.use(healthRouter);
  app.use(generateRouter);
  app.use(optionsRouter);
  app.use(questionsRouter);
  app.use(streamRouter);
  app.use(cacheRouter);

  return app;
}
