import { PioneerSettings } from '../types';

interface NotificationSettings {
  enabled: boolean;
  minPriority: number;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

interface FilterSettings {
  categories: string[];
  minSuccessRate: number;
  chains: string[];
  protocols: string[];
}

interface UserSettings {
  notifications: NotificationSettings;
  filters: FilterSettings;
  appearance: {
    theme: 'light' | 'dark';
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    enabled: true,
    minPriority: 1,
    soundEnabled: true,
    desktopNotifications: true
  },
  filters: {
    categories: [],
    minSuccessRate: 0.65,
    chains: [],
    protocols: []
  },
  appearance: {
    theme: 'light'
  }
};

const STORAGE_KEYS = {
  GENERAL_SETTINGS: 'whalewatch_settings',
  NOTIFICATION_SETTINGS: 'whalewatch_notifications',
  PIONEER_SETTINGS: 'whalewatch_pioneer_settings',
  PIONEER_FILTERS: 'whalewatch_pioneer_filters'
};

interface StoredPioneerSettings extends PioneerSettings {
  lastUpdateTimestamp: number;
}

class SettingsService {
  private readonly STORAGE_KEY = 'defi-pioneer-watch-settings';
  private settings: UserSettings;

  constructor() {
    const savedSettings = localStorage.getItem(this.STORAGE_KEY);
    this.settings = savedSettings
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }
      : DEFAULT_SETTINGS;
  }

  getSettings(): UserSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<UserSettings>) {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
    this.saveSettings();
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>) {
    this.settings.notifications = {
      ...this.settings.notifications,
      ...settings,
    };
    this.saveSettings();
  }

  updateFilterSettings(settings: Partial<FilterSettings>) {
    this.settings.filters = {
      ...this.settings.filters,
      ...settings,
    };
    this.saveSettings();
  }

  setTheme(theme: 'light' | 'dark') {
    this.settings.appearance = {
      ...this.settings.appearance,
      theme
    };
    this.saveSettings();
  }

  shouldNotify(priority: number): boolean {
    return (
      this.settings.notifications.enabled &&
      priority >= this.settings.notifications.minPriority
    );
  }

  private saveSettings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  }

  // Pioneer Settings
  public getPioneerSettings(): StoredPioneerSettings {
    const defaultSettings: StoredPioneerSettings = {
      minTransactions: 50,
      minSuccessRate: 0.65,
      updateInterval: 300,
      notificationSettings: {
        protocolSignals: true,
        strategySignals: true,
        trendSignals: true
      },
      lastUpdateTimestamp: Date.now()
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PIONEER_SETTINGS);
      if (!stored) return defaultSettings;

      const parsed = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...parsed,
        notificationSettings: {
          ...defaultSettings.notificationSettings,
          ...parsed.notificationSettings
        }
      };
    } catch (error) {
      console.error('Failed to load pioneer settings:', error);
      return defaultSettings;
    }
  }

  public savePioneerSettings(settings: Partial<PioneerSettings>): void {
    try {
      const current = this.getPioneerSettings();
      const updated: StoredPioneerSettings = {
        ...current,
        ...settings,
        notificationSettings: {
          ...current.notificationSettings,
          ...(settings.notificationSettings || {})
        },
        lastUpdateTimestamp: Date.now()
      };

      localStorage.setItem(
        STORAGE_KEYS.PIONEER_SETTINGS,
        JSON.stringify(updated)
      );

      // Dispatch event for real-time updates
      window.dispatchEvent(
        new CustomEvent('pioneerSettingsChanged', { detail: updated })
      );
    } catch (error) {
      console.error('Failed to save pioneer settings:', error);
      throw error;
    }
  }

  public getPioneerFilters() {
    const defaultFilters = {
      categories: [],
      minSuccessRate: 0.65,
      chains: [],
      protocols: []
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PIONEER_FILTERS);
      if (!stored) return defaultFilters;

      return {
        ...defaultFilters,
        ...JSON.parse(stored)
      };
    } catch (error) {
      console.error('Failed to load pioneer filters:', error);
      return defaultFilters;
    }
  }

  public savePioneerFilters(filters: {
    categories?: string[];
    minSuccessRate?: number;
    chains?: string[];
    protocols?: string[];
  }): void {
    try {
      const current = this.getPioneerFilters();
      const updated = {
        ...current,
        ...filters
      };

      localStorage.setItem(
        STORAGE_KEYS.PIONEER_FILTERS,
        JSON.stringify(updated)
      );

      // Dispatch event for real-time updates
      window.dispatchEvent(
        new CustomEvent('pioneerFiltersChanged', { detail: updated })
      );
    } catch (error) {
      console.error('Failed to save pioneer filters:', error);
      throw error;
    }
  }

  public clearPioneerData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PIONEER_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PIONEER_FILTERS);

      // Dispatch events to notify of cleared data
      window.dispatchEvent(new Event('pioneerSettingsChanged'));
      window.dispatchEvent(new Event('pioneerFiltersChanged'));
    } catch (error) {
      console.error('Failed to clear pioneer data:', error);
      throw error;
    }
  }
}

const settingsService = new SettingsService();
export default settingsService;