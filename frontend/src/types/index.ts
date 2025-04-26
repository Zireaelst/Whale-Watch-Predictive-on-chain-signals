export type PioneerCategory =
  | 'Protocol_Scout'
  | 'Yield_Opportunist'
  | 'Cross_Chain_Arbitrage'
  | 'RWA_Innovation'
  | 'Treasury_Management';

export interface Signal {
  id: string;
  type: string;
  priority: number;
  timestamp: string;
  protocol: string;
  chain: string;
  pattern: {
    name: string;
    confidence: number;
  };
  walletAddress: string;
}

export interface PioneerMetrics {
  earlyAdoptionSuccess: number;
  yieldOptimizationROI: number;
  crossChainEfficiency: number;
  rwaInnovationScore: number;
  treasuryManagementScore: number;
  successRate: number;
  totalTransactions: number;
}

export interface PioneerFilters {
  categories: PioneerCategory[];
  minSuccessRate: number;
  chains: string[];
}

export interface PioneerSettings {
  minTransactions: number;
  minSuccessRate: number;
  updateInterval: number;
  notificationSettings: {
    protocolSignals: boolean;
    strategySignals: boolean;
    trendSignals: boolean;
  };
}

export interface PioneerSignal {
  id: string;
  type: string;
  category: PioneerCategory;
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
  analysis: {
    summary: string;
    potentialImpact?: string;
    relatedTokens?: string[];
    tvlImpact?: number;
    estimatedValue?: string;
    strategicContext?: string;
  };
  metrics: {
    historicalAccuracy: number;
    patternReliability: number;
  };
  timestamp: string;
}

export interface Pioneer {
  address: string;
  metrics: PioneerMetrics;
  categories: PioneerCategory[];
  discoveredProtocols: Array<{
    protocol: string;
    timestamp: string;
    success: boolean;
  }>;
  strategyDeployments: Array<{
    type: string;
    timestamp: string;
    success: boolean;
    roi?: number;
  }>;
  chainActivity: Array<{
    chain: string;
    transactionCount: number;
    successRate: number;
    lastActive: string;
  }>;
}

export interface PioneerContextType {
  activePioneers: string[];
  pioneerMetrics: Record<string, PioneerMetrics>;
  filters: PioneerFilters;
  settings: PioneerSettings;
  updateFilters: (filters: Partial<PioneerFilters>) => void;
  updateSettings: (settings: Partial<PioneerSettings>) => void;
  addPioneer: (address: string) => Promise<void>;
  removePioneer: (address: string) => Promise<void>;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
  action?: () => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}