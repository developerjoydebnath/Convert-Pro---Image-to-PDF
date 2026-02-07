import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.js';

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};
