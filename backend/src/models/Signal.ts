import mongoose, { Document, Schema } from 'mongoose';

export interface ISignal extends Document {
  walletAddress: string;
  type: string;
  priority: number;
  timestamp: Date;
  protocol: string;
  chain: string;
  transaction: {
    hash: string;
    value: string;
    method: string;
  };
  pattern: {
    name: string;
    confidence: number;
  };
  analysis: {
    summary: string;
    potentialImpact: string;
    relatedTokens: string[];
  };
  status: string;
  metrics: {
    historicalAccuracy: number;
    patternReliability: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SignalSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Protocol_Scout',
      'Yield_Opportunist',
      'Cross_Chain_Arbitrage',
      'RWA_Innovation',
      'Treasury_Management'
    ],
    index: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  protocol: {
    type: String,
    required: true,
    index: true
  },
  chain: {
    type: String,
    required: true,
    index: true
  },
  transaction: {
    hash: { type: String, required: true },
    value: { type: String, required: true },
    method: { type: String, required: true },
    relatedTxs: [{ type: String }] // For multi-transaction patterns
  },
  pattern: {
    name: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    category: { 
      type: String, 
      enum: [
        'early_adoption',
        'yield_strategy',
        'cross_chain',
        'rwa_integration',
        'treasury_management'
      ],
      required: true
    }
  },
  analysis: {
    summary: { type: String, required: true },
    potentialImpact: { type: String },
    relatedTokens: [{ type: String }],
    tvlImpact: { type: Number }, // Estimated TVL impact
    estimatedValue: { type: String }, // Estimated USD value
    strategicContext: { type: String } // Additional context about the strategy
  },
  metrics: {
    historicalAccuracy: { type: Number, default: 0 },
    patternReliability: { type: Number, default: 0 },
    pioneerScore: { type: Number, default: 0 }, // Score based on pioneer category success
    innovationFactor: { type: Number, default: 0 } // Score for strategy innovation
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Processing', 'Verified', 'Invalid'],
    default: 'New'
  },
  relatedSignals: [{
    type: Schema.Types.ObjectId,
    ref: 'Signal'
  }]
}, {
  timestamps: true
});

// Compound indexes for common query patterns
SignalSchema.index({ walletAddress: 1, timestamp: -1 });
SignalSchema.index({ type: 1, priority: -1, timestamp: -1 });
SignalSchema.index({ protocol: 1, chain: 1, timestamp: -1 });

export default mongoose.model<ISignal>('Signal', SignalSchema);