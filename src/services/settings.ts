import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'skyalert:settings';

export interface AppSettings {
  alertRadiusKm: 1 | 3 | 5 | 10;
  notifyAll: boolean;
  notifyVerifiedOnly: boolean;
  notifyHighRiskOnly: boolean;
  backgroundLocationEnabled: boolean;
  anonymousReports: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  alertRadiusKm: 5,
  notifyAll: false,
  notifyVerifiedOnly: true,
  notifyHighRiskOnly: false,
  backgroundLocationEnabled: true,
  anonymousReports: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('[settings] save failed:', e);
  }
}