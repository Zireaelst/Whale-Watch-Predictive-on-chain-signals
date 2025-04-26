// Map of audio files for different notification types
const audioFiles = {
  notification: '/sounds/notification.mp3',
  alert: '/sounds/alert.mp3',
  connect: '/sounds/connect.mp3',
  disconnect: '/sounds/disconnect.mp3',
  pioneer_discovery: '/audio/pioneer_discovery.mp3',
  pioneer_strategy: '/audio/pioneer_strategy.mp3',
  pioneer_success: '/audio/pioneer_success.mp3',
  pioneer_warning: '/audio/pioneer_warning.mp3'
};

type NotificationSound = keyof typeof audioFiles;

class AudioManager {
  private audioElements: Map<NotificationSound, HTMLAudioElement>;
  private enabled: boolean;
  private maxConcurrentPlays = 3;
  private playingCount = 0;
  private playQueue: Array<{ type: NotificationSound; volume: number }> = [];

  constructor() {
    this.audioElements = new Map();
    this.enabled = true;
  }

  public async initialize() {
    // Clean up existing audio elements first
    this.dispose();

    try {
      // Initialize audio elements
      for (const [key, path] of Object.entries(audioFiles)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        
        // Add event listeners for proper cleanup
        audio.addEventListener('ended', () => {
          this.playingCount--;
          this.processQueue();
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`Audio error for ${key}:`, e);
          this.playingCount--;
          this.processQueue();
        });
        
        this.audioElements.set(key as NotificationSound, audio);
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.enabled = false;
    }
  }

  private async processQueue() {
    if (this.playQueue.length === 0 || this.playingCount >= this.maxConcurrentPlays) {
      return;
    }

    const next = this.playQueue.shift();
    if (next) {
      await this.playNotification(next.type, next.volume);
    }
  }

  public async playNotification(type: NotificationSound, volume: number = 1) {
    if (!this.enabled) return;

    const audio = this.audioElements.get(type);
    if (!audio) return;

    if (this.playingCount >= this.maxConcurrentPlays) {
      this.playQueue.push({ type, volume });
      return;
    }

    try {
      audio.volume = Math.min(Math.max(volume, 0), 1);
      this.playingCount++;
      await audio.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      this.playingCount--;
      this.processQueue();
    }
  }

  public dispose() {
    this.playQueue = [];
    this.playingCount = 0;
    
    for (const audio of this.audioElements.values()) {
      audio.pause();
      audio.src = '';
      audio.remove();
    }
    
    this.audioElements.clear();
  }

  public toggleSound(enabled?: boolean) {
    this.enabled = enabled ?? !this.enabled;
    
    if (!this.enabled) {
      // Stop all playing sounds when disabled
      for (const audio of this.audioElements.values()) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.playQueue = [];
      this.playingCount = 0;
    }
  }

  public playPioneerNotification(category: string, confidence: number) {
    if (!this.enabled) return;

    // Play different sounds based on pioneer category and confidence
    if (confidence >= 0.9) {
      this.playNotification('pioneer_success', 0.7);
    } else if (confidence >= 0.7) {
      this.playNotification('pioneer_discovery', 0.6);
    } else if (confidence >= 0.5) {
      this.playNotification('pioneer_strategy', 0.5);
    } else {
      this.playNotification('pioneer_warning', 0.4);
    }
  }
}

export const audioManager = new AudioManager();