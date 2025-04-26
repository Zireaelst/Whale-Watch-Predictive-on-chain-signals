import { SharedProtocol, ISharedProtocol } from '../models/SharedProtocol';
import { PioneerService } from './PioneerService';
import { NotificationService } from './NotificationService';
import { getAddress } from '@ethersproject/address';
import mongoose from 'mongoose';
import { telegramBot } from '../config/telegram';

type Severity = 'info' | 'medium' | 'high';

interface ProtocolChange {
  type: string;
  message: string;
  severity: Severity;
}

export class SharedProtocolService {
  constructor(
    private pioneerService: PioneerService,
    private notificationService: NotificationService
  ) {}

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
    try {
      // Use getAddress for validation
      getAddress(pioneerAddress);
    } catch (error) {
      throw new Error('Invalid pioneer address format');
    }

    // Validate sorting parameters
    const validSortFields = ['lastActivity', 'totalPioneers', 'avgSuccessRate', 'riskScore'];
    if (!validSortFields.includes(sortBy)) {
      throw new Error('Invalid sort field');
    }

    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortBy] = sortOrder;

    return SharedProtocol.find({
      'pioneers.address': pioneerAddress.toLowerCase()
    })
      .sort(sortOptions)
      .skip(offset)
      .limit(Math.min(limit, 100)); // Prevent excessive queries
  }

  async getProtocolTrends(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<Array<{
    protocolAddress: string;
    protocolName: string;
    riskScore: number;
    tvlTrend: Array<{ timestamp: Date; value: number }>;
  }>> {
    const timeframes = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const minTimestamp = new Date(Date.now() - timeframes[timeframe]);

    const protocols = await SharedProtocol.find({
      lastActivity: { $gte: minTimestamp }
    }).select('protocolAddress protocolName riskScore tvlTrend');

    return protocols.map(protocol => ({
      protocolAddress: protocol.protocolAddress,
      protocolName: protocol.protocolName,
      riskScore: protocol.riskScore,
      tvlTrend: protocol.tvlTrend.filter(t => t.timestamp >= minTimestamp)
    }));
  }

  private async analyzeProtocolPatterns(protocol: ISharedProtocol) {
    const significantChanges: ProtocolChange[] = [];
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
  new NotificationService(telegramBot)
);