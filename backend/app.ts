import express, { Express, Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth';
import donationsRouter from './routes/donations';
import notificationsRouter from './routes/notifications';
import healthRouter from './routes/health';

export function createExpressApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS and Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
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
