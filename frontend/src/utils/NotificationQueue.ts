import { audioManager } from './audioUtils';
import { PioneerCategory } from '../types';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'pioneer';
  category?: PioneerCategory;
  confidence?: number;
  timestamp: number;
  priority: number;
  read: boolean;
}

class NotificationQueue {
  private queue: NotificationItem[];
  private maxSize: number;
  private callbacks: Set<(notification: NotificationItem) => void>;

  constructor(maxSize: number = 100) {
    this.queue = [];
    this.maxSize = maxSize;
    this.callbacks = new Set();
  }

  public subscribe(callback: (notification: NotificationItem) => void) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notify(notification: NotificationItem) {
    this.callbacks.forEach(callback => callback(notification));
  }

  public addPioneerNotification(
    title: string,
    message: string,
    category: PioneerCategory,
    confidence: number
  ) {
    // Calculate priority based on category and confidence
    let priority = 1;
    
    // Higher priority for high confidence signals
    if (confidence >= 0.9) priority += 2;
    else if (confidence >= 0.7) priority += 1;

    // Additional priority for certain categories
    if (category === 'Protocol_Scout' || category === 'RWA_Innovation') {
      priority += 1;
    }

    const notification: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type: 'pioneer',
      category,
      confidence,
      timestamp: Date.now(),
      priority,
      read: false
    };

    this.add(notification);

    // Play appropriate sound based on category and confidence
    audioManager.playPioneerNotification(category, confidence);
  }

  public add(notification: NotificationItem) {
    // Add new notification
    this.queue.push(notification);

    // Sort by priority and timestamp
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.timestamp - a.timestamp; // Newer first within same priority
    });

    // Trim queue if it exceeds max size
    if (this.queue.length > this.maxSize) {
      const toRemove = this.queue.length - this.maxSize;
      // Remove oldest, lowest priority items
      this.queue.splice(-toRemove);
    }

    // Notify subscribers
    this.notify(notification);
  }

  public markAsRead(id: string) {
    const notification = this.queue.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notify(notification);
    }
  }

  public markAllAsRead() {
    this.queue.forEach(notification => {
      notification.read = true;
    });
    // Notify for each notification
    this.queue.forEach(notification => this.notify(notification));
  }

  public getUnreadCount() {
    return this.queue.filter(n => !n.read).length;
  }

  public getPioneerNotifications() {
    return this.queue.filter(n => n.type === 'pioneer');
  }

  public getNotificationsByCategory(category: PioneerCategory) {
    return this.queue.filter(
      n => n.type === 'pioneer' && n.category === category
    );
  }

  public clear() {
    this.queue = [];
    this.callbacks.clear();
  }

  public getAll() {
    return [...this.queue];
  }
}

export const notificationQueue = new NotificationQueue();