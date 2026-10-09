/* ==========================================================================
   BiteLens Web Application - Side-by-Side Food Comparison Logic
   Powered by unified swaps.js and products.js datasets.
   ========================================================================== */

import { defaultSwapsEngine } from './swaps.js';
import productsData from './data/products.js';

export function initComparison() {
  const container = document.getElementById('compare-presets-bar');
  const presets = defaultSwapsEngine.getPresetComparisons();

  if (container && presets.length > 0) {
    container.innerHTML = presets.map((preset, idx) => `
      <button type="button" class="btn btn-outline ${idx === 0 ? 'active' : ''}" style="height: 36px; font-size: 0.85rem;" data-compare-id="${preset.id}">
        ${preset.prodA.icon} ${preset.prodA.name.split(' ')[0]} vs ${preset.prodB.icon} ${preset.prodB.name.split(' ')[0]}
      </button>
    `).join('');

    const presetBtns = container.querySelectorAll('[data-compare-id]');
    presetBtns.forEach((btn, idx) => {
      btn.onclick = () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderComparison(presets[idx]);
      };
    });

    // Render initial
    renderComparison(presets[0]);
  }
}

function renderComparison(matchup) {
  const { prodA, prodB } = matchup;
  if (!prodA || !prodB) return;

  const comparison = defaultSwapsEngine.buildSwapComparison(prodB, prodA);

  // Render Product A (Healthy Option)
  renderProductCard('prod-a', prodA, `✓ <strong>BiteLens Verdict:</strong> ${comparison.headlineVerdict}`);

  // Render Product B (Ultra-Processed Option)
  const penaltyNotice = `⚠ <strong>BiteLens Flag:</strong> Ultra-processed formulation with ${prodB.detectedAdditives?.length || 0} synthetic additives. Exceeds daily thresholds.`;
  renderProductCard('prod-b', prodB, penaltyNotice);

  // Render Delta Callout Banner
  const deltaBanner = document.getElementById('comparison-delta-banner');
  if (deltaBanner) {
    deltaBanner.innerHTML = `
      <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: var(--radius-md); padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="color: #065F46; font-size: 1rem;">Nutritional Upgrade by Choosing ${prodA.name}:</strong>
          <div style="font-size: 0.82rem; color: #047857; margin-top: 0.25rem;">
            ${comparison.advantages.join(' • ')}
          </div>
        </div>
        <span style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-family-display); background: var(--color-primary); color: #FFFFFF; padding: 0.35rem 0.85rem; border-radius: 99px;">
          +${comparison.scoreImprovement} Points
        </span>
      </div>
    `;
  }
}

function renderProductCard(prefix, prod, verdictHTML) {
  const nameEl = document.getElementById(`name-${prefix}`);
  const catEl = document.getElementById(`cat-${prefix}`);
  const iconEl = document.getElementById(`icon-${prefix}`);
  const healthEl = document.getElementById(`health-${prefix}`);
  const novaEl = document.getElementById(`nova-${prefix}`);
  const goalEl = document.getElementById(`goal-${prefix}`);
  const procEl = document.getElementById(`proc-${prefix}`);
  const additivesEl = document.getElementById(`additives-${prefix}`);
  const fatEl = document.getElementById(`fat-${prefix}`);
  const sugarEl = document.getElementById(`sugar-${prefix}`);
  const verdictEl = document.getElementById(`verdict-${prefix}`);

  if (nameEl) nameEl.textContent = prod.name;
  if (catEl) catEl.textContent = `${prod.brand} • ${prod.category}`;
  if (iconEl) iconEl.textContent = prod.icon;
  if (healthEl) healthEl.textContent = `${prod.biteLensScore || 70}/100`;
  if (novaEl) novaEl.textContent = `NOVA Group ${prod.novaGroup}`;
  if (goalEl) goalEl.textContent = `${Math.min(100, (prod.biteLensScore || 70) + 5)}/100`;
  if (procEl) procEl.textContent = prod.novaGroup <= 2 ? "Minimally Processed" : (prod.novaGroup === 3 ? "Processed" : "Ultra-Processed (UPF)");
  if (additivesEl) additivesEl.textContent = `${prod.detectedAdditives?.length || 0} Additives (${prod.detectedAdditives?.join(', ') || 'None'})`;
  if (fatEl) fatEl.textContent = `${prod.macrosPer100g?.fat || 0}g per 100g`;
  if (sugarEl) sugarEl.textContent = `${prod.macrosPer100g?.addedSugar || prod.macrosPer100g?.sugar || 0}g Added Sugar`;
  if (verdictEl) verdictEl.innerHTML = verdictHTML;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initComparison);
}
