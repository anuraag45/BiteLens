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
