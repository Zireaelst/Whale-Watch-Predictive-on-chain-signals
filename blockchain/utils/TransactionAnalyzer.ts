import { ethers } from 'ethers';
import { PioneerService } from '../../backend/src/services/PioneerService';

interface PioneerPattern {
  type: string;
  name: string;
  confidence: number;
  category: string;
}

export class TransactionAnalyzer {
  private static readonly KNOWN_PROTOCOLS: { [key: string]: string[] } = {
    // DEX Protocols
    'uniswap': [
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // V3 Router
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'  // V2 Router
    ],
    'curve': [
      '0x99a58482bd75cbab83b27ec03ca68ff489b5788f', // Router
      '0xbabe61887f1de2713c6f97e567623453d3c79f67'  // Factory
    ],
    
    // Lending Protocols
    'aave': [
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // V2 Protocol
      '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'  // V3 Protocol
    ],
    'compound': [
      '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', // Comptroller
      '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'  // cETH
    ],
    
    // RWA Protocols
    'goldfinch': [
      '0x8481a6ebaf5c7dabc3f7e09e44a89531fd31f822', // Senior Pool
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'  // USDC Pool
    ],
    'centrifuge': [
      '0x4abbf7f193460d611eb431373ee84ac9abbd4d96', // Main
      '0x3c1580ce9e792f4eb04cf1d5e3c93d35445fb8c7'  // Tinlake
    ],
    'maple': [
      '0x6f6c8013f639979c84b756c7fc1500eb5af18dc4', // Pool
      '0x0a0b06530768a644f9e8fe23d20dd45ddb415e3e'  // Lending
    ],
    
    // Bridge Protocols
    'arbitrum_bridge': [
      '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', // Gateway
      '0x4c6f947ae67f572afa4ae0730947de7c874f95ef'  // Bridge
    ],
    'optimism_bridge': [
      '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', // Gateway
      '0x3e7ac3dab3e366f96b35a5dba99ea6763be1e917'  // Bridge
    ]
  };

  private static readonly PIONEER_PATTERNS: { [key: string]: PioneerPattern } = {
    // Protocol Scout Patterns
    early_protocol_interaction: {
      type: 'early_protocol_interaction',
      name: 'Early Protocol Interaction',
      confidence: 0.8,
      category: 'Protocol_Scout'
    },
    first_liquidity_provision: {
      type: 'first_liquidity_provision',
      name: 'First Liquidity Provision',
      confidence: 0.85,
      category: 'Protocol_Scout'
    },

    // Yield Opportunist Patterns
    complex_yield_strategy: {
      type: 'complex_yield_strategy',
      name: 'Complex Yield Strategy',
      confidence: 0.75,
      category: 'Yield_Opportunist'
    },
    recursive_lending: {
      type: 'recursive_lending',
      name: 'Recursive Lending Strategy',
      confidence: 0.8,
      category: 'Yield_Opportunist'
    },

    // Cross-Chain Arbitrage Patterns
    cross_chain_arb: {
      type: 'cross_chain_arb',
      name: 'Cross-Chain Arbitrage',
      confidence: 0.9,
      category: 'Cross_Chain_Arbitrage'
    },
    bridge_exploitation: {
      type: 'bridge_exploitation',
      name: 'Bridge Opportunity Exploitation',
      confidence: 0.85,
      category: 'Cross_Chain_Arbitrage'
    },

    // RWA Innovation Patterns
    rwa_integration: {
      type: 'rwa_integration',
      name: 'RWA Integration',
      confidence: 0.7,
      category: 'RWA_Innovation'
    },
    rwa_yield_strategy: {
      type: 'rwa_yield_strategy',
      name: 'RWA Yield Strategy',
      confidence: 0.75,
      category: 'RWA_Innovation'
    },

    // Treasury Management Patterns
    treasury_rebalancing: {
      type: 'treasury_rebalancing',
      name: 'Treasury Rebalancing',
      confidence: 0.9,
      category: 'Treasury_Management'
    },
    revenue_distribution: {
      type: 'revenue_distribution',
      name: 'Revenue Distribution',
      confidence: 0.95,
      category: 'Treasury_Management'
    }
  };

