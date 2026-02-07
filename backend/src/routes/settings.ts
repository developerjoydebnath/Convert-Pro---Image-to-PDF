import { Response, Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = Router();

// Get settings (public)
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ whatsappNumber: '+8801XXXXXXXXX' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (admin only)
router.put('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { whatsappNumber } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (whatsappNumber) settings.whatsappNumber = whatsappNumber;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
