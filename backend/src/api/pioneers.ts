import { Router } from 'express';
import { sharedProtocolService } from '../services/SharedProtocolService';
import { pioneerService } from '../services/PioneerService';

const router = Router();

// Schema for pioneer filters
const pioneerFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  minSuccessRate: z.number().min(0).max(1).optional(),
  chains: z.array(z.string()).optional(),
});

// Get all pioneers with optional filtering
router.get('/', async (req, res) => {
  try {
    const filters = pioneerFiltersSchema.parse(req.query);
    const pioneers = await PioneerService.getPioneers(filters);
    res.json(pioneers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get pioneer metrics for a specific address
router.get('/:address/metrics', async (req, res) => {
  try {
    const metrics = await PioneerService.updatePioneerMetrics(req.params.address);
    res.json(metrics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Record a protocol discovery for a pioneer
router.post('/:address/protocol-discovery', validateRequest({
  body: z.object({
    protocol: z.string(),
    success: z.boolean(),
  })
}), async (req, res) => {
  try {
    await PioneerService.recordProtocolDiscovery(
      req.params.address,
      req.body.protocol,
      req.body.success
    );
    res.status(201).json({ message: 'Protocol discovery recorded successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record a strategy deployment for a pioneer
router.post('/:address/strategy-deployment', validateRequest({
  body: z.object({
    type: z.string(),
    success: z.boolean(),
    roi: z.number().optional(),
  })
}), async (req, res) => {
  try {
    await PioneerService.recordStrategyDeployment(
      req.params.address,
      req.body.type,
      req.body.success,
      req.body.roi
    );
    res.status(201).json({ message: 'Strategy deployment recorded successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update chain activity for a pioneer
router.post('/:address/chain-activity', validateRequest({
  body: z.object({
    chain: z.string(),
    success: z.boolean(),
  })
}), async (req, res) => {
  try {
    await PioneerService.updateChainActivity(
      req.params.address,
      req.body.chain,
      req.body.success
    );
    res.status(200).json({ message: 'Chain activity updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Shared Protocol Endpoints
router.post('/protocols/interaction', async (req, res) => {
  try {
    const {
      protocolAddress,
      protocolName,
      pioneerAddress,
      success,
      relatedTokens
    } = req.body;

    const protocol = await sharedProtocolService.recordProtocolInteraction(
      protocolAddress,
      protocolName,
      pioneerAddress,
      success,
      relatedTokens
    );

    res.json(protocol);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to record protocol interaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/protocols/trends', async (req, res) => {
  try {
    const timeframe = req.query.timeframe as '24h' | '7d' | '30d' || '7d';
    const trends = await sharedProtocolService.getProtocolTrends(timeframe);
    res.json(trends);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch protocol trends',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/protocols/:address/pioneers', async (req, res) => {
  try {
    const { address } = req.params;
    const pioneers = await sharedProtocolService.findRelatedPioneers(address);
    res.json(pioneers);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch related pioneers',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/pioneers/:address/protocols', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit, offset, sortBy, sortOrder } = req.query;

    const protocols = await sharedProtocolService.getSharedProtocols(
      address,
      {
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        sortBy: sortBy as string,
        sortOrder: Number(sortOrder) || -1
      }
    );

    res.json(protocols);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch pioneer protocols',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;