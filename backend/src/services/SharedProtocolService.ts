import { SharedProtocol, ISharedProtocol } from '../models/SharedProtocol';
import { PioneerService } from './PioneerService';
import { NotificationService } from './NotificationService';

export class SharedProtocolService {
  constructor(
    private pioneerService: PioneerService,
    private notificationService: NotificationService
  ) {}

  async recordProtocolInteraction(
    protocolAddress: string,
    protocolName: string,
    pioneerAddress: string,
    success: boolean,
    relatedTokens: string[] = []
  ): Promise<ISharedProtocol> {
    let protocol = await SharedProtocol.findOne({ protocolAddress });
    const now = new Date();

    if (!protocol) {
      protocol = new SharedProtocol({
        protocolAddress,
        protocolName,
        discoveryTimestamp: now,
        lastActivity: now,
        relatedTokens
      });

      // Notify about new protocol discovery
      await this.notificationService.sendProtocolDiscoveryNotification({
        protocolName,
        protocolAddress,
        pioneerAddress,
        timestamp: now
      });
    }

    // Update protocol metrics
    protocol.updatePioneerMetrics(pioneerAddress, success);
    protocol.relatedTokens = [...new Set([...protocol.relatedTokens, ...relatedTokens])];
    
    // Calculate new risk score
    protocol.calculateRiskScore();

    await protocol.save();

    // Check for significant pattern changes
    await this.analyzeProtocolPatterns(protocol);

    return protocol;
  }

  async getSharedProtocols(
    pioneerAddress: string,
    {
      limit = 10,
      offset = 0,
      sortBy = 'lastActivity',
      sortOrder = -1
    }: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 1 | -1;
    } = {}
  ) {
    const query = {
      'pioneers.address': pioneerAddress
    };

    const protocols = await SharedProtocol.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(offset)
      .limit(limit);

    const total = await SharedProtocol.countDocuments(query);

    return {
      protocols,
      total,
      hasMore: offset + protocols.length < total
    };
  }

  async findRelatedPioneers(protocolAddress: string) {
    const protocol = await SharedProtocol.findOne({ protocolAddress });
    if (!protocol) return [];

    const pioneers = await Promise.all(
      protocol.pioneers.map(async p => {
        const metrics = await this.pioneerService.getPioneerMetrics(p.address);
        return {
          address: p.address,
          metrics,
          protocolInteractions: {
            firstInteraction: p.firstInteraction,
            lastInteraction: p.lastInteraction,
            interactionCount: p.interactionCount,
            successRate: p.successRate
          }
        };
      })
    );

    return pioneers.sort((a, b) => 
      b.protocolInteractions.successRate - a.protocolInteractions.successRate
    );
  }

  async getProtocolTrends(timeframe: '24h' | '7d' | '30d' = '7d') {
    const now = new Date();
    const timeframes = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const minTimestamp = new Date(now.getTime() - timeframes[timeframe]);

    const protocols = await SharedProtocol.find({
      lastActivity: { $gte: minTimestamp }
    })
    .sort({ 'pioneers.length': -1, avgSuccessRate: -1 })
    .limit(10);

    return protocols.map(protocol => ({
      protocolAddress: protocol.protocolAddress,
      protocolName: protocol.protocolName,
      pioneerCount: protocol.totalPioneers,
      avgSuccessRate: protocol.avgSuccessRate,
      riskScore: protocol.riskScore,
      tvlTrend: protocol.tvlTrend.filter(t => t.timestamp >= minTimestamp)
    }));
  }

  private async analyzeProtocolPatterns(protocol: ISharedProtocol) {
    const significantChanges = [];
    const recentPioneers = protocol.pioneers.filter(
      p => p.lastInteraction.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    // Check for rapid adoption
    if (
      recentPioneers.length >= 3 &&
      recentPioneers.length / protocol.totalPioneers >= 0.5
    ) {
      significantChanges.push({
        type: 'rapid_adoption',
        message: `Rapid adoption detected for ${protocol.protocolName}`,
        severity: 'high'
      });
    }

    // Check for high success rate
    if (protocol.avgSuccessRate >= 0.8 && protocol.totalPioneers >= 5) {
      significantChanges.push({
        type: 'high_success',
        message: `High success rate maintained for ${protocol.protocolName}`,
        severity: 'medium'
      });
    }

    // Check for risk score changes
    if (protocol.riskScore <= 0.3 && protocol.totalPioneers >= 3) {
      significantChanges.push({
        type: 'low_risk',
        message: `${protocol.protocolName} showing stable, low-risk metrics`,
        severity: 'info'
      });
    }

    // Send notifications for significant changes
    for (const change of significantChanges) {
      await this.notificationService.sendProtocolPatternNotification({
        protocolName: protocol.protocolName,
        protocolAddress: protocol.protocolAddress,
        pattern: change.type,
        message: change.message,
        severity: change.severity,
        timestamp: new Date()
      });
    }
  }
}

export const sharedProtocolService = new SharedProtocolService(
  new PioneerService(),
  new NotificationService()
);