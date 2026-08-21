/* ==========================================================================
   BiteLens Web Application - Functional Calculators Logic
   Contains:
   1. BMI Calculator (Standard WHO vs. Asian-specific cutoffs)
   2. Calorie Calculator (Mifflin-St Jeor Equation & TDEE)
   Accelerated with LRUCache Memoization & Mobile Input Support
   ========================================================================== */

import { LRUCache } from './data-structures.js';

const calcCache = new LRUCache(100);

// --- Pure Calculation Functions (Exported for Testing & UI) ---

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
 * Gets BMI Category based on cutoff mode
 */
export function getBMICategory(bmi, isAsianCutoff = false) {
  if (isAsianCutoff) {
    if (bmi < 18.5) return { category: "Underweight", color: "#4A7B9D", text: "BMI is below the Asian-specific healthy threshold." };
    if (bmi <= 22.9) return { category: "Normal", color: "#528B6A", text: "BMI falls within the Asian-specific healthy weight range." };
    if (bmi <= 24.9) return { category: "Overweight (at risk)", color: "#D9822B", text: "BMI indicates increased risk for metabolic conditions under Asian criteria." };
    if (bmi <= 29.9) return { category: "Obese I", color: "#E88D72", text: "BMI falls into the Obese Class I category under Asian criteria." };
    return { category: "Obese II", color: "#C53030", text: "BMI falls into the Obese Class II category under Asian criteria." };
  } else {
    if (bmi < 18.5) return { category: "Underweight", color: "#4A7B9D", text: "BMI is below the standard WHO healthy weight range." };
    if (bmi <= 24.9) return { category: "Normal", color: "#528B6A", text: "BMI falls within the standard WHO healthy weight range." };
    if (bmi <= 29.9) return { category: "Overweight", color: "#D9822B", text: "BMI is above the standard WHO healthy weight range." };
    return { category: "Obese", color: "#E88D72", text: "BMI falls into the WHO Obese classification." };
  }
}

/**
 * Calculates BMR using Mifflin-St Jeor Equation with LRU memoization
 * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) - 161
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
 * Adjusts TDEE based on weight goal
 */
export function calculateGoalCalories(tdee, goal) {
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
  
  const heightCmGroup = document.getElementById('height-cm-group');
  const heightFtInGroup = document.getElementById('height-ftin-group');
  const weightLabelUnit = document.getElementById('weight-unit-label');

  const resultContainer = document.getElementById('bmi-result');
  const errorContainer = document.getElementById('bmi-error');

  let currentWeightUnit = 'kg'; // 'kg' or 'lb'
  let currentHeightUnit = 'cm'; // 'cm' or 'ftin'

  // Unit Toggles
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
        heightCmGroup.style.display = 'block';
        heightFtInGroup.style.display = 'none';
      } else {
        heightCmGroup.style.display = 'none';
        heightFtInGroup.style.display = 'flex';
      }
      calculateAndRender();
    });
  });

  if (asianToggle) {
    asianToggle.addEventListener('change', calculateAndRender);
  }

  // Inputs change event
  [weightInput, heightCmInput, heightFtInput, heightInInput].forEach(input => {
    if (input) input.addEventListener('input', calculateAndRender);
  });

  function calculateAndRender() {
    errorContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    try {
      const rawWeight = parseFloat(weightInput.value);
      if (isNaN(rawWeight) || rawWeight <= 0) return;

      let weightKg = rawWeight;
      if (currentWeightUnit === 'lb') {
        weightKg = rawWeight * 0.453592;
      }

      let heightM = 0;
      if (currentHeightUnit === 'cm') {
        const cm = parseFloat(heightCmInput.value);
        if (isNaN(cm) || cm <= 0) return;
        heightM = cm / 100;
      } else {
        const ft = parseFloat(heightFtInput.value) || 0;
        const inches = parseFloat(heightInInput.value) || 0;
        if (ft <= 0 && inches <= 0) return;
        const totalInches = (ft * 12) + inches;
        heightM = totalInches * 0.0254;
      }

      const bmi = calculateBMI(weightKg, heightM);
      const isAsian = asianToggle ? asianToggle.checked : false;
      const catInfo = getBMICategory(bmi, isAsian);

      document.getElementById('bmi-value').textContent = bmi.toFixed(1);
      const badge = document.getElementById('bmi-category-badge');
      badge.textContent = catInfo.category;
      badge.style.backgroundColor = catInfo.color;
      document.getElementById('bmi-explanation').textContent = catInfo.text;

      resultContainer.style.display = 'block';
    } catch (err) {
      errorContainer.textContent = err.message;
      errorContainer.style.display = 'block';
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

    try {
      const sex = sexSelect?.value || document.querySelector('input[name="cal-sex"]:checked')?.value || 'male';
      const age = parseInt(ageInput?.value, 10);
      const rawWeight = parseFloat(weightInput?.value);

      if (!sex || isNaN(age) || isNaN(rawWeight) || age <= 0 || rawWeight <= 0) {
        return;
      }

      let weightKg = rawWeight;
      if (currentWeightUnit === 'lb') {
        weightKg = rawWeight * 0.453592;
      }

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
      const goal = goalSelect?.value || 'maintain';

      const bmr = calculateBMR(sex, age, weightKg, heightCm);
      const tdee = calculateTDEE(bmr, activity);
      const targetCalories = calculateGoalCalories(tdee, goal);

      // Macro breakdown
      const proteinG = Math.round((targetCalories * 0.25) / 4);
      const fatG = Math.round((targetCalories * 0.25) / 9);
      const carbG = Math.round((targetCalories * 0.50) / 4);

      const bmrEl = document.getElementById('bmr-val');
      const tdeeEl = document.getElementById('tdee-val');
      const goalValEl = document.getElementById('goal-val') || document.getElementById('target-cal-val');
      const goalGroupEl = document.getElementById('goal-result-group');

      if (bmrEl) bmrEl.textContent = Math.round(bmr);
      if (tdeeEl) tdeeEl.textContent = Math.round(tdee);
      if (goalValEl) goalValEl.textContent = `${Math.round(targetCalories)} kcal`;
      if (goalGroupEl) goalGroupEl.style.display = 'block';

      const macroProt = document.getElementById('macro-protein');
      const macroFat = document.getElementById('macro-fat');
      const macroCarb = document.getElementById('macro-carb');
      if (macroProt) macroProt.textContent = `${proteinG}g`;
      if (macroFat) macroFat.textContent = `${fatG}g`;
      if (macroCarb) macroCarb.textContent = `${carbG}g`;

      resultContainer.style.display = 'block';
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
  sexRadios.forEach(radio => {
    radio.addEventListener('change', calculateAndRender);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initBMICalculator();
    initCalorieCalculator();
  });
}
