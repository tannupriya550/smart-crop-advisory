import { FarmProfile } from "@shared/schema";

const STORAGE_KEYS = {
  FARM_PROFILE: 'crop-advisor-farm-profile',
  USER_PREFERENCES: 'crop-advisor-preferences',
  OFFLINE_DATA: 'crop-advisor-offline-data'
};

export interface UserPreferences {
  language: string;
  units: 'metric' | 'imperial';
  notifications: boolean;
}

export interface OfflineData {
  weatherCache?: any;
  recommendationsCache?: any;
  lastSync?: string;
}

export class LocalStorageManager {
  static saveFarmProfile(profile: Partial<FarmProfile>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FARM_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save farm profile:', error);
    }
  }

  static getFarmProfile(): Partial<FarmProfile> | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FARM_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load farm profile:', error);
      return null;
    }
  }

  static saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {
        language: 'en',
        units: 'metric',
        notifications: true
      };
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {
        language: 'en',
        units: 'metric',
        notifications: true
      };
    }
  }

  static saveOfflineData(data: OfflineData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  static getOfflineData(): OfflineData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return {};
    }
  }

  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}
