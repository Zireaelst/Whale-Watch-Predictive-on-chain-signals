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

    this.storeNotification(notification);

    notificationQueue.add({
      id: signal.id,
      title: notification.title,
      message: notification.message,
      type: signal.type as any,
      timestamp: Date.now(),
      priority: signal.priority,
      read: false
    });

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

    // Play sound if enabled
    if (settings.notifications.soundEnabled) {
      const soundType = signal.priority >= 8 ? 'alert' : 'notification';
      audioManager.playNotification(soundType);
    }
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
        title: notification.title,
        message: notification.message,
        type: 'error',
        timestamp: Date.now(),
        priority: 10,
        read: false
      });

      if (settings.notifications.soundEnabled) {
        audioManager.playNotification('disconnect');
      }
    } else {
      const notification: StoredNotification = {
        id: `connection-${Date.now()}`,
        title: 'Connection Restored',
        message: 'Successfully reconnected to DeFi Pioneer Watch.',
        timestamp: new Date().toISOString(),
        priority: 9,
      };

      this.storeNotification(notification);

      notificationQueue.add({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: 'success',
        timestamp: Date.now(),
        priority: 9,
        read: false
      });

      if (settings.notifications.soundEnabled) {
        audioManager.playNotification('connect');
      }
    }
  }

  clearAllNotifications() {
    localStorage.setItem('notifications', '[]');
    localStorage.removeItem('lastNotificationRead');
    notificationQueue.clear();
  }

  cleanup() {
    audioManager.dispose();
  }
}

const notificationService = new NotificationService();
export default notificationService;