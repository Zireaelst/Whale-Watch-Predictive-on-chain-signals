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

  constructor() {
    this.audioElements = new Map();
    this.enabled = true;
    this.initializeAudio();
  }

  private initializeAudio() {
    Object.entries(audioFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.audioElements.set(key as NotificationSound, audio);
    });
  }

  public toggleSound(enabled?: boolean) {
    this.enabled = enabled ?? !this.enabled;
  }

  public async playNotification(type: NotificationSound, volume: number = 1) {
    if (!this.enabled) return;

    const audio = this.audioElements.get(type);
    if (!audio) return;

    try {
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
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

  public dispose() {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioElements.clear();
  }
}

export const audioManager = new AudioManager();