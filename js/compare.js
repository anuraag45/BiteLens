/* ==========================================================================
   BiteLens Web Application - Side-by-Side Food Comparison Logic
   ========================================================================== */

const COMPARISON_PRESETS = {
  makhana_vs_chips: {
    prodA: {
      name: "Roasted Masala Makhana",
      cat: "Traditional Indian Snack",
      icon: "🫘",
      healthScore: 92,
      nova: "NOVA Group 2",
      goalScore: 90,
      processing: "Minimally Processed",
      additives: "0 Synthetic Additives",
      fat: "1.2g per 100g",
      sugar: "0g (Zero Added)",
      verdict: "✓ <strong>BiteLens Verdict:</strong> Exceptional clean snack choice. High fiber and low calorie density."
    },
    prodB: {
      name: "Classic Salted Potato Chips",
      cat: "Packaged Fried Snack",
      icon: "🍟",
      healthScore: 35,
      nova: "NOVA Group 4",
      goalScore: 42,
      processing: "Ultra-Processed (UPF)",
      additives: "3 Synthetic Additives (INS 627, 631)",
      fat: "15.4g per 100g (High)",
      sugar: "680mg Sodium (34% Daily Limit)",
      verdict: "⚠ <strong>BiteLens Warning:</strong> High oil absorption with chemical flavor potentiators. Exceeds healthy snack thresholds."
    }
  },
  oats_vs_cornflakes: {
    prodA: {
      name: "Multigrain Oats Crisp",
      cat: "Breakfast Cereal",
      icon: "🥣",
      healthScore: 72,
      nova: "NOVA Group 3",
      goalScore: 88,
      processing: "Processed Whole Grain",
      additives: "2 Additives (INS 322, 500ii)",
      fat: "3.5g per 100g",
      sugar: "4g Natural Sugars",
      verdict: "✓ <strong>BiteLens Verdict:</strong> Solid breakfast choice with sustained complex carbohydrate release."
    },
    prodB: {
      name: "Frosted Sugar Cornflakes",
      cat: "Breakfast Cereal",
      icon: "🌽",
      healthScore: 48,
      nova: "NOVA Group 4",
      goalScore: 50,
      processing: "Ultra-Processed (UPF)",
      additives: "4 Additives (INS 150d, 320)",
      fat: "0.8g per 100g",
      sugar: "32g Added Sugar (64% Daily Limit)",
      verdict: "⚠ <strong>BiteLens Warning:</strong> Severe spike in added sugars. Rapid glycemic index spike."
    }
  },
  yogurt_vs_plain: {
    prodA: {
      name: "Plain Greek Yogurt + Berries",
      cat: "Fresh Cultured Dairy",
      icon: "🥛",
      healthScore: 95,
      nova: "NOVA Group 1",
      goalScore: 96,
      processing: "Minimally Processed",
      additives: "0 Synthetic Additives",
      fat: "4.0g per 100g",
      sugar: "3g Natural Lactose",
      verdict: "✓ <strong>BiteLens Verdict:</strong> Superior probiotic density with 10g natural bioavailable protein."
    },
    prodB: {
      name: "Berry Flavored Packaged Yogurt",
      cat: "Dairy Dessert Product",
      icon: "🍓",
      healthScore: 54,
      nova: "NOVA Group 4",
      goalScore: 62,
      processing: "Ultra-Processed (UPF)",
      additives: "2 Additives (INS 120, 440)",
      fat: "2.8g per 100g",
      sugar: "18g Added High-Fructose Syrup",
      verdict: "⚠ <strong>BiteLens Warning:</strong> Disguised dessert item with artificial coloring and heavy syrup."
    }
  }
};

export function initComparison() {
  const presetBtns = document.querySelectorAll('[data-compare-preset]');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      presetBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const key = e.target.dataset.comparePreset;
      if (COMPARISON_PRESETS[key]) {
        renderComparison(COMPARISON_PRESETS[key]);
      }
    });
  });
}

function renderComparison(data) {
  const { prodA, prodB } = data;

  // Render Product A
  document.getElementById('name-prod-a').textContent = prodA.name;
  document.getElementById('cat-prod-a').textContent = prodA.cat;
  document.getElementById('icon-prod-a').textContent = prodA.icon;
  document.getElementById('health-prod-a').textContent = `${prodA.healthScore}/100`;
  document.getElementById('nova-prod-a').textContent = prodA.nova;
  document.getElementById('goal-prod-a').textContent = `${prodA.goalScore}/100`;
  document.getElementById('proc-prod-a').textContent = prodA.processing;
  document.getElementById('additives-prod-a').textContent = prodA.additives;
  document.getElementById('fat-prod-a').textContent = prodA.fat;
  document.getElementById('sugar-prod-a').textContent = prodA.sugar;
  document.getElementById('verdict-prod-a').innerHTML = prodA.verdict;

  // Render Product B
  document.getElementById('name-prod-b').textContent = prodB.name;
  document.getElementById('cat-prod-b').textContent = prodB.cat;
  document.getElementById('icon-prod-b').textContent = prodB.icon;
  document.getElementById('health-prod-b').textContent = `${prodB.healthScore}/100`;
  document.getElementById('nova-prod-b').textContent = prodB.nova;
  document.getElementById('goal-prod-b').textContent = `${prodB.goalScore}/100`;
  document.getElementById('proc-prod-b').textContent = prodB.processing;
  document.getElementById('additives-prod-b').textContent = prodB.additives;
  document.getElementById('fat-prod-b').textContent = prodB.fat;
  document.getElementById('sugar-prod-b').textContent = prodB.sugar;
  document.getElementById('verdict-prod-b').innerHTML = prodB.verdict;
}

document.addEventListener('DOMContentLoaded', initComparison);
