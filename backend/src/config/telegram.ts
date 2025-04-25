import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Configure bot commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to DeFi Pioneer Watch! You will receive alerts for significant DeFi movements.');
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Start receiving notifications\n' +
    '/subscribe - Subscribe to specific protocols or patterns\n' +
    '/unsubscribe - Unsubscribe from notifications\n' +
    '/settings - Configure notification preferences\n' +
    '/help - Show this help message'
  );
});

bot.command('subscribe', (ctx) => {
  // TODO: Implement protocol/pattern subscription logic
  ctx.reply('Subscription feature coming soon!');
});

bot.command('unsubscribe', (ctx) => {
  // TODO: Implement unsubscribe logic
  ctx.reply('Unsubscribe feature coming soon!');
});

bot.command('settings', (ctx) => {
  // TODO: Implement settings management
  ctx.reply('Settings configuration coming soon!');
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Telegram bot error: ${err}`);
  ctx.reply('An error occurred while processing your request.');
});

export const telegramBot = bot;

// Helper function to send notifications
export const sendTelegramNotification = async (message: string, chatId?: number) => {
  try {
    if (chatId) {
      await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } else {
      // Broadcast to all subscribed users (implement this when adding user management)
      // For now, just log the message
      console.log('Telegram broadcast:', message);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};