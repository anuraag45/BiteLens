import { calculateBMR, calculateTDEE, calculateBMI, getBMICategory } from '../js/calculators.js';

console.log("=== RUNNING MATHEMATICAL VERIFICATION FOR SECTION 8 WORKED EXAMPLE ===");

// Inputs: 70kg, 175cm, 30 years old, male, moderately active
const weightKg = 70;
const heightCm = 175;
const ageYears = 30;
const sex = 'male';
const activity = 'moderately_active';

const bmr = calculateBMR(sex, ageYears, weightKg, heightCm);
console.log(`BMR calculated: ${bmr} kcal`);
console.log(`Expected BMR: 1648.75 kcal`);

const tdee = calculateTDEE(bmr, activity);
console.log(`TDEE calculated: ${tdee} kcal`);
console.log(`Expected TDEE: 2555.56 kcal (rounded to 2556)`);

const heightM = heightCm / 100;
const bmi = calculateBMI(weightKg, heightM);
console.log(`BMI calculated: ${bmi}`);
console.log(`Expected BMI: 22.9`);

const stdCategory = getBMICategory(bmi, false);
const asianCategory = getBMICategory(bmi, true);
console.log(`Standard Category: ${stdCategory.category}`);
console.log(`Asian Category: ${asianCategory.category}`);

let success = true;
if (Math.abs(bmr - 1648.75) > 0.01) {
  console.error("BMR mismatch!");
  success = false;
}
if (Math.abs(tdee - 2555.5625) > 0.1) {
  console.error("TDEE mismatch!");
  success = false;
}
if (bmi !== 22.9) {
  console.error("BMI mismatch!");
  success = false;
}

if (success) {
  console.log("SUCCESS: All Section 8 worked examples matched perfectly!");
} else {
  console.error("FAILURE: Mismatch detected!");
  process.exit(1);
}

console.log("\n=== TESTING INDIAN CONSENSUS BMI CUTOFFS (Misra et al. 2009) ===");
// Underweight < 18.0
const underAsian = getBMICategory(17.5, true, 25);
if (underAsian.category !== "Underweight") {
  console.error(`Asian Underweight mismatch: expected Underweight, got ${underAsian.category}`);
  process.exit(1);
}

// Normal 18.0 - 22.9
const normAsian = getBMICategory(21.5, true, 25);
if (normAsian.category !== "Normal") {
  console.error(`Asian Normal mismatch: expected Normal, got ${normAsian.category}`);
  process.exit(1);
}

// Overweight (at risk) 23.0 - 24.9
const overAsian = getBMICategory(24.2, true, 25);
if (!overAsian.category.includes("Overweight")) {
  console.error(`Asian Overweight mismatch: expected Overweight, got ${overAsian.category}`);
  process.exit(1);
}

// Obese I 25.0 - 29.9
const obese1Asian = getBMICategory(26.5, true, 25);
if (obese1Asian.category !== "Obese I") {
  console.error(`Asian Obese I mismatch: expected Obese I, got ${obese1Asian.category}`);
  process.exit(1);
}
console.log("✅ PASSED: All Indian consensus BMI cutoffs verified (18.0 / 23.0 / 25.0).");

console.log("\n=== TESTING PEDIATRIC SAFETY GATING (< 18 YEARS) ===");
const pediatricBMI = getBMICategory(21.0, true, 15);
if (!pediatricBMI.isMinor) {
  console.error("Pediatric BMI gating failed: age 15 should flag isMinor: true");
  process.exit(1);
}

import { calculateGoalCalories } from '../js/calculators.js';
// Adolescent trying to select caloric deficit
const gatedCalories = calculateGoalCalories(2200, 'deficit', 15);
if (gatedCalories !== 2200) {
  console.error(`Pediatric deficit gating failed: expected 2200 kcal maintenance, got ${gatedCalories}`);
  process.exit(1);
}
console.log("✅ PASSED: Minor pediatric gating active (deficit disabled for age < 18).");

console.log("\n=== TESTING BITELENS HEADLINE SCORE ENGINE ===");
import { calculateBiteLensScore } from '../js/analyze.js';

// Kurkure scenario: NOVA 4 (-40), Additives (-16), Sodium (-12), Fat (-6) => exact 26
const kurkureScore = calculateBiteLensScore({
  novaGroup: 4,
  additives: [
    { code: "INS 330", penaltyWeight: 0 },
    { code: "INS 627", penaltyWeight: 8 },
    { code: "INS 631", penaltyWeight: 8 }
  ],
  macros: { sodium: 860, sugar: 2.1, fat: 34.6, calories: 558 }
});
if (kurkureScore.score !== 26) {
  console.error(`BiteLens Kurkure score mismatch: expected 26, got ${kurkureScore.score}`);
  process.exit(1);
}

// Clean Makhana scenario: NOVA 2 (-5), 0 additives, clean sodium => 95
const makhanaScore = calculateBiteLensScore({
  novaGroup: 2,
  additives: [],
  macros: { sodium: 180, sugar: 0.5, fat: 6.2, calories: 360 }
});
if (makhanaScore.score < 90) {
  console.error(`BiteLens Makhana score mismatch: expected >= 90, got ${makhanaScore.score}`);
  process.exit(1);
}
console.log(`✅ PASSED: BiteLens Score transparent engine verified (Kurkure: ${kurkureScore.score}, Makhana: ${makhanaScore.score}).`);

