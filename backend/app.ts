import express, { Express, Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth';
import donationsRouter from './routes/donations';
import notificationsRouter from './routes/notifications';
import healthRouter from './routes/health';
import { isPostgresConfigured } from './db';

export function createExpressApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Comprehensive CORS headers supporting mobile browsers and cross-origin Render deployments
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, Cache-Control, Pragma'
    );
    res.header('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Base API information endpoint
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      service: 'FoodBridge Central Backend API',
      version: '1.0.0',
      databaseEngine: isPostgresConfigured() ? 'PostgreSQL (Render)' : 'Central Synchronized Store',
      status: 'operational',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        donations: '/api/donations',
        notifications: '/api/notifications',
      },
    });
  });

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/donations', donationsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/health', healthRouter);

  // Global error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[Backend Unhandled Error]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}
