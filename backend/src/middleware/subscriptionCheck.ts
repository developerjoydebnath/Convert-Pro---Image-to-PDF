// middleware/subscriptionCheck.ts
import { NextFunction, Response } from 'express';
import Subscription from '../models/Subscription';
import { AuthRequest } from './auth';

export const checkSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Skip for admins
    if (req.user?.role === 'admin') {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const latestSubscription = await Subscription.findOne({
      userId: req.user._id,
      isActive: true
    })
    .sort({ endDate: -1 })
    .limit(1)

    if (!latestSubscription) {
      return res.status(403).json({ 
        message: 'No active subscription found',
        code: 'NO_SUBSCRIPTION'
      });
    }

    const today = new Date();
    const subscriptionEndDate = latestSubscription.endDate ? new Date(latestSubscription.endDate) : null;

    if (subscriptionEndDate && subscriptionEndDate < today) {
      return res.status(403).json({ 
        message: 'Subscription has expired',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Attach subscription info to request for later use
    req.subscription = latestSubscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to your existing types
declare global {
  namespace Express {
    interface Request {
      subscription?: any; // Or use proper Subscription type
    }
  }
}