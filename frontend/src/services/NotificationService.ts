import { Signal } from '../types';
import settingsService from './SettingsService';
import { audioManager } from '../utils/audioUtils';
import { notificationQueue } from '../utils/NotificationQueue';

interface StoredNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: number;
  signal?: Signal;
}

const MAX_STORED_NOTIFICATIONS = 100;

class NotificationService {
  private hasPermission: boolean = false;

  async initialize() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }

    await audioManager.initialize();
  }

  private storeNotification(notification: StoredNotification) {
    const stored = this.getStoredNotifications();
    stored.unshift(notification);
    
    // Keep only the latest MAX_STORED_NOTIFICATIONS
    if (stored.length > MAX_STORED_NOTIFICATIONS) {
      stored.length = MAX_STORED_NOTIFICATIONS;
    }

    localStorage.setItem('notifications', JSON.stringify(stored));
  }

  private getStoredNotifications(): StoredNotification[] {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }

  notifyNewSignal(signal: Signal) {
    const settings = settingsService.getSettings();
    if (!settingsService.shouldNotify(signal.priority)) return;

    const notification: StoredNotification = {
      id: signal.id,
      title: `New ${signal.type} Signal Detected`,
      message: `Protocol: ${signal.protocol}\nPattern: ${signal.pattern.name}\nConfidence: ${(signal.pattern.confidence * 100).toFixed(1)}%`,
      timestamp: new Date().toISOString(),
      priority: signal.priority,
      signal,
    };

    // Store the notification
    this.storeNotification(notification);

    notificationQueue.add({
      id: signal.id,
      priority: signal.priority,
      execute: async () => {
        // Handle desktop notifications
        if (this.hasPermission && settings.notifications.desktopNotifications) {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/logo192.png',
            tag: notification.id,
            requireInteraction: signal.priority >= 8,
          });

          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };

          if (signal.priority < 8) {
            setTimeout(() => browserNotification.close(), 5000);
          }
        }

        // Handle sound notifications
        if (settings.notifications.soundEnabled) {
          const soundType = signal.priority >= 8 ? 'alert' : 'notification';
          await audioManager.playSound(soundType);
        }
      }
    });
  }

  notifyConnectionStatus(isConnected: boolean) {
    const settings = settingsService.getSettings();
    
    if (!isConnected) {
      const notification: StoredNotification = {
        id: `connection-${Date.now()}`,
        title: 'Connection Lost',
        message: 'Lost connection to DeFi Pioneer Watch. Attempting to reconnect...',
        timestamp: new Date().toISOString(),
        priority: 10,
      };

      this.storeNotification(notification);

      notificationQueue.add({
        id: notification.id,
        priority: 10,
        execute: async () => {
          if (this.hasPermission && settings.notifications.desktopNotifications) {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo192.png',
              tag: 'connection-status',
            });
          }

          if (settings.notifications.soundEnabled) {
            await audioManager.playSound('disconnect');
          }
        }
      });
    } else {
      const notification: StoredNotification = {
        id: `connection-${Date.now()}`,
        title: 'Connection Restored',
        message: 'Successfully reconnected to DeFi Pioneer Watch.',
        timestamp: new Date().toISOString(),
        priority: 9,
      };

      this.storeNotification(notification);

      if (settings.notifications.soundEnabled) {
        notificationQueue.add({
          id: notification.id,
          priority: 9,
          execute: async () => {
            await audioManager.playSound('connect');
          }
        });
      }
    }
  }

  clearAllNotifications() {
    localStorage.setItem('notifications', '[]');
    localStorage.removeItem('lastNotificationRead');
  }

  cleanup() {
    audioManager.stopAll();
    notificationQueue.clear();
  }
}

export default new NotificationService();