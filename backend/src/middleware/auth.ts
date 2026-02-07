import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (user.isSuspended) {
      res.clearCookie('token');
      res.status(403).json({ message: 'Account suspended' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
