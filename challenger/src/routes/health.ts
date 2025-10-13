import express from 'express';
import { ollamaHealth } from '../services/ollama.js';
import { prisma } from '../prisma.js';

export const router = express.Router();

router.get('/health', async (_req, res) => {
  try {
    await ollamaHealth();
    await prisma.$queryRawUnsafe('SELECT 1');
    res.send({ status: 'ok' });
  } catch (e: any) {
    res.status(500).send({ status: 'error', message: String(e?.message || e) });
  }
});

