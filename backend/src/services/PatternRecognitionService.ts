import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { TransactionAnalyzer } from '../../../blockchain/utils/TransactionAnalyzer';

interface TransactionPattern {
  id: string;
  name: string;
  description: string;
  transactions: string[];
  timeframe: number; // in seconds
  minConfidence: number;
}

export class PatternRecognitionService {
  private static readonly KNOWN_PATTERNS: TransactionPattern[] = [
    // Protocol Scout Patterns
    {
      id: 'early_protocol_adoption',
      name: 'Early Protocol Adoption',
      description: 'Early interaction with new protocols within first 7 days of launch',
      transactions: ['deposit', 'stake', 'approve'],
      timeframe: 604800, // 7 days
      minConfidence: 0.65
    },
    {
      id: 'protocol_tvl_growth',
      name: 'Protocol TVL Growth Pioneer',
      description: 'Early participation in protocols that achieve significant TVL growth',
      transactions: ['deposit', 'provide_liquidity'],
      timeframe: 86400, // 1 day
      minConfidence: 0.70
    },
    // Yield Opportunist Patterns
    {
      id: 'complex_yield_strategy',
      name: 'Complex Yield Strategy',
      description: 'Multi-step yield optimization strategy deployment',
      transactions: ['borrow', 'deposit', 'stake', 'leverage'],
      timeframe: 1800, // 30 minutes
      minConfidence: 0.80
    },
    {
      id: 'recursive_lending',
      name: 'Recursive Lending Strategy',
      description: 'Complex lending strategy using multiple protocols',
      transactions: ['borrow', 'deposit', 'leverage'],
      timeframe: 3600, // 1 hour
      minConfidence: 0.75
    },
    // Cross-Chain Arbitrage Patterns
    {
      id: 'cross_chain_arb',
      name: 'Cross-Chain Arbitrage',
      description: 'Rapid capital movement across chains for arbitrage',
      transactions: ['bridge', 'swap', 'transfer'],
      timeframe: 900, // 15 minutes
      minConfidence: 0.85
    },
    {
      id: 'bridge_exploitation',
      name: 'Bridge Opportunity Exploitation',
      description: 'Strategic use of cross-chain bridges for value capture',
      transactions: ['bridge', 'swap'],
      timeframe: 1800, // 30 minutes
      minConfidence: 0.80
    },
    // RWA Innovator Patterns
    {
      id: 'rwa_integration',
      name: 'RWA Integration Pioneer',
      description: 'Early adoption of real-world asset protocols',
      transactions: ['mint', 'deposit', 'collateralize'],
      timeframe: 86400, // 1 day
      minConfidence: 0.75
    },
    {
      id: 'rwa_yield_strategy',
      name: 'RWA Yield Strategy',
      description: 'Complex yield strategies involving real-world assets',
      transactions: ['deposit', 'borrow', 'stake'],
      timeframe: 7200, // 2 hours
      minConfidence: 0.70
    },
    // Protocol Treasury Patterns
    {
      id: 'treasury_management',
      name: 'Treasury Management Strategy',
      description: 'Sophisticated protocol treasury management activities',
      transactions: ['transfer', 'swap', 'stake'],
      timeframe: 86400, // 1 day
      minConfidence: 0.90
    },
    {
      id: 'protocol_owned_liquidity',
      name: 'Protocol-Owned Liquidity Management',
      description: 'Strategic management of protocol-owned liquidity',
      transactions: ['provide_liquidity', 'remove_liquidity', 'stake'],
      timeframe: 43200, // 12 hours
      minConfidence: 0.85
    }
  ];

  private recentTransactions: Map<string, Array<{
    hash: string;
    timestamp: number;
    type: string;
  }>> = new Map();

  public async analyzeTransaction(
    address: string,
    tx: TransactionResponse,
    receipt?: TransactionReceipt
  ) {
    const analysis = await TransactionAnalyzer.analyzeTransaction(tx, receipt);
    
    // Store transaction for pattern matching
    this.storeTransaction(address, {
      hash: tx.hash,
      timestamp: Math.floor(Date.now() / 1000),
      type: analysis.type
    });

    // Check for patterns
    const patterns = this.detectPatterns(address);
    
    return {
      transaction: analysis,
      patterns
    };
  }

  private storeTransaction(
    address: string,
    transaction: { hash: string; timestamp: number; type: string }
  ) {
    if (!this.recentTransactions.has(address)) {
      this.recentTransactions.set(address, []);
    }

    const transactions = this.recentTransactions.get(address)!;
    transactions.push(transaction);

    // Clean up old transactions (older than 24 hours)
    const cutoff = Math.floor(Date.now() / 1000) - 86400;
    this.recentTransactions.set(
      address,
      transactions.filter(tx => tx.timestamp > cutoff)
    );
  }

  private detectPatterns(address: string): Array<{
    pattern: TransactionPattern;
    confidence: number;
    matchedTransactions: string[];
  }> {
    const results = [];
    const transactions = this.recentTransactions.get(address) || [];
    const currentTime = Math.floor(Date.now() / 1000);

    for (const pattern of PatternRecognitionService.KNOWN_PATTERNS) {
      const timeframeCutoff = currentTime - pattern.timeframe;
      const relevantTransactions = transactions.filter(tx => 
        tx.timestamp >= timeframeCutoff
      );

      // Check if transactions match pattern
      const matchedTransactions = relevantTransactions
        .filter(tx => pattern.transactions.some(type => 
          tx.type.toLowerCase().includes(type.toLowerCase())
        ))
        .map(tx => tx.hash);

      if (matchedTransactions.length >= pattern.transactions.length) {
        const confidence = this.calculatePatternConfidence(
          pattern,
          matchedTransactions.length,
          relevantTransactions.length
        );

        if (confidence >= pattern.minConfidence) {
          results.push({
            pattern,
            confidence,
            matchedTransactions
          });
        }
      }
    }

    return results;
  }

  private calculatePatternConfidence(
    pattern: TransactionPattern,
    matchedCount: number,
    totalCount: number
  ): number {
    // Base confidence from match ratio
    let confidence = matchedCount / pattern.transactions.length;

    // Adjust based on total transaction count
    if (totalCount > pattern.transactions.length * 2) {
      confidence *= 0.9; // Reduce confidence if there are many unrelated transactions
    }

    // Time-based adjustment
    const timeSpread = matchedCount > 1 ? 1 : 0.8;
    confidence *= timeSpread;

    return Math.min(confidence, 1);
  }

  public getWalletPatternHistory(address: string) {
    return this.recentTransactions.get(address) || [];
  }

  public clearWalletHistory(address: string) {
    this.recentTransactions.delete(address);
  }
}