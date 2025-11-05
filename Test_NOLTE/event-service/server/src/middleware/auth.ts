/**
 * Authentication Middleware
 * Validates Bearer token for protected endpoints
 */

import { Request, Response, NextFunction } from 'express';

const VALID_TOKEN = 'admin-token-123';

export interface AuthRequest extends Request {
  user?: {
    token: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header is required'
      }
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format. Use: Bearer <token>'
      }
    });
    return;
  }

  const token = parts[1];
  if (token !== VALID_TOKEN) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
    return;
  }

  req.user = { token };
  next();
}
