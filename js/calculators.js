/* ==========================================================================
   BiteLens Web Application - Functional Health & Nutritional Profile Engine
   Features:
   1. BMI Calculator: Indian Consensus Cutoffs (Misra et al. 2009) vs. Standard WHO (2004)
   2. Calorie & TDEE Calculator: Mifflin-St Jeor Equation with Macronutrient Splits
   3. Pediatric Safety Gating: Clinically gates adult BMI and deficit goals for age < 18
   4. Localized Onboarding: Stores profile in localStorage to drive all "For You" scores
   ========================================================================== */

import { LRUCache } from './data-structures.js';

const calcCache = new LRUCache(100);

export const PROFILE_STORAGE_KEY = 'bitelens_user_profile';

/**
 * Calculates BMI from weight (kg) and height (m) with LRU memoization
 */
export function calculateBMI(weightKg, heightM) {
  if (!weightKg || !heightM || weightKg <= 0 || heightM <= 0) {
    throw new Error("Please enter positive numeric values for height and weight.");
  }
  const key = `bmi_${weightKg}_${heightM}`;
  if (calcCache.has(key)) return calcCache.get(key);

  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;
  calcCache.put(key, rounded);
  return rounded;
}

/**
 * Gets BMI Category based on cutoff mode and age.
 * Cites Indian Consensus Guidelines (Misra et al. 2009 / Ministry of Health India) vs WHO.
 */
export function getBMICategory(bmi, isAsianCutoff = false, ageYears = 25) {
  if (ageYears < 18) {
    return {
      category: "Pediatric (BMI-for-Age Required)",
      color: "#0284C7",
      text: "Adult BMI categories are not clinically valid for individuals under 18 years. The Indian Academy of Pediatrics (IAP) and WHO recommend BMI-for-age percentiles.",
      isMinor: true
    };
  }

  if (isAsianCutoff) {
    // Indian Consensus Guidelines (Misra et al. 2009)
    if (bmi < 18.0) return { category: "Underweight", color: "#4A7B9D", text: "BMI is below the healthy threshold (< 18.0 kg/m²) under Indian consensus guidelines." };
    if (bmi <= 22.9) return { category: "Normal", color: "#2D6A4F", text: "BMI falls within the healthy weight range (18.0–22.9 kg/m²) under Indian consensus guidelines." };
    if (bmi <= 24.9) return { category: "Overweight (at risk)", color: "#D97706", text: "BMI indicates overweight / increased cardiometabolic risk (23.0–24.9 kg/m²)." };
    if (bmi <= 29.9) return { category: "Obese I", color: "#E11D48", text: "BMI falls into Obese Class I (25.0–29.9 kg/m²) under Indian consensus criteria." };
    return { category: "Obese II", color: "#991B1B", text: "BMI falls into Obese Class II (≥ 30.0 kg/m²) under Indian consensus criteria." };
  } else {
    // Standard International WHO Criteria
    if (bmi < 18.5) return { category: "Underweight", color: "#4A7B9D", text: "BMI is below the standard WHO healthy weight range (< 18.5 kg/m²)." };
    if (bmi <= 24.9) return { category: "Normal", color: "#2D6A4F", text: "BMI falls within the standard WHO healthy weight range (18.5–24.9 kg/m²)." };
    if (bmi <= 29.9) return { category: "Overweight", color: "#D97706", text: "BMI is above the standard WHO healthy weight range (25.0–29.9 kg/m²)." };
    return { category: "Obese", color: "#E11D48", text: "BMI falls into the WHO Obese classification (≥ 30.0 kg/m²)." };
  }
}

/**
 * Calculates BMR using Mifflin-St Jeor Equation with LRU memoization
 */
export function calculateBMR(sex, ageYears, weightKg, heightCm) {
  if (!ageYears || !weightKg || !heightCm || ageYears <= 0 || weightKg <= 0 || heightCm <= 0) {
    throw new Error("Please enter valid positive values for age, weight, and height.");
  }

  const key = `bmr_${sex}_${ageYears}_${weightKg}_${heightCm}`;
  if (calcCache.has(key)) return calcCache.get(key);
  
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  if (sex === 'male') {
    bmr += 5;
  } else if (sex === 'female') {
    bmr -= 161;
  } else {
    throw new Error("Please select sex.");
  }

  const rounded = Math.round(bmr * 100) / 100;
  calcCache.put(key, rounded);
  return rounded;
}

