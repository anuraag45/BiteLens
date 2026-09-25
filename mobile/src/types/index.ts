/**
 * BiteLens Mobile Type Definitions
 * Exact schemas aligned with FSSAI regulations, NOVA classification, and Go backend models
 */

export type NOVAGroup = 1 | 2 | 3 | 4;

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Additive {
  insCode: string;
  name: string;
  category: string;
  origin: string;
  riskLevel: RiskLevel;
  description: string;
  plainEnglish: string;
}

export interface NutrientInfo {
  calories: number; // kcal
  protein: number; // g
  carbohydrates: number; // g
  sugars: number; // g (total)
  addedSugar: number; // g
  fat: number; // g
  saturatedFat: number; // g
  sodium: number; // mg
  servingSize: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  novaGroup: NOVAGroup;
  healthScore: number; // 0 - 100
  ingredientsRaw: string;
  nutrients: NutrientInfo;
  detectedAdditives: Additive[];
  allergens: string[];
  goalFit: {
    weightLossScore: number;
    muscleGainScore: number;
    maintenanceScore: number;
    summary: string;
  };
  fssaiLicense?: string;
}

export interface ScanRecord {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  barcode: string;
  novaGroup: NOVAGroup;
  healthScore: number;
  goalFitScore: number;
  scannedAt: string;
  syncedWithCloud: boolean;
}

export type WeightGoal = 'maintain' | 'mild_deficit' | 'deficit' | 'mild_surplus' | 'surplus';
export type MuscleGoal = 'maintain' | 'gain';

export interface UserPreferences {
  isGuest: boolean;
  fullName: string;
  email: string;
  age: number;
  weightKg: number;
  heightCm: number;
  weightGoal: WeightGoal;
  muscleGoal: MuscleGoal;
  allergens: string[]; // e.g. ['gluten', 'lactose', 'soy', 'carmine']
  useAsianBMICutoff: boolean;
  parentalConsentGiven: boolean;
}

export interface BMICategoryInfo {
  category: string;
  color: string;
  text: string;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    proteinGrams: number;
    fatGrams: number;
    carbGrams: number;
  };
}
