import express from 'express';
import type { Readable } from 'stream';
import { DEFAULT_THREADS, ollamaChatStream, ollamaGenerateStream } from '../services/ollama.js';
import { logDebug, logError, logInfo } from '../utils/logger.js';

export const router = express.Router();

router.post('/v1/stream', async (req, res) => {
  const { prompt, model = 'llama3.2:3b-instruct', format, options = {}, mode } = (req.body || {}) as any;
  if (!prompt || typeof prompt !== 'string') return res.status(400).send({ error: 'Missing prompt' });

  const threadsParam = (req.query as any)?.threads ?? (req.body as any)?.threads;
  const streamMode = (req.query as any)?.mode || mode || 'generate';
  const threads = Math.max(1, Math.min(Number(threadsParam || DEFAULT_THREADS), 128));

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  let closed = false;
  const closeResponse = () => {
    if (closed) return;
    closed = true;
    res.end();
  };
  const sendErrorResponse = (status: number, message: string) => {
    if (closed) return;
    if (!res.headersSent) {
      res.status(status).send({ error: 'generation_failed', message });
    } else {
      res.write(`\n[error] ${message}\n`);
      (res as any).flush?.();
      res.end();
    }
    closed = true;
  };

  try {
    logInfo('req.stream.start', { model, format, threads, mode: streamMode });
    const baseOptions = {
      num_predict: 256,
      temperature: 0.3,
      top_p: 0.9,
      repeat_penalty: 1.1,
      num_ctx: 2048,
      num_thread: threads,
      ...(options || {}),
    };
    const stream: Readable = streamMode === 'chat'
      ? await ollamaChatStream({ model, prompt, options: baseOptions })
      : await ollamaGenerateStream({ model, prompt, format, options: baseOptions });

    req.on('close', () => {
      if (!closed && typeof stream.destroy === 'function') stream.destroy();
    });

    let buffer = '';
    let gotChunk = false;
    let wroteAny = false;
    let loggedPayload = false;
    let loggedRaw = false;
    stream.on('data', (chunk: Buffer) => {
      if (!gotChunk) {
        gotChunk = true;
        logDebug('req.stream.first_chunk', { bytes: chunk.length });
      }
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (!loggedRaw) {
          loggedRaw = true;
          logDebug('req.stream.raw_line', { sample: trimmed.slice(0, 600), length: trimmed.length });
        }
        try {
          const payload = JSON.parse(trimmed);
          if (payload?.error) {
            logError('req.stream.upstream_error', { message: String(payload.error) });
            return sendErrorResponse(502, String(payload.error));
          }
          if (!loggedPayload) {
            loggedPayload = true;
            const messageKeys = payload?.message ? Object.keys(payload.message) : [];
            const firstText = payload?.response ?? payload?.message?.content ?? payload?.message?.reasoning ?? payload?.message?.thoughts ?? '';
            logDebug('req.stream.payload_shape', { keys: Object.keys(payload || {}), messageKeys, responseLen: String(firstText || '').length, done: Boolean(payload?.done) });
          }
          const token = payload?.response ?? payload?.message?.content ?? payload?.message?.reasoning ?? payload?.message?.thoughts;
          if (token !== undefined) {
            const text = typeof token === 'string' ? token : (token ? JSON.stringify(token) : '');
            if (text.length > 0) {
              if (!res.headersSent) (res as any).flushHeaders?.();
              res.write(text);
              (res as any).flush?.();
              wroteAny = true;
            }
            logDebug('req.stream.chunk', { bytes: text.length, done: Boolean(payload?.done) });
          }
          if (payload?.done) closeResponse();
        } catch (e) {
          logError('req.stream.parse_error', { message: (e as Error).message, lineLen: trimmed.length });
        }
      }
    });

    stream.on('end', () => {
      if (!gotChunk) logInfo('req.stream.empty', { model });
      const trimmed = buffer.trim();
      if (trimmed) {
        try {
          const payload = JSON.parse(trimmed);
          if (payload?.error) {
            logError('req.stream.upstream_error', { message: String(payload.error) });
            return sendErrorResponse(502, String(payload.error));
          }
          const token = payload?.response ?? payload?.message?.content ?? payload?.message?.reasoning ?? payload?.message?.thoughts;
          if (token !== undefined) {
            const text = typeof token === 'string' ? token : (token ? JSON.stringify(token) : '');
            if (text.length > 0) {
              if (!res.headersSent) (res as any).flushHeaders?.();
              res.write(text);
              (res as any).flush?.();
              wroteAny = true;
            }
            logDebug('req.stream.end_chunk', { bytes: text.length, done: Boolean(payload?.done) });
          }
        } catch (e) {
          logError('req.stream.parse_error', { message: (e as Error).message });
        }
      }
      if (!wroteAny) logInfo('req.stream.no_output', { model });
      closeResponse();
    });
    stream.on('error', (e: Error) => {
      logError('req.stream.error', { message: e?.message });
      closeResponse();
    });
    stream.resume?.();
  } catch (e: any) {
    if (!closed) {
      const status = e?.response?.status || 500;
      res.status(status).send({ error: 'generation_failed', message: String(e?.message || e) });
    }
  }
});
