import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { providers } from 'ethers';

import walletRoutes from './api/wallets';
import signalRoutes from './api/signals';
import { WalletListener } from '../../blockchain/listeners/WalletListener';
import { SignalGenerationService } from './services/SignalGenerationService';
import { NotificationService } from './services/NotificationService';
import { telegramBot } from './config/telegram';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize services
const provider = new providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const signalService = new SignalGenerationService();
const notificationService = new NotificationService(telegramBot);

// Initialize wallet listener with services
const walletListener = new WalletListener(provider, signalService, notificationService);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/wallets', walletRoutes);
app.use('/api/signals', signalRoutes);

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Keep track of connection status
  let isAlive = true;
  const pingInterval = setInterval(() => {
    if (!isAlive) {
      clearInterval(pingInterval);
      return ws.terminate();
    }
    isAlive = false;
    ws.ping();
  }, 30000);

  ws.on('pong', () => {
    isAlive = true;
  });
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'watch_wallet') {
        await walletListener.addWallet(data.address);
        ws.send(JSON.stringify({ 
          type: 'watch_confirmation', 
          address: data.address,
          status: 'success'
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Invalid message format'
      }));
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(pingInterval);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(pingInterval);
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/defi-pioneer');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});