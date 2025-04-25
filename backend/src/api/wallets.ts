import { Router, Request, Response } from 'express';
import Wallet, { IWallet } from '../models/Wallet';

const router = Router();

// Get all wallets with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const wallets = await Wallet.find()
      .sort({ successRate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Wallet.countDocuments();

    res.json({
      wallets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalWallets: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wallets' });
  }
});

// Get wallet by address
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOne({ 
      address: req.params.address.toLowerCase() 
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wallet' });
  }
});

// Add new wallet to track
router.post('/', async (req: Request, res: Response) => {
  try {
    const { address, label, category } = req.body;

    const existingWallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet already exists' });
    }

    const wallet = new Wallet({
      address: address.toLowerCase(),
      label,
      category,
      firstSeen: new Date(),
      lastActive: new Date()
    });

    await wallet.save();
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating wallet' });
  }
});

// Update wallet
router.put('/:address', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { address: req.params.address.toLowerCase() },
      { $set: updates },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Error updating wallet' });
  }
});

// Delete wallet
router.delete('/:address', async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOneAndDelete({
      address: req.params.address.toLowerCase()
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting wallet' });
  }
});

// Get wallet statistics
router.get('/:address/stats', async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOne({
      address: req.params.address.toLowerCase()
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const stats = {
      address: wallet.address,
      successRate: wallet.successRate,
      totalTransactions: wallet.totalTransactions,
      performanceMetrics: wallet.performanceMetrics,
      lastActive: wallet.lastActive
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wallet statistics' });
  }
});

export default router;