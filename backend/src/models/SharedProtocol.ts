import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedProtocol extends Document {
  protocolAddress: string;
  protocolName: string;
  pioneers: Array<{
    address: string;
    firstInteraction: Date;
    lastInteraction: Date;
    interactionCount: number;
    successRate: number;
  }>;
  totalPioneers: number;
  avgSuccessRate: number;
  discoveryTimestamp: Date;
  lastActivity: Date;
  riskScore: number;
  tvlTrend: Array<{
    timestamp: Date;
    value: number;
  }>;
  relatedTokens: string[];
}

const SharedProtocolSchema = new Schema({
  protocolAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  protocolName: {
    type: String,
    required: true
  },
  pioneers: [{
    address: {
      type: String,
      required: true
    },
    firstInteraction: {
      type: Date,
      required: true
    },
    lastInteraction: {
      type: Date,
      required: true
    },
    interactionCount: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  }],
  totalPioneers: {
    type: Number,
    default: 0
  },
  avgSuccessRate: {
    type: Number,
    default: 0
  },
  discoveryTimestamp: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    required: true
  },
  riskScore: {
    type: Number,
    default: 0
  },
  tvlTrend: [{
    timestamp: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  }],
  relatedTokens: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
SharedProtocolSchema.index({ 'pioneers.address': 1 });
SharedProtocolSchema.index({ discoveryTimestamp: -1 });
SharedProtocolSchema.index({ lastActivity: -1 });
SharedProtocolSchema.index({ riskScore: 1 });

// Methods to update protocol metrics
SharedProtocolSchema.methods.updatePioneerMetrics = function(
  pioneerAddress: string,
  success: boolean
) {
  const pioneer = this.pioneers.find(p => p.address === pioneerAddress);
  if (pioneer) {
    pioneer.interactionCount += 1;
    pioneer.lastInteraction = new Date();
    pioneer.successRate = (
      (pioneer.successRate * (pioneer.interactionCount - 1) + (success ? 1 : 0)) /
      pioneer.interactionCount
    );
  } else {
    this.pioneers.push({
      address: pioneerAddress,
      firstInteraction: new Date(),
      lastInteraction: new Date(),
      interactionCount: 1,
      successRate: success ? 1 : 0
    });
    this.totalPioneers += 1;
  }

  // Update average success rate
  this.avgSuccessRate = this.pioneers.reduce(
    (acc, p) => acc + p.successRate,
    0
  ) / this.totalPioneers;

  this.lastActivity = new Date();
};

// Calculate risk score based on pioneer activity and success rates
SharedProtocolSchema.methods.calculateRiskScore = function() {
  const pioneerWeights = {
    interactionCount: 0.3,
    successRate: 0.4,
    timeSpan: 0.3
  };

  const scores = this.pioneers.map(pioneer => {
    const timeSpan = (
      pioneer.lastInteraction.getTime() - pioneer.firstInteraction.getTime()
    ) / (1000 * 60 * 60 * 24); // Days

    return {
      interactionScore: Math.min(pioneer.interactionCount / 100, 1),
      successScore: pioneer.successRate,
      timeSpanScore: Math.min(timeSpan / 30, 1) // Normalize to 30 days
    };
  });

  const avgScores = scores.reduce(
    (acc, score) => ({
      interactionScore: acc.interactionScore + score.interactionScore,
      successScore: acc.successScore + score.successScore,
      timeSpanScore: acc.timeSpanScore + score.timeSpanScore
    }),
    { interactionScore: 0, successScore: 0, timeSpanScore: 0 }
  );

  this.riskScore = (
    pioneerWeights.interactionCount * (avgScores.interactionScore / this.totalPioneers) +
    pioneerWeights.successRate * (avgScores.successScore / this.totalPioneers) +
    pioneerWeights.timeSpan * (avgScores.timeSpanScore / this.totalPioneers)
  );

  return this.riskScore;
};

export const SharedProtocol = mongoose.model<ISharedProtocol>(
  'SharedProtocol',
  SharedProtocolSchema
);