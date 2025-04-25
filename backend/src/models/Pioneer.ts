import mongoose, { Document, Schema } from 'mongoose';
import { WalletDoc } from './Wallet';

export interface PioneerMetrics {
  earlyAdoptionSuccess: number;
  yieldOptimizationROI: number;
  crossChainEfficiency: number;
  rwaInnovationScore: number;
  treasuryManagementScore: number;
  successRate: number;
  totalTransactions: number;
}

export interface PioneerDoc extends Document {
  wallet: WalletDoc['_id'];
  categories: string[];
  metrics: PioneerMetrics;
  discoveredProtocols: Array<{
    protocol: string;
    timestamp: Date;
    success: boolean;
  }>;
  strategyDeployments: Array<{
    type: string;
    timestamp: Date;
    success: boolean;
    roi?: number;
  }>;
  chainActivity: Array<{
    chain: string;
    transactionCount: number;
    successRate: number;
    lastActive: Date;
  }>;
  updatedAt: Date;
  createdAt: Date;
}

const PioneerSchema = new Schema<PioneerDoc>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      unique: true,
    },
    categories: [{
      type: String,
      enum: [
        'Protocol_Scout',
        'Yield_Opportunist',
        'Cross_Chain_Arbitrage',
        'RWA_Innovation',
        'Treasury_Management'
      ],
    }],
    metrics: {
      earlyAdoptionSuccess: { type: Number, default: 0 },
      yieldOptimizationROI: { type: Number, default: 0 },
      crossChainEfficiency: { type: Number, default: 0 },
      rwaInnovationScore: { type: Number, default: 0 },
      treasuryManagementScore: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      totalTransactions: { type: Number, default: 0 }
    },
    discoveredProtocols: [{
      protocol: { type: String, required: true },
      timestamp: { type: Date, required: true },
      success: { type: Boolean, required: true }
    }],
    strategyDeployments: [{
      type: { type: String, required: true },
      timestamp: { type: Date, required: true },
      success: { type: Boolean, required: true },
      roi: { type: Number }
    }],
    chainActivity: [{
      chain: { type: String, required: true },
      transactionCount: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      lastActive: { type: Date, required: true }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
PioneerSchema.index({ 'metrics.successRate': -1 });
PioneerSchema.index({ 'metrics.earlyAdoptionSuccess': -1 });
PioneerSchema.index({ 'metrics.yieldOptimizationROI': -1 });
PioneerSchema.index({ 'metrics.crossChainEfficiency': -1 });
PioneerSchema.index({ 'metrics.rwaInnovationScore': -1 });
PioneerSchema.index({ categories: 1 });
PioneerSchema.index({ 'chainActivity.chain': 1 });

export const Pioneer = mongoose.model<PioneerDoc>('Pioneer', PioneerSchema);