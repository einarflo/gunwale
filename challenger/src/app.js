import express from 'express';
import morgan from 'morgan';

import { router as healthRouter } from './routes/health.js';
import { router as generateRouter } from './routes/generate.js';
import { router as optionsRouter } from './routes/options.js';
import { router as cacheRouter } from './routes/cache.js';
import { router as questionsRouter } from './routes/questions.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(morgan('tiny'));

  app.get('/', (req, res) => res.send({ service: 'challenger', endpoints: ['/health', '/v1/generate', '/v1/options', '/v1/questions', '/v1/cache/:id/feedback'] }));

  app.use(healthRouter);
  app.use(generateRouter);
  app.use(optionsRouter);
  app.use(questionsRouter);
  app.use(cacheRouter);

  return app;
}

