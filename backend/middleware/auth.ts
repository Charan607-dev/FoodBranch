import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../db';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'donor' | 'ngo' | 'volunteer';
  fullName?: string;
  organizationName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      organizationName: user.organizationName,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // If token is present, verify via JWT
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      req.user = decoded;
      return next();
    } catch (err: any) {
      // If token expired or invalid
      res.status(401).json({ error: 'Invalid or expired authorization token.' });
      return;
    }
  }

  const sessionUserId = req.headers['x-user-id'] as string;
  if (sessionUserId) {
    try {
      const resUser = await query(
        `SELECT id, email, role, full_name, organization_name FROM profiles WHERE id = $1`,
        [sessionUserId]
      );
      if (resUser.rows.length > 0) {
        const row = resUser.rows[0];
        req.user = {
          id: row.id,
          email: row.email,
          role: row.role,
          fullName: row.full_name,
          organizationName: row.organization_name,
        };
        return next();
      }
    } catch {
      // Continue to next check
    }
  }

  res.status(401).json({ error: 'Authentication required. Please log in.' });
}

export function requireRole(allowedRoles: ('donor' | 'ngo' | 'volunteer')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Role "${req.user.role}" does not have permission for this action. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
