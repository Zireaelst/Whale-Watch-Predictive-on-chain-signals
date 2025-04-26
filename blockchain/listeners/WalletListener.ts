import { providers } from 'ethers';
import { Block } from '@ethersproject/abstract-provider';
import { TransactionAnalyzer } from '../utils/TransactionAnalyzer';
import { PioneerService } from '../../backend/src/services/PioneerService';
import { SignalGenerationService } from '../../backend/src/services/SignalGenerationService';
import { NotificationService } from '../../backend/src/services/NotificationService';

export class WalletListener {
  private provider: providers.Provider;
  private trackedWallets: Map<string, { lastActive: number }>;
  private signalService: SignalGenerationService;
  private notificationService: NotificationService;
  private cleanupInterval: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STALE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(
    provider: providers.Provider,
    signalService: SignalGenerationService,
    notificationService: NotificationService
  ) {
    this.provider = provider;
    this.trackedWallets = new Map();
    this.signalService = signalService;
    this.notificationService = notificationService;
    this.cleanupInterval = setInterval(() => this.cleanupStaleWallets(), this.CLEANUP_INTERVAL);
  }

  private cleanupStaleWallets() {
    const now = Date.now();
    for (const [address, data] of this.trackedWallets.entries()) {
      if (now - data.lastActive > this.STALE_THRESHOLD) {
        this.trackedWallets.delete(address);
      }
    }
  }

  public addWallet(address: string): void {
    this.trackedWallets.set(address.toLowerCase(), { lastActive: Date.now() });
  }

  public removeWallet(address: string): void {
    this.trackedWallets.delete(address.toLowerCase());
  }

  public async start(): Promise<void> {
    this.provider.on('block', async (blockNumber: number) => {
      try {
        const block = await this.provider.getBlock(blockNumber);
        await this.processBlock(block);
      } catch (error) {
        console.error('Error processing block:', error);
      }
    });
  }

  private async processBlock(block: Block): Promise<void> {
    for (const txHash of block.transactions) {
      try {
        const tx = await this.provider.getTransaction(txHash);
        const receipt = await this.provider.getTransactionReceipt(txHash);

        if (!tx || !tx.from || !tx.to) continue;

        const fromAddress = tx.from.toLowerCase();
        if (this.trackedWallets.has(fromAddress)) {
          this.trackedWallets.set(fromAddress, { lastActive: Date.now() });
          await this.analyzePioneerTransaction(tx, receipt, fromAddress);
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }
  }

  private async analyzePioneerTransaction(
    tx: providers.TransactionResponse,
    receipt: providers.TransactionReceipt,
    pioneerAddress: string
  ): Promise<void> {
    // Analyze the transaction for pioneer patterns
    const pioneerPattern = await TransactionAnalyzer.analyzePioneerPattern(tx, receipt);
    if (!pioneerPattern) return;

    // Record protocol discovery if it's an early adoption pattern
    if (pioneerPattern.category === 'Protocol_Scout') {
      // Call the public method instead of the private one
      const protocol = await TransactionAnalyzer.analyzeProtocolInteraction(tx, receipt);
      if (protocol.length > 0) {
        await PioneerService.recordProtocolDiscovery(
          pioneerAddress,
          protocol[0],
          receipt.status === 1
        );
      }
    }

    // Record strategy deployment for yield or RWA patterns
    if (pioneerPattern.category === 'Yield_Opportunist' || 
        pioneerPattern.category === 'RWA_Innovation') {
      await PioneerService.recordStrategyDeployment(
        pioneerAddress,
        pioneerPattern.type,
        receipt.status === 1
      );
    }

    // Record cross-chain activity
    if (pioneerPattern.category === 'Cross_Chain_Arbitrage') {
      const network = await this.provider.getNetwork();
      await PioneerService.updateChainActivity(
        pioneerAddress,
        network.chainId.toString(),
        receipt.status === 1
      );
    }

    // Generate and emit signal
    const signal = await this.signalService.generateSignal({
      type: pioneerPattern.type,
      category: pioneerPattern.category,
      walletAddress: pioneerAddress,
      transaction: {
        hash: tx.hash,
        value: tx.value.toString(),
        method: tx.data.slice(0, 10)
      },
      pattern: {
        name: pioneerPattern.name,
        confidence: pioneerPattern.confidence
      },
      timestamp: new Date(),
      chainId: (await this.provider.getNetwork()).chainId
    });

    // Send notification for high-confidence patterns
    if (pioneerPattern.confidence >= 0.8) {
      await this.notificationService.sendNotification({
        type: 'pioneer_signal',
        title: `New ${pioneerPattern.category} Signal`,
        message: `Pioneer ${pioneerAddress.slice(0, 6)}...${pioneerAddress.slice(-4)} ` +
                `detected performing ${pioneerPattern.name}`,
        data: {
          pattern: pioneerPattern,
          transaction: tx.hash
        }
      });
    }
  }

  public stop(): void {
    if (this.cleanupInterval) {
      clearTimeout(this.cleanupInterval);
    }
    this.provider.removeAllListeners('block');
  }
}