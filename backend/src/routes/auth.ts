import { Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { auth, AuthRequest } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/subscriptionCheck.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = Router();

// Login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ message: 'Account suspended. Please contact admin to continue.' });
      return;
    }

    // Check subscription for non-admin users
    if (user.role !== 'admin') {
      const subscription = await Subscription.findOne({
        userId: user._id,
        isActive: true,
      });

      if (!subscription) {
        res.status(403).json({ 
          message: 'No active subscription. Please contact admin to subscribe.',
          code: 'NO_SUBSCRIPTION'
        });
        return;
      }

      // Check if subscription is expired
      if (subscription.endDate && new Date() > subscription.endDate) {
        res.status(403).json({ 
          message: 'Your subscription has expired. Please renew to continue.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
        return;
      }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '12h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req: AuthRequest, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', auth, checkSubscription, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




export default router;
