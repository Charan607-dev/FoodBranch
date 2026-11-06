import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createExpressApp } from './backend/app';
import { config } from './backend/config';
import { runMigrations } from './backend/migrate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createExpressApp();
  const PORT = Number(process.env.PORT) || 3000;

  // Automatically run migrations if DATABASE_URL is provided
  if (config.databaseUrl) {
    console.log('[FoodBridge Server] DATABASE_URL detected. Initializing PostgreSQL tables...');
    try {
      const migrationRes = await runMigrations();
      console.log(`[FoodBridge Server] ${migrationRes.message}`);
    } catch (err: any) {
      console.warn(`[FoodBridge Server] Migration warning: ${err.message}`);
    }
  } else {
    console.log('[FoodBridge Server] Notice: process.env.DATABASE_URL is not set yet. Running with offline/demo fallback.');
  }

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Development mode: hook Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FoodBridge Server] Active and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FoodBridge Server] Fatal error starting server:', err);
  process.exit(1);
});
