import axios from 'axios';
import os from 'os';
import { logDebug, logError, logInfo } from '../utils/logger.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT_MS || 90000);
export const DEFAULT_THREADS = Number(process.env.OLLAMA_NUM_THREAD || os.cpus()?.length || 4);

export async function ollamaGenerate({ model, prompt, format = 'json', options = {}, timeoutMs = DEFAULT_TIMEOUT }: { model: string; prompt: string; format?: 'json'|'text'; options?: any; timeoutMs?: number; }) {
  const started = Date.now();
  const opts = { num_thread: DEFAULT_THREADS, ...(options || {}) };
  logDebug('ollama.generate.request', { model, format, promptLen: prompt?.length ?? 0, timeoutMs, num_thread: opts.num_thread });
  try {
    const { data } = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      { model, prompt, stream: false, format, options: opts },
      { timeout: timeoutMs }
    );
    const ms = Date.now() - started;
    logInfo('ollama.generate.ok', { model, ms, bytes: (data?.response?.length ?? 0) });
    return data?.response as string;
  } catch (e: any) {
    const ms = Date.now() - started;
    logError('ollama.generate.error', { model, ms, message: e?.message, code: e?.code, status: e?.response?.status });
    throw e;
  }
}

export async function ollamaHealth() {
  await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 1500 });
  return true as const;
}
