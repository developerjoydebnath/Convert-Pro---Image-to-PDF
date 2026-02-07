import { Response, Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import Package from '../models/Package.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = Router();

// Get all subscriptions (admin only)
router.get('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .populate('packageId', 'name price duration')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subscription (admin only)
router.post('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, packageId, startDate, endDate } = req.body;

    if (!userId || !packageId) {
      res.status(400).json({ message: 'User and package are required' });
      return;
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify package exists
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      res.status(404).json({ message: 'Package not found' });
      return;
    }

    // Deactivate any existing active subscription for this user
    await Subscription.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Calculate end date based on package duration
    let calculatedEndDate = endDate ? new Date(endDate) : null;
    const start = startDate ? new Date(startDate) : new Date();
    
    if (!calculatedEndDate && pkg.duration > 0) {
      calculatedEndDate = new Date(start);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + pkg.duration);
    }

    const subscription = await Subscription.create({
      userId,
      packageId,
      startDate: start,
      endDate: calculatedEndDate,
      isActive: true,
    });

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('userId', 'name email')
      .populate('packageId', 'name price duration');

    res.status(201).json(populatedSubscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription (admin only)
router.put('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { packageId, startDate, endDate, isActive } = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        res.status(404).json({ message: 'Package not found' });
        return;
      }
      subscription.packageId = packageId;
    }

    if (startDate) subscription.startDate = new Date(startDate);
    if (endDate !== undefined) subscription.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) subscription.isActive = isActive;

    await subscription.save();

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('userId', 'name email')
      .populate('packageId', 'name price duration');

    res.json(populatedSubscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subscription (admin only)
router.delete('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    await Subscription.findByIdAndDelete(id);
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
