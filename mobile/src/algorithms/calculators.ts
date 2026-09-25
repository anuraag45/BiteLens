/**
 * BiteLens Mobile - Health Heuristics & Metabolic Mathematics Engine
 * Strictly verified calculations:
 * - Body Mass Index (WHO vs. Asian-specific lower thresholds)
 * - Mifflin-St Jeor Basal Metabolic Rate (BMR)
 * - Total Daily Energy Expenditure (TDEE) with activity multipliers
 * - Target Goal Caloric intake & macronutrient breakdown
 */

import { LRUCache } from './data-structures';
import { BMICategoryInfo, CalorieResult, WeightGoal } from '../types';

const mathCache = new LRUCache<string, any>(100);

export function calculateBMI(weightKg: number, heightM: number): number {
  if (weightKg <= 0 || heightM <= 0) {
    throw new Error('Weight and height must be positive numbers.');
  }
  const key = `bmi_${weightKg}_${heightM}`;
  const cached = mathCache.get(key);
  if (cached !== null) return cached;

  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;
  mathCache.put(key, rounded);
  return rounded;
}

export function getBMICategory(bmi: number, isAsianCutoff: boolean = false): BMICategoryInfo {
  if (isAsianCutoff) {
    if (bmi < 18.5) {
      return { category: 'Underweight', color: '#4A7B9D', text: 'BMI is below the Asian-specific healthy threshold.' };
    }
    if (bmi <= 22.9) {
      return { category: 'Normal', color: '#166534', text: 'BMI falls within the Asian-specific healthy weight range.' };
    }
    if (bmi <= 24.9) {
      return { category: 'Overweight (at risk)', color: '#D97706', text: 'BMI indicates increased risk for metabolic conditions under Asian criteria.' };
    }
    if (bmi <= 29.9) {
      return { category: 'Obese I', color: '#E11D48', text: 'BMI falls into the Obese Class I category under Asian criteria.' };
    }
    return { category: 'Obese II', color: '#991B1B', text: 'BMI falls into the Obese Class II category under Asian criteria.' };
  } else {
    if (bmi < 18.5) {
      return { category: 'Underweight', color: '#4A7B9D', text: 'BMI is below standard WHO healthy weight range.' };
    }
    if (bmi <= 24.9) {
      return { category: 'Normal', color: '#166534', text: 'BMI falls within standard WHO healthy weight range.' };
    }
    if (bmi <= 29.9) {
      return { category: 'Overweight', color: '#D97706', text: 'BMI is above standard WHO healthy weight range.' };
    }
    return { category: 'Obese', color: '#E11D48', text: 'BMI falls into the standard WHO Obese classification.' };
  }
}

export function calculateBMR(
  sex: 'male' | 'female',
  ageYears: number,
  weightKg: number,
  heightCm: number
): number {
  if (ageYears <= 0 || weightKg <= 0 || heightCm <= 0) {
    throw new Error('Age, weight, and height must be positive values.');
  }

  const key = `bmr_${sex}_${ageYears}_${weightKg}_${heightCm}`;
  const cached = mathCache.get(key);
  if (cached !== null) return cached;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const rounded = Math.round(bmr * 100) / 100;
  mathCache.put(key, rounded);
  return rounded;
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const mult = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * mult * 100) / 100;
}

export function calculateGoalCalories(tdee: number, goal: WeightGoal): number {
  const adjustments: Record<WeightGoal, number> = {
    maintain: 0,
    mild_deficit: -250,
    deficit: -500,
    mild_surplus: 250,
    surplus: 500,
  };

  const adj = adjustments[goal] ?? 0;
  return Math.round((tdee + adj) * 100) / 100;
}

export function computeFullMetabolicProfile(
  sex: 'male' | 'female',
  ageYears: number,
  weightKg: number,
  heightCm: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active',
  goal: WeightGoal
): CalorieResult {
  const bmr = calculateBMR(sex, ageYears, weightKg, heightCm);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateGoalCalories(tdee, goal);

  // Balanced macro split: 25% Protein, 25% Fat, 50% Carbs
  const proteinG = Math.round((targetCalories * 0.25) / 4);
  const fatG = Math.round((targetCalories * 0.25) / 9);
  const carbG = Math.round((targetCalories * 0.50) / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros: {
      proteinGrams: proteinG,
      fatGrams: fatG,
      carbGrams: carbG,
    },
  };
}
