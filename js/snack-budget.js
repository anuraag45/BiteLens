/* ==========================================================================
   Pink Web Application - Packaged Snack Budget Simulator
   Calculates daily calorie %, sodium %, and added sugar % consumption
   ========================================================================== */

const SNACK_ITEMS = [
  { name: "Instant Noodles (1 Pack)", calories: 380, sodium: 890, sugar: 3 },
  { name: "Carbonated Soft Drink (300ml)", calories: 140, sodium: 35, sugar: 33 },
  { name: "Spiced Potato Chips (50g)", calories: 275, sodium: 420, sugar: 2 },
  { name: "Chocolate Cream Biscuits (4 pcs)", calories: 220, sodium: 140, sugar: 18 },
  { name: "Packaged Mango Drink (250ml)", calories: 150, sodium: 40, sugar: 28 },
  { name: "High Protein Chocolate Bar (60g)", calories: 240, sodium: 180, sugar: 2 }
];

export function initSnackBudget() {
  const container = document.getElementById('snack-budget-app');
  if (!container) return;

  renderBudgetHTML(container);
  bindBudgetEvents();
}

function renderBudgetHTML(container) {
  container.innerHTML = `
    <div class="calculator-card" style="max-width: 800px;">
      
      <div class="form-group">
        <label class="form-label" for="daily-cal-limit">Your Target Daily Calorie Limit</label>
        <input type="number" id="daily-cal-limit" class="form-input" value="2000" min="1000" max="5000">
      </div>

      <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-neon-emerald); text-transform: uppercase; margin-bottom: 0.75rem;">
        Select Packaged Items Consumed Today:
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;" id="snack-checkbox-grid">
        ${SNACK_ITEMS.map((item, idx) => `
          <label style="background: #FFFFFF; border: 1px solid var(--color-border); padding: 0.75rem; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
            <input type="checkbox" class="snack-check switch-input" data-index="${idx}">
            <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">${item.name}</span>
          </label>
        `).join('')}
      </div>

      <!-- Result Budget Fills -->
      <div id="snack-budget-result" class="result-box" style="display: block; background: rgba(241, 245, 249, 0.9); border-color: var(--color-border);">
        <h4 style="margin-bottom: 1rem;">Daily Nutritional Budget Impact:</h4>

        <!-- Calorie Bar -->
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.3rem;">
            <span>Calories Consumed</span>
            <span id="cal-pct-text">0 / 2,000 kcal (0%)</span>
          </div>
          <div style="background: #E2E8F0; height: 12px; border-radius: 6px; overflow: hidden;">
            <div id="cal-bar-fill" style="width: 0%; height: 100%; background: var(--color-neon-emerald); transition: width 0.4s ease;"></div>
          </div>
        </div>

        <!-- Sodium Bar -->
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.3rem;">
            <span>Sodium (FSSAI Limit: 2,000mg)</span>
            <span id="sod-pct-text">0 / 2,000 mg (0%)</span>
          </div>
          <div style="background: #E2E8F0; height: 12px; border-radius: 6px; overflow: hidden;">
            <div id="sod-bar-fill" style="width: 0%; height: 100%; background: var(--color-cyber-cyan); transition: width 0.4s ease;"></div>
          </div>
        </div>

        <!-- Sugar Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.3rem;">
            <span>Added Sugar (WHO Guideline: 25g)</span>
            <span id="sug-pct-text">0 / 25 g (0%)</span>
          </div>
          <div style="background: #E2E8F0; height: 12px; border-radius: 6px; overflow: hidden;">
            <div id="sug-bar-fill" style="width: 0%; height: 100%; background: var(--color-electric-pink); transition: width 0.4s ease;"></div>
          </div>
        </div>

      </div>

      <div class="disclaimer-box">
        <strong>FSSAI & WHO Guidelines:</strong> Maximum recommended daily intake for sodium is 2,000mg (approx. 5g salt). WHO guidelines strongly recommend keeping added free sugars below 25g (approx. 6 teaspoons) per day for optimal metabolic health.
      </div>

    </div>
  `;
}

function bindBudgetEvents() {
  const calInput = document.getElementById('daily-cal-limit');
  const checks = document.querySelectorAll('.snack-check');

  function calculateImpact() {
    const calLimit = parseFloat(calInput.value) || 2000;
    const sodLimit = 2000; // mg
    const sugLimit = 25;   // g

    let totCal = 0;
    let totSod = 0;
    let totSug = 0;

    checks.forEach(chk => {
      if (chk.checked) {
        const item = SNACK_ITEMS[chk.dataset.index];
        totCal += item.calories;
        totSod += item.sodium;
        totSug += item.sugar;
      }
    });

    const calPct = Math.min(Math.round((totCal / calLimit) * 100), 100);
    const sodPct = Math.min(Math.round((totSod / sodLimit) * 100), 100);
    const sugPct = Math.min(Math.round((totSug / sugLimit) * 100), 100);

    document.getElementById('cal-pct-text').textContent = `${totCal} / ${calLimit} kcal (${Math.round((totCal / calLimit) * 100)}%)`;
    document.getElementById('cal-bar-fill').style.width = `${calPct}%`;

    document.getElementById('sod-pct-text').textContent = `${totSod} / 2,000 mg (${Math.round((totSod / sodLimit) * 100)}%)`;
    const sodBar = document.getElementById('sod-bar-fill');
    sodBar.style.width = `${sodPct}%`;
    sodBar.style.background = (totSod > 2000) ? '#E11D48' : 'var(--color-cyber-cyan)';

    document.getElementById('sug-pct-text').textContent = `${totSug} / 25 g (${Math.round((totSug / sugLimit) * 100)}%)`;
    const sugBar = document.getElementById('sug-bar-fill');
    sugBar.style.width = `${sugPct}%`;
    sugBar.style.background = (totSug > 25) ? '#E11D48' : 'var(--color-electric-pink)';
  }

  if (calInput) calInput.addEventListener('input', calculateImpact);
  checks.forEach(c => c.addEventListener('change', calculateImpact));
}

document.addEventListener('DOMContentLoaded', initSnackBudget);
