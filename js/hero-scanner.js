/* ==========================================================================
   BiteLens Web Application - Hero Scanner Showcase Frame
   Powered by unified products.js dataset and calculateBiteLensScore engine.
   ========================================================================== */

import productsData from './data/products.js';
import { calculateBiteLensScore } from './analyze.js';
import { ADDITIVE_DATABASE } from './additive-database.js';
import { getUserProfile } from './calculators.js';

export function initHeroScanner() {
  const container = document.getElementById('hero-scanner-container');
  if (!container) return;

  const sampleProducts = [
    { id: 'multigrain-oats-crisp', label: '🥣 Oats Crisp' },
    { id: 'berry-flavored-yogurt', label: '🍓 Yogurt Cup' },
    { id: 'roasted-masala-makhana', label: '🫘 Makhana' }
  ];

  container.innerHTML = `
    <div class="phone-mockup">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        
        <!-- Target Sample Switcher -->
        <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.45rem; text-align: center; letter-spacing: 0.05em;">
          Select Sample Food Item:
        </div>
        <div class="scanner-selector">
          ${sampleProducts.map((p, idx) => `
            <button type="button" class="food-sample-btn ${idx === 0 ? 'active' : ''}" data-hero-sample="${p.id}">${p.label}</button>
          `).join('')}
        </div>

        <!-- Live Scanner Display Card -->
        <div class="scanner-display-card" id="hero-scanner-card">
          <div class="cyber-scan-beam" id="hero-scan-beam"></div>

          <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-size: 2rem;" id="hero-img">🥣</div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 0.98rem; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="hero-name">Multigrain Oats Crisp</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);" id="hero-cat">Breakfast Cereal</div>
            </div>
          </div>

          <!-- Decoded INS Codes -->
          <div style="font-size: 0.72rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-secondary); text-transform: uppercase; margin-bottom: 0.4rem;">
            Decoded INS Codes & Additives:
          </div>
          <div id="hero-ins-list" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
            <!-- Injected dynamically -->
          </div>

          <!-- Unified Headline BiteLens Score -->
          <div class="score-badge-group">
            <div style="background: #FFFFFF; border: 1.5px solid var(--color-border); border-radius: 12px; padding: 0.75rem 1rem; width: 100%; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm);">
              <div>
                <div style="font-size: 0.65rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                  HEADLINE BITELENS SCORE
                </div>
                <div style="display: flex; align-items: baseline; gap: 0.25rem;">
                  <span id="hero-score-val" style="font-size: 2rem; font-weight: 800; font-family: var(--font-family-display); color: #3B7A57;">72</span>
                  <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-muted);">/ 100</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                <span id="hero-tier-badge" style="font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 99px; background: #E8F5E9; color: #2D6A4F;">
                  Moderate / Processed
                </span>
                <span id="hero-nova-badge" style="font-size: 0.68rem; color: var(--color-text-muted); font-weight: 700;">
                  NOVA Group 3
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Bind hero sample switcher
  const sampleBtns = container.querySelectorAll('[data-hero-sample]');
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      sampleBtns.forEach(b => b.classList.remove('active'));
      const targetBtn = e.target.closest('[data-hero-sample]');
      if (!targetBtn) return;
      targetBtn.classList.add('active');
      const prodId = targetBtn.dataset.heroSample;
      loadHeroSample(prodId);
    });
  });

  loadHeroSample('multigrain-oats-crisp');
}

function loadHeroSample(productId) {
  const prod = productsData.find(p => p.id === productId);
  if (!prod) return;

  const userProfile = getUserProfile() || {};
  const additives = prod.detectedAdditives.map(code => {
    const found = ADDITIVE_DATABASE.find(a => a.code === code);
    return found || { code, name: code, penaltyWeight: 6, plainText: 'Permitted food additive.' };
  });

  const scoreData = calculateBiteLensScore({
    novaGroup: prod.novaGroup,
    additives,
    macros: prod.macrosPer100g,
    userGoal: userProfile.weightGoal || 'maintenance'
  });

  const imgEl = document.getElementById('hero-img');
  const nameEl = document.getElementById('hero-name');
  const catEl = document.getElementById('hero-cat');
  const insListEl = document.getElementById('hero-ins-list');
  const scoreValEl = document.getElementById('hero-score-val');
  const tierBadgeEl = document.getElementById('hero-tier-badge');
  const novaBadgeEl = document.getElementById('hero-nova-badge');

  if (imgEl) imgEl.textContent = prod.icon;
  if (nameEl) nameEl.textContent = prod.name;
  if (catEl) catEl.textContent = `${prod.brand} • ${prod.category}`;

  if (insListEl) {
    if (additives.length > 0) {
      insListEl.innerHTML = additives.map(item => `
        <div style="background: rgba(241, 245, 249, 0.85); border: 1px solid var(--color-border); padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.78rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">${item.code}</span>
            <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600;">${item.category || item.name}</span>
          </div>
          <div style="color: var(--color-text-main); margin-top: 0.15rem; font-weight: 500; font-size: 0.75rem;">${item.plainText || item.name}</div>
        </div>
      `).join('');
    } else {
      insListEl.innerHTML = `
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 0.45rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #065F46;">
          ✓ Zero synthetic additives (Clean Whole Food Formulation)
        </div>
      `;
    }
  }

  if (scoreValEl) {
    scoreValEl.textContent = scoreData.score;
    scoreValEl.style.color = scoreData.tierColor;
  }

  if (tierBadgeEl) {
    tierBadgeEl.textContent = scoreData.tier;
    tierBadgeEl.style.color = scoreData.tierColor;
    tierBadgeEl.style.backgroundColor = scoreData.tierBg;
  }

  if (novaBadgeEl) {
    novaBadgeEl.textContent = `NOVA Group ${scoreData.novaGroup}`;
  }

  const beam = document.getElementById('hero-scan-beam');
  if (beam) {
    beam.style.animation = 'none';
    void beam.offsetWidth;
    beam.style.animation = 'scanSweep 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initHeroScanner);
}
