import { TelegramBot } from '../config/telegram';
import { PioneerPattern } from '../utils/TransactionAnalyzer';

interface NotificationData {
  type: 'signal' | 'pioneer_signal' | 'system';
  title: string;
  message: string;
  data?: any;
}

interface PioneerNotificationTemplate {
  emoji: string;
  color: string;
  description: string;
}

export class NotificationService {
  private static readonly PIONEER_TEMPLATES: Record<string, PioneerNotificationTemplate> = {
    Protocol_Scout: {
      emoji: '🔍',
      color: '#4CAF50',
      description: 'Early protocol adoption detected'
    },
    Yield_Opportunist: {
      emoji: '📈',
      color: '#2196F3',
      description: 'Complex yield strategy deployed'
    },
    Cross_Chain_Arbitrage: {
      emoji: '⚡',
      color: '#FF9800',
      description: 'Cross-chain opportunity seized'
    },
    RWA_Innovation: {
      emoji: '🏢',
      color: '#9C27B0',
      description: 'Real-world asset strategy launched'
    },
    Treasury_Management: {
      emoji: '🏦',
      color: '#795548',
      description: 'Treasury operation executed'
    }
  };

  private telegramBot: TelegramBot;
  private webhookCallbacks: ((data: NotificationData) => Promise<void>)[];

  constructor(telegramBot: TelegramBot) {
    this.telegramBot = telegramBot;
    this.webhookCallbacks = [];
  }

  public async sendNotification(notification: NotificationData): Promise<void> {
    if (notification.type === 'pioneer_signal') {
      await this.sendPioneerNotification(notification);
    } else {
      // Handle regular notifications
      await this.telegramBot.sendMessage(this.formatRegularNotification(notification));
    }

    // Trigger webhooks
    await Promise.all(
      this.webhookCallbacks.map(callback => callback(notification))
    );
  }

  private async sendPioneerNotification(notification: NotificationData): Promise<void> {
    const pattern = notification.data?.pattern as PioneerPattern;
    if (!pattern) return;

    const template = this.PIONEER_TEMPLATES[pattern.category];
    if (!template) return;

    const formattedMessage = `
${template.emoji} *${notification.title}*
${template.description}

Pattern: ${pattern.name}
Confidence: ${(pattern.confidence * 100).toFixed(1)}%
${notification.message}

🔗 [View Transaction](https://etherscan.io/tx/${notification.data.transaction})
    `.trim();

    await this.telegramBot.sendMessage(formattedMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  private formatRegularNotification(notification: NotificationData): string {
    return `
🚨 *${notification.title}*
${notification.message}
    `.trim();
  }

  public registerWebhook(
    callback: (data: NotificationData) => Promise<void>
  ): void {
    this.webhookCallbacks.push(callback);
  }

  public removeWebhook(
    callback: (data: NotificationData) => Promise<void>
  ): void {
    const index = this.webhookCallbacks.indexOf(callback);
    if (index > -1) {
      this.webhookCallbacks.splice(index, 1);
    }
  }

  public async sendProtocolPatternNotification(data: {
    protocolName: string;
    protocolAddress: string;
    pattern: string;
    message: string;
    severity: 'info' | 'medium' | 'high';
    timestamp: Date;
  }): Promise<void> {
    const emoji = this.getSeverityEmoji(data.severity);
    const formattedMessage = `
${emoji} *Protocol Pattern Detected*
Protocol: ${data.protocolName}
Pattern: ${data.pattern}
${data.message}

🔗 [View Protocol](https://etherscan.io/address/${data.protocolAddress})
    `.trim();

    await this.telegramBot.sendMessage(formattedMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }
}

export default NotificationService;