  public static async analyzeTransaction(
    tx: TransactionResponse,
    receipt?: TransactionReceipt
  ): Promise<AnalyzedTransaction> {
    const protocol = this.detectProtocol(tx.to);
    const methodSignature = tx.data.slice(0, 10);
    const pattern = this.detectPattern(methodSignature, tx.data);
    const significance = this.calculateSignificance(tx, receipt);

    return {
      type: this.determineTransactionType(tx, pattern),
      confidence: this.calculateConfidence(tx, pattern, protocol),
      protocol,
      pattern,
      value: tx.value.toString(),
      significance
    };
  }

  private static detectProtocol(address?: string): string | undefined {
    if (!address) return undefined;
    
    const lowercaseAddress = address.toLowerCase();
    for (const [protocol, addresses] of Object.entries(this.KNOWN_PROTOCOLS)) {
      if (addresses.includes(lowercaseAddress)) {
        return protocol;
      }
    }
    return undefined;
  }

  private static detectPattern(methodSig: string, data: string): string | undefined {
    for (const [pattern, signatures] of Object.entries(this.PATTERN_SIGNATURES)) {
      if (signatures.some(sig => data.includes(ethers.utils.id(sig).slice(0, 10)))) {
        return pattern;
      }
    }
    return undefined;
  }

  private static calculateSignificance(
    tx: TransactionResponse,
    receipt?: TransactionReceipt
  ): number {
    let significance = 0;

    // Value-based significance
    if (tx.value.gt(ethers.utils.parseEther('10'))) {
      significance += 2;
    } else if (tx.value.gt(ethers.utils.parseEther('1'))) {
      significance += 1;
    }

    // Complexity-based significance
    if (receipt && receipt.logs.length > 5) {
      significance += 1;
    }
    if (tx.data.length > 1000) {
      significance += 1;
    }

    // Gas-based significance
    if (receipt && receipt.gasUsed.gt(ethers.BigNumber.from('500000'))) {
      significance += 1;
    }

    return Math.min(significance, 5); // Cap at 5
  }

