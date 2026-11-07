import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createExpressApp } from './backend/app';
import { config } from './backend/config';
import { runMigrations } from './backend/migrate';
import { testConnection } from './backend/db';

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

  const distPath = path.resolve(__dirname, 'dist');
  const indexPath = path.resolve(distPath, 'index.html');
  const hasFrontendDist = fs.existsSync(indexPath);

  if (process.env.NODE_ENV === 'production') {
    if (hasFrontendDist) {
      console.log('[FoodBridge Server] Serving bundled frontend from dist/');
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        // Do not intercept API requests
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(indexPath);
      });
    } else {
      console.log('[FoodBridge Server] Operating as standalone API service (frontend deployed separately, dist/index.html not required).');

      // Root route providing service overview and database status
      app.get('/', async (_req, res) => {
        const dbCheck = await testConnection();
        const dbStatus = dbCheck.connected ? 'connected' : 'disconnected';
        res.json({
          service: 'FoodBridge Backend API Service',
          status: 'online',
          database_status: dbStatus,
          message: 'FoodBridge API service is active. Access endpoints via /api/...',
          endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            donations: '/api/donations',
            notifications: '/api/notifications',
          },
        });
      });

      // Handle unmatched non-API routes with JSON 404
      app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.status(404).json({
          error: 'Not Found',
          message: `The endpoint ${req.method} ${req.path} does not exist on this FoodBridge API service.`,
        });
      });
    }
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