/**
 * Calculates TDEE from BMR and activity multiplier
 */
export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };

  const mult = multipliers[activityLevel];
  if (!mult) throw new Error("Invalid activity level selected.");
  
  return Math.round(bmr * mult * 100) / 100;
}

/**
 * Adjusts TDEE based on weight goal with pediatric safety gating
 */
export function calculateGoalCalories(tdee, goal, ageYears = 25) {
  // Pediatric Safety Gating: disallow weight-loss deficits for adolescents under 18
  if (ageYears < 18 && (goal === 'deficit' || goal === 'mild_deficit')) {
    return tdee; // Gated to maintenance for developmental safety
  }

  const adjustments = {
    maintain: 0,
    mild_deficit: -250,
    deficit: -500,
    mild_surplus: 250,
    surplus: 500
  };

  if (adjustments[goal] === undefined) return tdee;
  return Math.round((tdee + adjustments[goal]) * 100) / 100;
}

/**
 * Retrieves the on-device user profile from localStorage.
 */
export function getUserProfile() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves profile to on-device localStorage (zero server transmission).
 */
export function saveUserProfile(profile) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('bitelens_profile_updated', { detail: profile }));
  } catch (e) {
    console.error("Failed to save local profile:", e);
  }
}

// --- DOM Binding & Event Handling ---

export function initBMICalculator() {
  const form = document.getElementById('bmi-form');
  if (!form) return;

  const unitWeightBtns = document.querySelectorAll('#weight-unit-toggle .toggle-btn');
  const unitHeightBtns = document.querySelectorAll('#height-unit-toggle .toggle-btn');
  const asianToggle = document.getElementById('asian-cutoff-toggle');

  const weightInput = document.getElementById('bmi-weight');
  const heightCmInput = document.getElementById('bmi-height-cm');
  const heightFtInput = document.getElementById('bmi-height-ft');
  const heightInInput = document.getElementById('bmi-height-in');
  const ageInput = document.getElementById('bmi-age') || document.getElementById('cal-age');
  
  const heightCmGroup = document.getElementById('height-cm-group');
  const heightFtInGroup = document.getElementById('height-ftin-group');
  const weightLabelUnit = document.getElementById('weight-unit-label');

  const resultContainer = document.getElementById('bmi-result');
  const errorContainer = document.getElementById('bmi-error');
  const pediatricNotice = document.getElementById('pediatric-warning-notice');

  let currentWeightUnit = 'kg';
  let currentHeightUnit = 'cm';

  unitWeightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      unitWeightBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWeightUnit = btn.dataset.unit;
      if (weightLabelUnit) weightLabelUnit.textContent = currentWeightUnit.toUpperCase();
      calculateAndRender();
    });
  });

  unitHeightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      unitHeightBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHeightUnit = btn.dataset.unit;
      if (currentHeightUnit === 'cm') {
        if (heightCmGroup) heightCmGroup.style.display = 'block';
        if (heightFtInGroup) heightFtInGroup.style.display = 'none';
      } else {
        if (heightCmGroup) heightCmGroup.style.display = 'none';
        if (heightFtInGroup) heightFtInGroup.style.display = 'flex';
      }
      calculateAndRender();
    });
  });

  if (asianToggle) asianToggle.addEventListener('change', calculateAndRender);

  [weightInput, heightCmInput, heightFtInput, heightInInput, ageInput].forEach(input => {
    if (input) input.addEventListener('input', calculateAndRender);
  });

  function calculateAndRender() {
    if (errorContainer) errorContainer.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';
    if (pediatricNotice) pediatricNotice.style.display = 'none';

    try {
      const rawWeight = parseFloat(weightInput?.value);
      if (isNaN(rawWeight) || rawWeight <= 0) return;

      let weightKg = rawWeight;
      if (currentWeightUnit === 'lb') weightKg = rawWeight * 0.453592;

      let heightM = 0;
      if (currentHeightUnit === 'cm') {
        const cm = parseFloat(heightCmInput?.value);
        if (isNaN(cm) || cm <= 0) return;
        heightM = cm / 100;
      } else {
        const ft = parseFloat(heightFtInput?.value) || 0;
        const inches = parseFloat(heightInInput?.value) || 0;
        if (ft <= 0 && inches <= 0) return;
        heightM = ((ft * 12) + inches) * 0.0254;
      }

      const age = parseInt(ageInput?.value, 10) || 25;
      const isAsian = asianToggle ? asianToggle.checked : true; // Default to Asian in India

      if (age < 18 && pediatricNotice) {
        pediatricNotice.style.display = 'block';
      }

      const bmi = calculateBMI(weightKg, heightM);
      const catInfo = getBMICategory(bmi, isAsian, age);

      const bmiVal = document.getElementById('bmi-value');
      const badge = document.getElementById('bmi-category-badge');
      const exp = document.getElementById('bmi-explanation');

      if (age < 18) {
        if (bmiVal) bmiVal.textContent = "N/A";
        if (badge) {
          badge.textContent = "Pediatric (BMI-for-Age Required)";
          badge.style.backgroundColor = "#0284C7";
        }
        if (exp) {
          exp.textContent = "Adult BMI categories and numerical thresholds are clinically invalid for individuals under 18 years. The Indian Academy of Pediatrics (IAP) and WHO recommend assessing growth via sex-specific pediatric BMI-for-age percentile charts.";
        }
      } else {
        if (bmiVal) bmiVal.textContent = bmi.toFixed(1);
        if (badge) {
          badge.textContent = catInfo.category;
          badge.style.backgroundColor = catInfo.color;
        }
        if (exp) exp.textContent = catInfo.text;
      }

      if (resultContainer) resultContainer.style.display = 'block';

      // Update local profile
      const existing = getUserProfile() || {};
      saveUserProfile({
        ...existing,
        weightKg: Math.round(weightKg * 10) / 10,
        heightCm: Math.round(heightM * 100),
        bmi,
        bmiCategory: catInfo.category,
        age
      });
    } catch (err) {
      if (errorContainer) {
        errorContainer.textContent = err.message;
        errorContainer.style.display = 'block';
      }
    }
  }
}

