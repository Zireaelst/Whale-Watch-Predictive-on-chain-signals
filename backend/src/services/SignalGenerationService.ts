import { Signal } from '../models/Signal';
import { PioneerService } from './PioneerService';
import { TransactionAnalyzer } from '../../blockchain/utils/TransactionAnalyzer';

interface SignalInput {
  type: string;
  category?: string;
  walletAddress: string;
  transaction: {
    hash: string;
    value: string;
    method: string;
  };
  pattern: {
    name: string;
    confidence: number;
  };
  timestamp: Date;
  chainId: number;
}

export class SignalGenerationService {
  private static readonly PIONEER_CATEGORIES = [
    'Protocol_Scout',
    'Yield_Opportunist',
    'Cross_Chain_Arbitrage',
    'RWA_Innovation',
    'Treasury_Management'
  ];

  public async generateSignal(input: SignalInput): Promise<Signal> {
    const isPioneerSignal = input.category && 
      this.PIONEER_CATEGORIES.includes(input.category);

    let signal = new Signal({
      type: input.type,
      priority: await this.calculatePriority(input),
      timestamp: input.timestamp,
      protocol: await this.detectProtocol(input.transaction.hash),
      chain: input.chainId.toString(),
      walletAddress: input.walletAddress,
      transaction: input.transaction,
      pattern: {
        name: input.pattern.name,
        confidence: input.pattern.confidence
      },
      analysis: await this.generateAnalysis(input, isPioneerSignal)
    });

    if (isPioneerSignal) {
      signal.category = input.category;
      signal.pioneerMetrics = await PioneerService.updatePioneerMetrics(input.walletAddress);
    }

    await signal.save();
    return signal;
  }

  private async calculatePriority(input: SignalInput): Promise<number> {
    let priority = 1;

    // Base priority on pattern confidence
    if (input.pattern.confidence >= 0.9) priority += 2;
    else if (input.pattern.confidence >= 0.7) priority += 1;

    // Higher priority for pioneer signals
    if (input.category && this.PIONEER_CATEGORIES.includes(input.category)) {
      priority += 1;
    }

    // Check historical accuracy if it's a pioneer
    if (input.category) {
      const metrics = await PioneerService.updatePioneerMetrics(input.walletAddress);
      if (metrics.successRate >= 0.8) priority += 1;
    }

    return Math.min(priority, 5); // Cap at 5
  }

  private async detectProtocol(txHash: string): Promise<string> {
    // Implementation to detect protocol from transaction
    // This would typically involve checking contract addresses and interaction patterns
    return 'unknown';
  }

  private async generateAnalysis(
    input: SignalInput,
    isPioneerSignal: boolean
  ): Promise<{
    summary: string;
    potentialImpact?: string;
    relatedTokens?: string[];
    tvlImpact?: number;
    estimatedValue?: string;
    strategicContext?: string;
  }> {
    let analysis = {
      summary: `Detected ${input.pattern.name} pattern with ${
        (input.pattern.confidence * 100).toFixed(1)
      }% confidence`
    };

    if (isPioneerSignal) {
      const metrics = await PioneerService.updatePioneerMetrics(input.walletAddress);
      
      // Add pioneer-specific context
      switch (input.category) {
        case 'Protocol_Scout':
          analysis.potentialImpact = 'Potential early protocol adoption signal';
          analysis.strategicContext = `Pioneer has ${
            (metrics.earlyAdoptionSuccess * 100).toFixed(1)
          }% success rate in early protocol adoption`;
          break;

        case 'Yield_Opportunist':
          analysis.potentialImpact = 'Complex yield strategy deployment detected';
          analysis.strategicContext = `Pioneer averages ${
            (metrics.yieldOptimizationROI * 100).toFixed(1)
          }% ROI on yield strategies`;
          break;

        case 'Cross_Chain_Arbitrage':
          analysis.potentialImpact = 'Cross-chain arbitrage opportunity identified';
          analysis.strategicContext = `Pioneer has ${
            (metrics.crossChainEfficiency * 100).toFixed(1)
          }% success rate in cross-chain operations`;
          break;

        case 'RWA_Innovation':
          analysis.potentialImpact = 'New real-world asset strategy detected';
          analysis.strategicContext = `Pioneer has pioneered ${
            metrics.totalTransactions
          } successful RWA strategies`;
          break;

        case 'Treasury_Management':
          analysis.potentialImpact = 'Significant treasury management activity';
          analysis.strategicContext = `Pioneer manages treasury with ${
            (metrics.treasuryManagementScore * 100).toFixed(1)
          }% efficiency rating`;
          break;
      }
    }

    return analysis;
  }
}