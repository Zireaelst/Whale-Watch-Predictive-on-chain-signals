import { Router, Request, Response } from 'express';
import Signal, { ISignal } from '../models/Signal';

const router = Router();

// Get all signals with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object based on query parameters
    const filter: any = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.priority) filter.priority = parseInt(req.query.priority as string);
    if (req.query.protocol) filter.protocol = req.query.protocol;
    if (req.query.chain) filter.chain = req.query.chain;
    if (req.query.walletAddress) filter.walletAddress = req.query.walletAddress.toString().toLowerCase();

    const signals = await Signal.find(filter)
      .sort({ timestamp: -1, priority: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Signal.countDocuments(filter);

    res.json({
      signals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSignals: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching signals' });
  }
});

// Get signal by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching signal' });
  }
});

// Create new signal
router.post('/', async (req: Request, res: Response) => {
  try {
    const signalData = {
      ...req.body,
      timestamp: new Date(),
      status: 'New'
    };

    const signal = new Signal(signalData);
    await signal.save();

    // Broadcast signal through WebSocket here if needed

    res.status(201).json(signal);
  } catch (error) {
    res.status(500).json({ error: 'Error creating signal' });
  }
});

// Update signal status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const signal = await Signal.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status,
          'metrics.historicalAccuracy': req.body.accuracy || 0
        } 
      },
      { new: true }
    );

    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: 'Error updating signal status' });
  }
});

// Get signals by wallet address
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const signals = await Signal.find({
      walletAddress: req.params.address.toLowerCase()
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Signal.countDocuments({
      walletAddress: req.params.address.toLowerCase()
    });

    res.json({
      signals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSignals: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wallet signals' });
  }
});

// Get signals by protocol
router.get('/protocol/:protocol', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const signals = await Signal.find({
      protocol: req.params.protocol
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Signal.countDocuments({
      protocol: req.params.protocol
    });

    res.json({
      signals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSignals: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching protocol signals' });
  }
});

export default router;