import { ScanHistoryItem, DietaryRules, SnackBudget, HealthGoal } from '../types';

// In-memory fallback if AsyncStorage is initializing or in web preview
const memoryStorage = new Map<string, string>();

const StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStorage.get(key) || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    memoryStorage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    memoryStorage.delete(key);
  }
};

export const AppStorage = {
  // 1. Scan History
  async getScanHistory(): Promise<ScanHistoryItem[]> {
    const raw = await StorageAdapter.getItem('bitelens_scan_history');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async saveScan(item: ScanHistoryItem): Promise<ScanHistoryItem[]> {
    const history = await this.getScanHistory();
    const updated = [
      item,
      ...history.filter(h => h.barcode !== item.barcode)
    ].slice(0, 30);
    await StorageAdapter.setItem('bitelens_scan_history', JSON.stringify(updated));
    return updated;
  },

  async clearHistory(): Promise<void> {
    await StorageAdapter.removeItem('bitelens_scan_history');
  },

  // 2. Favorites
  async getFavorites(): Promise<string[]> {
    const raw = await StorageAdapter.getItem('bitelens_favorites');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async toggleFavorite(barcode: string): Promise<string[]> {
    const favs = await this.getFavorites();
    const updated = favs.includes(barcode)
      ? favs.filter(b => b !== barcode)
      : [barcode, ...favs];
    await StorageAdapter.setItem('bitelens_favorites', JSON.stringify(updated));
    return updated;
  },

  // 3. Dietary Rules
  async getDietaryRules(): Promise<DietaryRules> {
    const raw = await StorageAdapter.getItem('bitelens_dietary_rules');
    if (!raw) {
      return {
        vegetarian: false,
        diabetic: false,
        lowSodium: false,
        glutenFree: false,
        lactoseFree: false
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        vegetarian: false,
        diabetic: false,
        lowSodium: false,
        glutenFree: false,
        lactoseFree: false
      };
    }
  },

  async saveDietaryRules(rules: DietaryRules): Promise<void> {
    await StorageAdapter.setItem('bitelens_dietary_rules', JSON.stringify(rules));
  },

  // 4. Snack Budget
  async getSnackBudget(): Promise<SnackBudget> {
    const raw = await StorageAdapter.getItem('bitelens_snack_budget');
    if (!raw) {
      return {
        targetCalories: 350,
        targetSodium: 500,
        targetSugars: 15,
        loggedSnacks: []
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        targetCalories: 350,
        targetSodium: 500,
        targetSugars: 15,
        loggedSnacks: []
      };
    }
  },

  async saveSnackBudget(budget: SnackBudget): Promise<void> {
    await StorageAdapter.setItem('bitelens_snack_budget', JSON.stringify(budget));
  },

  // 5. User Goal
  async getUserGoal(): Promise<HealthGoal> {
    const raw = await StorageAdapter.getItem('bitelens_user_goal');
    return (raw as HealthGoal) || 'maintenance';
  },

  async saveUserGoal(goal: HealthGoal): Promise<void> {
    await StorageAdapter.setItem('bitelens_user_goal', goal);
  }
};