export function initCalorieCalculator() {
  const form = document.getElementById('calorie-form');
  if (!form) return;

  const ageInput = document.getElementById('cal-age');
  const weightInput = document.getElementById('cal-weight');
  const heightCmInput = document.getElementById('cal-height-cm') || document.getElementById('cal-height');
  const heightFtInput = document.getElementById('cal-height-ft');
  const heightInInput = document.getElementById('cal-height-in');
  const sexSelect = document.getElementById('cal-sex');
  const activitySelect = document.getElementById('cal-activity');
  const goalSelect = document.getElementById('cal-goal');
  const pediatricGatingBanner = document.getElementById('cal-pediatric-banner');

  const unitWeightBtns = document.querySelectorAll('#cal-weight-unit .toggle-btn');
  const unitHeightBtns = document.querySelectorAll('#cal-height-unit .toggle-btn');
  const heightCmGroup = document.getElementById('cal-height-cm-group');
  const heightFtInGroup = document.getElementById('cal-height-ftin-group');
  const weightLabelUnit = document.getElementById('cal-weight-unit-label');

  const resultContainer = document.getElementById('calorie-result');
  const errorContainer = document.getElementById('calorie-error');

  let currentWeightUnit = 'kg';
  let currentHeightUnit = 'cm';

  if (unitWeightBtns.length > 0) {
    unitWeightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        unitWeightBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentWeightUnit = btn.dataset.unit;
        if (weightLabelUnit) weightLabelUnit.textContent = currentWeightUnit.toUpperCase();
        calculateAndRender();
      });
    });
  }

  if (unitHeightBtns.length > 0) {
    unitHeightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        unitHeightBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHeightUnit = btn.dataset.unit;
        if (currentHeightUnit === 'cm') {
          if (heightCmGroup) heightCmGroup.style.display = 'block';
          if (heightFtInGroup) heightFtInGroup.style.display = 'none';
        } else {
          if (heightCmGroup) heightCmGroup.style.display = 'none';
          if (heightFtInGroup) heightFtInGroup.style.display = 'flex';
        }
        calculateAndRender();
      });
    });
  }

  function calculateAndRender() {
    if (errorContainer) errorContainer.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'none';
    if (pediatricGatingBanner) pediatricGatingBanner.style.display = 'none';

    try {
      const sex = sexSelect?.value || document.querySelector('input[name="cal-sex"]:checked')?.value || 'male';
      const age = parseInt(ageInput?.value, 10);
      const rawWeight = parseFloat(weightInput?.value);

      if (!sex || isNaN(age) || isNaN(rawWeight) || age <= 0 || rawWeight <= 0) {
        return;
      }

      let weightKg = rawWeight;
      if (currentWeightUnit === 'lb') weightKg = rawWeight * 0.453592;

      let heightCm = 0;
      if (currentHeightUnit === 'cm') {
        heightCm = parseFloat(heightCmInput?.value);
      } else {
        const ft = parseFloat(heightFtInput?.value) || 0;
        const inches = parseFloat(heightInInput?.value) || 0;
        if (ft <= 0 && inches <= 0) return;
        heightCm = ((ft * 12) + inches) * 2.54;
      }

      if (isNaN(heightCm) || heightCm <= 0) return;

      const activity = activitySelect?.value || 'sedentary';
      let goal = goalSelect?.value || 'maintain';

      // Pediatric Gating: Under 18 years
      if (age < 18) {
        if (pediatricGatingBanner) {
          pediatricGatingBanner.style.display = 'block';
        }
        if (goal === 'deficit' || goal === 'mild_deficit') {
          goal = 'maintain'; // Gate weight loss
          if (goalSelect) goalSelect.value = 'maintain';
        }
      }

      const bmr = calculateBMR(sex, age, weightKg, heightCm);
      const tdee = calculateTDEE(bmr, activity);
      const targetCalories = calculateGoalCalories(tdee, goal, age);

      const proteinG = Math.round((targetCalories * 0.25) / 4);
      const fatG = Math.round((targetCalories * 0.25) / 9);
      const carbG = Math.round((targetCalories * 0.50) / 4);

      const bmrEl = document.getElementById('bmr-val');
      const tdeeEl = document.getElementById('tdee-val');
      const goalValEl = document.getElementById('goal-val') || document.getElementById('target-cal-val');
      const goalGroupEl = document.getElementById('goal-result-group');

      if (age < 18) {
        if (bmrEl) bmrEl.textContent = "N/A (Pediatric)";
        if (tdeeEl) tdeeEl.textContent = "N/A (Growth Phase)";
        if (goalValEl) goalValEl.textContent = "Consult Pediatrician";
        if (macroProt) macroProt.textContent = "—";
        if (macroFat) macroFat.textContent = "—";
        if (macroCarb) macroCarb.textContent = "—";
      } else {
        if (bmrEl) bmrEl.textContent = Math.round(bmr);
        if (tdeeEl) tdeeEl.textContent = Math.round(tdee);
        if (goalValEl) goalValEl.textContent = `${Math.round(targetCalories)} kcal`;
        if (macroProt) macroProt.textContent = `${proteinG}g`;
        if (macroFat) macroFat.textContent = `${fatG}g`;
        if (macroCarb) macroCarb.textContent = `${carbG}g`;
      }
      if (goalGroupEl) goalGroupEl.style.display = 'block';

      if (resultContainer) resultContainer.style.display = 'block';

      // Save complete on-device profile for personal scan goal scoring
      saveUserProfile({
        age,
        sex,
        weightKg: Math.round(weightKg * 10) / 10,
        heightCm: Math.round(heightCm),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        weightGoal: goal,
        activityLevel: activity,
        isMinor: age < 18
      });
    } catch (err) {
      if (errorContainer) {
        errorContainer.textContent = err.message;
        errorContainer.style.display = 'block';
      }
    }
  }

  const inputs = [ageInput, weightInput, heightCmInput, heightFtInput, heightInInput, sexSelect, activitySelect, goalSelect];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateAndRender);
      input.addEventListener('change', calculateAndRender);
    }
  });

  const sexRadios = document.querySelectorAll('input[name="cal-sex"]');
  sexRadios.forEach(radio => radio.addEventListener('change', calculateAndRender));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initBMICalculator();
    initCalorieCalculator();
  });
}
