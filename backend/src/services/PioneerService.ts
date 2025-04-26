import { Pioneer, PioneerDoc, PioneerMetrics } from '../models/Pioneer';
import { Wallet } from '../models/Wallet';
import { TransactionAnalyzer } from '../../blockchain/utils/TransactionAnalyzer';
import { ethers } from 'ethers';
import mongoose from 'mongoose';

export class PioneerService {
  private static readonly PIONEER_THRESHOLDS = {
    MIN_TRANSACTIONS: 50,
    MIN_SUCCESS_RATE: 0.65,
    EARLY_ADOPTION_WINDOW: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    TVL_GROWTH_THRESHOLD: 5, // 5x growth
    YIELD_OUTPERFORM_THRESHOLD: 0.15, // 15% above benchmark
  };

  static async updatePioneerMetrics(address: string): Promise<PioneerMetrics> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ address: address.toLowerCase() }).session(session);
      if (!wallet) throw new Error('Wallet not found');

      let pioneer = await Pioneer.findOne({ wallet: wallet._id }).session(session);
      if (!pioneer) {
        pioneer = new Pioneer({ wallet: wallet._id });
      }

      // Update early adoption success
      const earlyAdoptions = pioneer.discoveredProtocols.filter(
        p => p.timestamp.getTime() <= Date.now() - this.PIONEER_THRESHOLDS.EARLY_ADOPTION_WINDOW
      );
      const earlyAdoptionSuccess = earlyAdoptions.length > 0
        ? earlyAdoptions.filter(p => p.success).length / earlyAdoptions.length
        : 0;

      // Update yield optimization ROI
      const yieldStrategies = pioneer.strategyDeployments.filter(
        s => s.type.includes('yield') || s.type.includes('farming')
      );
      const avgROI = yieldStrategies.length > 0
        ? yieldStrategies.reduce((sum, s) => sum + (s.roi || 0), 0) / yieldStrategies.length
        : 0;

      // Update cross-chain efficiency
      const crossChainOps = pioneer.chainActivity.reduce(
        (sum, activity) => sum + activity.transactionCount,
        0
      );
      const crossChainSuccess = pioneer.chainActivity.reduce(
        (sum, activity) => sum + (activity.successRate * activity.transactionCount),
        0
      );
      const crossChainEfficiency = crossChainOps > 0
        ? crossChainSuccess / crossChainOps
        : 0;

      // Update RWA innovation score
      const rwaStrategies = pioneer.strategyDeployments.filter(
        s => s.type.includes('RWA') || s.type.includes('real_world')
      );
      const rwaSuccess = rwaStrategies.filter(s => s.success).length;
      const rwaInnovationScore = rwaStrategies.length > 0
        ? rwaSuccess / rwaStrategies.length
        : 0;

      // Update treasury management score
      const treasuryOps = pioneer.strategyDeployments.filter(
        s => s.type.includes('treasury') || s.type.includes('governance')
      );
      const treasurySuccess = treasuryOps.filter(s => s.success).length;
      const treasuryManagementScore = treasuryOps.length > 0
        ? treasurySuccess / treasuryOps.length
        : 0;

      // Update overall metrics
      const metrics: PioneerMetrics = {
        earlyAdoptionSuccess,
        yieldOptimizationROI: avgROI,
        crossChainEfficiency,
        rwaInnovationScore,
        treasuryManagementScore,
        successRate: wallet.successRate,
        totalTransactions: wallet.totalTransactions
      };

      pioneer.metrics = metrics;

      // Update categories based on metrics
      pioneer.categories = [];
      if (earlyAdoptionSuccess >= this.PIONEER_THRESHOLDS.MIN_SUCCESS_RATE) {
        pioneer.categories.push('Protocol_Scout');
      }
      if (avgROI >= this.PIONEER_THRESHOLDS.YIELD_OUTPERFORM_THRESHOLD) {
        pioneer.categories.push('Yield_Opportunist');
      }
      if (crossChainEfficiency >= this.PIONEER_THRESHOLDS.MIN_SUCCESS_RATE) {
        pioneer.categories.push('Cross_Chain_Arbitrage');
      }
      if (rwaInnovationScore >= this.PIONEER_THRESHOLDS.MIN_SUCCESS_RATE) {
        pioneer.categories.push('RWA_Innovation');
      }
      if (treasuryManagementScore >= this.PIONEER_THRESHOLDS.MIN_SUCCESS_RATE) {
        pioneer.categories.push('Treasury_Management');
      }

      await pioneer.save({ session });
      await session.commitTransaction();
      return metrics;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async recordProtocolDiscovery(
    address: string,
    protocol: string,
    success: boolean
  ): Promise<void> {
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) throw new Error('Wallet not found');

    let pioneer = await Pioneer.findOne({ wallet: wallet._id });
    if (!pioneer) {
      pioneer = new Pioneer({ wallet: wallet._id });
    }

    pioneer.discoveredProtocols.push({
      protocol,
      timestamp: new Date(),
      success
    });

    await pioneer.save();
    await this.updatePioneerMetrics(address);
  }

  static async recordStrategyDeployment(
    address: string,
    type: string,
    success: boolean,
    roi?: number
  ): Promise<void> {
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) throw new Error('Wallet not found');

    let pioneer = await Pioneer.findOne({ wallet: wallet._id });
    if (!pioneer) {
      pioneer = new Pioneer({ wallet: wallet._id });
    }

    pioneer.strategyDeployments.push({
      type,
      timestamp: new Date(),
      success,
      roi
    });

    await pioneer.save();
    await this.updatePioneerMetrics(address);
  }

  static async updateChainActivity(
    address: string,
    chain: string,
    success: boolean
  ): Promise<void> {
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) throw new Error('Wallet not found');

    let pioneer = await Pioneer.findOne({ wallet: wallet._id });
    if (!pioneer) {
      pioneer = new Pioneer({ wallet: wallet._id });
    }

    const chainActivity = pioneer.chainActivity.find(a => a.chain === chain);
    if (chainActivity) {
      chainActivity.transactionCount++;
      chainActivity.successRate = (
        (chainActivity.successRate * (chainActivity.transactionCount - 1) + (success ? 1 : 0)) /
        chainActivity.transactionCount
      );
      chainActivity.lastActive = new Date();
    } else {
      pioneer.chainActivity.push({
        chain,
        transactionCount: 1,
        successRate: success ? 1 : 0,
        lastActive: new Date()
      });
    }

    await pioneer.save();
    await this.updatePioneerMetrics(address);
  }

  static async getPioneers(filters?: {
    categories?: string[];
    minSuccessRate?: number;
    chains?: string[];
  }): Promise<PioneerDoc[]> {
    const query: any = {};

    if (filters?.categories?.length) {
      query.categories = { $in: filters.categories };
    }

    if (filters?.minSuccessRate) {
      query['metrics.successRate'] = { $gte: filters.minSuccessRate };
    }

    if (filters?.chains?.length) {
      query['chainActivity.chain'] = { $in: filters.chains };
    }

    return Pioneer.find(query)
      .populate('wallet')
      .sort({ 'metrics.successRate': -1 });
  }
}