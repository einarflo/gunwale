import express from 'express';
import { getPool } from '../db.js';
import { ollamaHealth } from '../services/ollama.js';

export const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await ollamaHealth();
    await getPool().query('SELECT 1');
    res.send({ status: 'ok' });
  } catch (e) {
    res.status(500).send({ status: 'error', message: String(e?.message || e) });
  }
});