  private static calculateConfidence(
    tx: TransactionResponse,
    pattern?: string,
    protocol?: string
  ): number {
    let confidence = 0.5; // Base confidence

    if (protocol) {
      confidence += 0.2;
    }
    if (pattern) {
      confidence += 0.2;
    }
    if (tx.data.length > 100) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  private static determineTransactionType(
    tx: TransactionResponse,
    pattern?: string
  ): string {
    if (pattern) {
      return pattern;
    }
    if (tx.data.length <= 2) {
      return 'transfer';
    }
    return 'contract_interaction';
  }

  private static async analyzeProtocolInteraction(
    tx: TransactionResponse,
    receipt?: TransactionReceipt
  ) {
    const protocolsUsed = new Set<string>();
    
    // Check direct protocol interaction
    if (tx.to) {
      const protocol = this.detectProtocol(tx.to);
      if (protocol) protocolsUsed.add(protocol);
    }
    
    // Check internal calls from receipt
    if (receipt) {
      for (const log of receipt.logs) {
        const protocol = this.detectProtocol(log.address);
        if (protocol) protocolsUsed.add(protocol);
      }
    }
    
    return Array.from(protocolsUsed);
  }

  private static detectComplexStrategy(
    tx: TransactionResponse,
    receipt?: TransactionReceipt
  ): string | undefined {
    if (!receipt) return undefined;
    
    const uniqueContracts = new Set(receipt.logs.map(log => log.address));
    const uniqueSignatures = new Set<string>();
    
    // Extract unique signatures from input data
    const data = tx.data;
    for (let i = 0; i < data.length - 8; i += 2) {
      const potentialSig = data.slice(i, i + 8);
      uniqueSignatures.add(potentialSig);
    }
    
    // Detect complex strategies
    if (uniqueContracts.size >= 3 && uniqueSignatures.size >= 2) {
      if (this.hasPatternSignatures(['flash_loan', 'swap'])) {
        return 'flash_loan_arbitrage';
      }
      if (this.hasPatternSignatures(['borrow', 'leverage'])) {
        return 'leveraged_yield_farming';
      }
      if (this.hasPatternSignatures(['bridge', 'swap'])) {
        return 'cross_chain_arbitrage';
      }
    }
    
    return undefined;
  }
  
  private static hasPatternSignatures(patterns: string[]): boolean {
    return patterns.every(pattern => 
      this.PATTERN_SIGNATURES[pattern]?.some(sig => 
        tx.data.includes(ethers.utils.id(sig).slice(0, 10))
      )
    );
  }

  static async analyzePioneerPattern(
    tx: ethers.Transaction,
    receipt?: ethers.TransactionReceipt
  ): Promise<PioneerPattern | null> {
    if (!tx || !receipt) return null;

    const methodSig = tx.data.slice(0, 10);
    const logs = receipt.logs;

    // Check for early protocol interaction
    const isNewProtocol = await this.isNewProtocolInteraction(tx.to);
    if (isNewProtocol) {
      return this.PIONEER_PATTERNS.early_protocol_interaction;
    }

    // Check for complex yield strategies
    const hasMultipleProtocolCalls = logs.map(log => log.address).filter(
      (value, index, self) => self.indexOf(value) === index
    ).length >= 3;
    const hasYieldKeywords = tx.data.includes('harvest') || 
                           tx.data.includes('stake') || 
                           tx.data.includes('farm');
    if (hasMultipleProtocolCalls && hasYieldKeywords) {
      return this.PIONEER_PATTERNS.complex_yield_strategy;
    }

    // Check for cross-chain operations
    const isBridgeInteraction = this.isBridgeContract(tx.to);
    const hasSubsequentSwap = logs.some(log => 
      this.isSwapEvent(log) && log.address !== tx.to
    );
    if (isBridgeInteraction && hasSubsequentSwap) {
      return this.PIONEER_PATTERNS.cross_chain_arb;
    }

    // Check for RWA interactions
    const isRWAProtocol = this.isRWAProtocol(tx.to);
    if (isRWAProtocol) {
      const isYieldStrategy = tx.data.includes('yield') || 
                            tx.data.includes('interest') ||
                            tx.data.includes('borrow');
      return isYieldStrategy 
        ? this.PIONEER_PATTERNS.rwa_yield_strategy
        : this.PIONEER_PATTERNS.rwa_integration;
    }

    // Check for treasury management
    const isTreasuryOperation = this.isTreasuryOperation(tx);
    if (isTreasuryOperation) {
      const isDistribution = tx.data.includes('distribute') || 
                           tx.data.includes('allocate');
      return isDistribution
        ? this.PIONEER_PATTERNS.revenue_distribution
        : this.PIONEER_PATTERNS.treasury_rebalancing;
    }

    return null;
  }

  private static async isNewProtocolInteraction(address: string): Promise<boolean> {
    // Implementation would check if this protocol address is new
    // or has low TVL/user count
    return false;
  }

  private static isBridgeContract(address: string): boolean {
    // Known bridge contract addresses
    const bridgeAddresses = [
      '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', // Arbitrum
      '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', // Optimism
      // Add more bridge addresses
    ];
    return bridgeAddresses.includes(address.toLowerCase());
  }

  private static isSwapEvent(log: ethers.Log): boolean {
    // Common DEX swap event signatures
    const swapEventSignatures = [
      ethers.utils.id('Swap(address,uint256,uint256,uint256,uint256,address)'),
      ethers.utils.id('TokenExchange(address,uint256,uint256,uint256,uint256)'),
      // Add more swap event signatures
    ];
    return swapEventSignatures.includes(log.topics[0]);
  }

  private static isRWAProtocol(address: string): boolean {
    // Known RWA protocol addresses
    const rwaProtocols = [
      '0x8481a6ebaf5c7dabc3f7e09e44a89531fd31f822', // Goldfinch
      '0x4abbf7f193460d611eb431373ee84ac9abbd4d96', // Centrifuge
      // Add more RWA protocol addresses
    ];
    return rwaProtocols.includes(address.toLowerCase());
  }

  private static isTreasuryOperation(tx: ethers.Transaction): boolean {
    // Known treasury operation signatures
    const treasuryOperationSigs = [
      '0x6e553f65', // rebalance()
      '0x7ca3c7c2', // allocate()
      // Add more treasury operation signatures
    ];
    return treasuryOperationSigs.includes(tx.data.slice(0, 10));
  }
}