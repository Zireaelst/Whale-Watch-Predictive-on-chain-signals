import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  address: string;
  label?: string;
  category: string[];
  firstSeen: Date;
  lastActive: Date;
  successRate: number;
  totalTransactions: number;
  performanceMetrics: {
    profitableTrades: number;
    totalTrades: number;
    avgROI: number;
  };
  tags: string[];
  watchedProtocols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema({
  address: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    index: true 
  },
  label: { 
    type: String 
  },
  category: [{ 
    type: String,
    enum: ['Protocol_Scout', 'Yield_Opportunist', 'Cross_Chain_Arbitrageur', 'RWA_Innovator', 'Treasury_Manager']
  }],
  pioneerMetrics: {
    earlyAdoptionSuccess: { type: Number, default: 0 }, // Success rate of early protocol adoptions
    yieldOptimizationROI: { type: Number, default: 0 }, // Average ROI from yield strategies
    crossChainEfficiency: { type: Number, default: 0 }, // Success rate of cross-chain operations
    rwaInnovationScore: { type: Number, default: 0 }, // Score for RWA strategy innovation
    treasuryManagementScore: { type: Number, default: 0 } // Score for treasury management success
  },
  firstSeen: { 
    type: Date, 
    required: true 
  },
  lastActive: { 
    type: Date, 
    required: true 
  },
  successRate: { 
    type: Number, 
    default: 0 
  },
  totalTransactions: { 
    type: Number, 
    default: 0 
  },
  performanceMetrics: {
    profitableTrades: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    avgROI: { type: Number, default: 0 },
    protocolDiscoveries: { type: Number, default: 0 }, // Number of new protocols discovered early
    innovativeStrategies: { type: Number, default: 0 } // Number of unique strategies deployed
  },
  riskProfile: {
    leverageUsage: { type: Number, default: 0 }, // 0-1 scale of leverage usage
    diversification: { type: Number, default: 0 }, // 0-1 scale of portfolio diversification
    tvlExposure: { type: Number, default: 0 }, // Average TVL exposure
    innovationIndex: { type: Number, default: 0 } // 0-1 scale of strategy innovation
  },
  strategicFocus: [{
    protocol: { type: String },
    weight: { type: Number }, // 0-1 scale of focus
    successRate: { type: Number },
    lastInteraction: { type: Date }
  }],
  chainActivity: [{
    chain: { type: String },
    transactionCount: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastActive: { type: Date }
  }],
  watchedProtocols: [{ 
    type: String 
  }],
  tags: [{ 
    type: String 
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
WalletSchema.index({ category: 1 });
WalletSchema.index({ successRate: -1 });
WalletSchema.index({ lastActive: -1 });

export default mongoose.model<IWallet>('Wallet', WalletSchema);