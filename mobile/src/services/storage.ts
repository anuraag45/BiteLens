/**
 * BiteLens Mobile - Local Device Storage Service
 * Encapsulates AsyncStorage with type safety for offline-first architecture
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanRecord, UserPreferences } from '../types';

const STORAGE_KEYS = {
  USER_PREFERENCES: '@bitelens_user_preferences',
  SCAN_HISTORY: '@bitelens_scan_history',
  AUTH_TOKEN: '@bitelens_auth_jwt',
  DAILY_SNACKS: '@bitelens_daily_snacks',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  isGuest: true,
  fullName: 'Guest Explorer',
  email: '',
  age: 26,
  weightKg: 70,
  heightCm: 175,
  weightGoal: 'maintain',
  muscleGoal: 'maintain',
  allergens: [],
  useAsianBMICutoff: true,
  parentalConsentGiven: false,
};

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load user preferences from storage:', err);
    return DEFAULT_PREFERENCES;
  }
}

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  try {
    const current = await getUserPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save user preferences:', err);
    throw err;
  }
}

export async function getScanHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load scan history:', err);
    return [];
  }
}

export async function addScanRecord(record: Omit<ScanRecord, 'id' | 'scannedAt'>): Promise<ScanRecord> {
  try {
    const history = await getScanHistory();
    const newRecord: ScanRecord = {
      ...record,
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      scannedAt: new Date().toISOString(),
    };
    // Prepend to top of audit stream (max 50 items)
    const updated = [newRecord, ...history].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.error('Failed to add scan record:', err);
    throw err;
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (err) {
    return null;
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (err) {
    console.error('Failed to update auth token:', err);
  }
}
