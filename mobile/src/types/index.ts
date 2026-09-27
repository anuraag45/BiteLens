export type NovaGroup = 1 | 2 | 3 | 4;

export type AdditiveStatus = 'Clean' | 'Watchlist' | 'Allergen Alert' | 'Permitted' | 'Ultra-Processed';

export interface Additive {
  code: string;
  name: string;
  purpose: string;
  note: string;
  status: AdditiveStatus;
  category?: 'Preservative' | 'Sweetener' | 'Emulsifier' | 'Colorant' | 'Flavor Enhancer' | 'Acidity Regulator' | 'Other';
}

export interface CleanSwapRecommendation {
  recommendedBarcode: string;
  recommendedName: string;
  reason: string;
}

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  categoryLabel: string;
  image: string;
  size: string;
  price: number;
  novaGroup: NovaGroup;
  novaLabel: string;
  novaBg: string;
  novaColor: string;
  healthScore: number;
  goalFit: string;
  goalColor: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  sodium: number;
  dietaryFiber: number;
  allergens: string[] | string;
  additives: Additive[];
  summary: string;
  swaps: CleanSwapRecommendation | null;
}

export interface DietaryRules {
  vegetarian: boolean;
  diabetic: boolean;
  lowSodium: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
}

export interface DietaryViolation {
  rule: keyof DietaryRules;
  title: string;
  detail: string;
}

export interface DietaryComplianceResult {
  status: 'PASS' | 'WARNING' | 'VIOLATION';
  activeRuleCount: number;
  violations: DietaryViolation[];
  warnings: DietaryViolation[];
  passes: string[];
}

export interface ScanHistoryItem {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  novaGroup: NovaGroup;
  novaBg: string;
  novaColor: string;
  healthScore: number;
  calories: number;
  sugars: number;
  sodium: number;
  timestamp: string;
}

export interface LoggedSnack {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  calories: number;
  sodium: number;
  sugars: number;
  timestamp: string;
}

export interface SnackBudget {
  targetCalories: number;
  targetSodium: number;
  targetSugars: number;
  loggedSnacks: LoggedSnack[];
}

export type HealthGoal = 'maintenance' | 'fat_loss' | 'muscle_gain';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  isMinor: boolean;
  parentalConsentGiven: boolean;
  goal: HealthGoal;
  bmr?: number;
  tdee?: number;
  bmi?: number;
}
