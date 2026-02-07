import { Response, Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import Package from '../models/Package.js';

const router = Router();

// Get all active packages (public)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });
    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all packages including inactive (admin only)
router.get('/all', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create package (admin only)
router.post('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, price, duration, description, features, isActive } = req.body;

    if (!name || price === undefined || duration === undefined) {
      res.status(400).json({ message: 'Name, price, and duration are required' });
      return;
    }

    const pkg = await Package.create({
      name,
      price,
      duration,
      description,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(pkg);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update package (admin only)
router.put('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, duration, description, features, isActive } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      res.status(404).json({ message: 'Package not found' });
      return;
    }

    if (name) pkg.name = name;
    if (price !== undefined) pkg.price = price;
    if (duration !== undefined) pkg.duration = duration;
    if (description) pkg.description = description;
    if (features) pkg.features = features;
    if (isActive !== undefined) pkg.isActive = isActive;

    await pkg.save();
    res.json(pkg);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete package (admin only)
router.delete('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      res.status(404).json({ message: 'Package not found' });
      return;
    }

    await Package.findByIdAndDelete(id);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
