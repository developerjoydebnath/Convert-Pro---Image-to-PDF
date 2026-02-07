import { Response, Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import User from '../models/User.js';
import { forceLogoutUser } from '../socket/index.js';

const router = Router();

// Get all users (admin only)
router.get('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by id (auth)
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ message: 'Cannot delete admin users' });
      return;
    }

    await User.findByIdAndDelete(id);

    // Force logout the deleted user
    forceLogoutUser(id, 'Account deleted');

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Suspend/Activate user (admin only)
router.put('/:id/suspend', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ message: 'Cannot suspend admin users' });
      return;
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    // If suspended, force logout the user immediately
    if (user.isSuspended) {
      forceLogoutUser(id, 'Account suspended');
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment PDF conversions (auth users)
router.post('/increment-conversions', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.totalPdfConversions = (user.totalPdfConversions || 0) + 1;
    await user.save();

    res.json({ totalPdfConversions: user.totalPdfConversions });
  } catch (error) {
    console.error('Increment conversions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
