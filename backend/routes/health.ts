import { Router, Request, Response } from 'express';
import { testConnection, query } from '../db';
import { config } from '../config';
import { runMigrations } from '../migrate';

const router = Router();

// GET /api/health - Verifies real database connection
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const connResult = await testConnection();

  let counts: Record<string, number> = {};
  if (connResult.connected) {
    try {
      const uCount = await query('SELECT COUNT(*) FROM users');
      const dCount = await query('SELECT COUNT(*) FROM food_donations');
      const nCount = await query('SELECT COUNT(*) FROM notifications');
      counts = {
        users: parseInt(uCount.rows[0]?.count || '0', 10),
        donations: parseInt(dCount.rows[0]?.count || '0', 10),
        notifications: parseInt(nCount.rows[0]?.count || '0', 10),
      };
    } catch {
      // Non-fatal if tables haven't been created yet
    }
  }

  // Safe masked host info without password
  let maskedHost = 'Not configured';
  if (config.databaseUrl) {
    try {
      const url = new URL(config.databaseUrl);
      maskedHost = `${url.protocol}//${url.username ? '***@' : ''}${url.hostname}${url.pathname}`;
    } catch {
      maskedHost = 'PostgreSQL Connection String Set (Masked)';
    }
  }

  const isConnected = Boolean(connResult.connected);
  const dbStatus = isConnected ? 'connected' : 'disconnected';

  res.json({
    status: isConnected ? 'healthy' : 'degraded',
    database_status: dbStatus,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: isConnected,
      configured: Boolean(config.databaseUrl),
      host: maskedHost,
      name: connResult.databaseName,
      serverTime: connResult.serverTime,
      version: connResult.version,
      latencyMs: connResult.latencyMs,
      tables: connResult.tables || [],
      counts,
      error: connResult.error,
    },
  });
});

// POST /api/health/migrate - Run or re-run schema migrations
router.post('/migrate', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await runMigrations();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
