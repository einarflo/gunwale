import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function ollamaGenerate({ model, prompt, format = 'json', options = {}, timeoutMs = 30000 }: { model: string; prompt: string; format?: 'json'|'text'; options?: any; timeoutMs?: number; }) {
  const { data } = await axios.post(
    `${OLLAMA_BASE_URL}/api/generate`,
    { model, prompt, stream: false, format, options },
    { timeout: timeoutMs }
  );
  return data?.response as string;
}

export async function ollamaHealth() {
  await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 1500 });
  return true as const;
}

