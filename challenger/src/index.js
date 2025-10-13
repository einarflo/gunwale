import { createApp } from './app.js';
import { ensureDb } from './db.js';

const PORT = process.env.PORT || 3000;

const app = createApp();

ensureDb()
  .then(() => app.listen(PORT, () => console.log(`[challenger] listening on :${PORT}`)))
  .catch((e) => {
    console.error('Failed to init DB', e);
    process.exit(1);
  });
