/* ==========================================================================
   BiteLens Web Application - INS Additive Search & Decoder Database
   Features:
   - Security Hardening (XSS & SQL Injection Sanitization)
   - Auto-inputs URL search parameters
   - Futuristic HUD Telemetry Laboratory Layout
   ========================================================================== */

import { sanitizeInput, sanitizeSQL } from './security.js';

export const ADDITIVE_DATABASE = [
  {
    code: "INS 621",
    name: "Monosodium Glutamate (MSG)",
    category: "Flavor Enhancer",
    plainText: "Chemical flavor powder added to packaged noodles and chips to make them taste super savory.",
    fssaiStatus: "Permitted in specified foods with mandatory label declaration.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Instant noodles, packaged soups, savory seasonings, frozen snacks.",
    healthNote: "Safe within regulated limits; often indicates ultra-processed savory formulations."
  },
  {
    code: "INS 322",
    name: "Lecithin (Soy / Sunflower)",
    category: "Emulsifier",
    plainText: "Natural plant ingredient that keeps chocolate smooth so cocoa oil does not separate.",
    fssaiStatus: "Widely permitted as a standard food additive.",
    novaGroup: "NOVA Group 3/4 (Processed / Ultra-Processed)",
    commonFoods: "Chocolates, biscuits, margarine, protein bars, infant formulas.",
    healthNote: "Generally recognized as safe; naturally derived lipid compound."
  },
  {
    code: "INS 500(ii)",
    name: "Sodium Hydrogen Carbonate (Baking Soda)",
    category: "Acidity Regulator / Leavening Agent",
    plainText: "Simple mineral powder used in baking to help dough rise soft and fluffy.",
    fssaiStatus: "Permitted according to Good Manufacturing Practice (GMP).",
    novaGroup: "NOVA Group 2/3 (Culinary Ingredient / Processed)",
    commonFoods: "Bakery items, biscuits, instant cake mixes, carbonated beverages.",
    healthNote: "Clean, traditional leavening agent; contributes minor dietary sodium."
  },
  {
    code: "INS 211",
    name: "Sodium Benzoate",
    category: "Preservative",
    plainText: "Liquid preservative added to stop packaged fruit squashes and sodas from spoiling.",
    fssaiStatus: "Permitted under maximum numerical limits (ppm).",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Pickles, fruit squashes, carbonated soft drinks, packaged sauces.",
    healthNote: "Strictly limited by FSSAI; best avoided in high quantities."
  },
  {
    code: "INS 120",
    name: "Carmine / Cochineal Red",
    category: "Food Colorant",
    plainText: "Natural red color used to give candies, ice creams, and yogurts a bright pink or red look.",
    fssaiStatus: "Permitted in specified confectionery and beverages.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Fruit yogurts, red candies, flavored milks, ice creams.",
    healthNote: "Natural origin colorant; non-vegetarian ingredient requiring green/red dot labeling."
  },
  {
    code: "INS 440",
    name: "Pectin",
    category: "Thickener / Gelling Agent",
    plainText: "Natural plant-derived fruit gel extracted from apple and citrus peel.",
    fssaiStatus: "Permitted under Good Manufacturing Practice.",
    novaGroup: "NOVA Group 3 (Processed)",
    commonFoods: "Jams, fruit jellies, yogurt desserts, fruit fillings.",
    healthNote: "Soluble dietary fiber compound; high health safety profile."
  },
  {
    code: "INS 955",
    name: "Sucralose",
    category: "Artificial Sweetener",
    plainText: "Super-sweet artificial powder used in diet sodas to replace sugar without calories.",
    fssaiStatus: "Permitted in zero-sugar and energy-restricted products with warning label.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Diet sodas, sugar-free protein powders, guilt-free desserts.",
    healthNote: "Non-nutritive sweetener; helps manage sugar intake but signals artificial formulation."
  },
  {
    code: "INS 330",
    name: "Citric Acid",
    category: "Acidity Regulator",
    plainText: "Natural lemon acid added to drinks and candies to give a sharp tart taste.",
    fssaiStatus: "Permitted under Good Manufacturing Practice.",
    novaGroup: "NOVA Group 2/3 (Processed)",
    commonFoods: "Fruit juices, candies, jams, carbonated drinks, canned tomatoes.",
    healthNote: "Naturally present in citrus fruits; safe organic acid."
  },
  {
    code: "INS 412",
    name: "Guar Gum",
    category: "Thickener / Stabilizer",
    plainText: "Natural plant fiber from guar beans used to keep ice creams and sauces creamy.",
    fssaiStatus: "Permitted additive under GMP guidelines.",
    novaGroup: "NOVA Group 3 (Processed)",
    commonFoods: "Ice creams, sauces, instant soups, gluten-free bakery items.",
    healthNote: "Natural plant fiber; enhances texture and creaminess."
  },
  {
    code: "INS 150d",
    name: "Sulfite Ammonia Caramel Color",
    category: "Food Colorant",
    plainText: "Dark brown coloring synthesized through chemical treatment of carbohydrates.",
    fssaiStatus: "Permitted in cola drinks and dark sauces with maximum limits.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Cola drinks, soy sauce, dark beers, chocolate syrups.",
    healthNote: "Synthetic caramel variant; indicates heavy industrial processing."
  },
  {
    code: "INS 471",
    name: "Mono- and Diglycerides of Fatty Acids",
    category: "Emulsifier",
    plainText: "Industrial fat ingredient added to commercial breads and cakes to keep them soft.",
    fssaiStatus: "Permitted food additive under GMP.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Commercial packaged bread, cakes, peanut butter, ice creams.",
    healthNote: "Synthesized fat emulsifier used to maintain freshness in commercial baking."
  },
  {
    code: "INS 202",
    name: "Potassium Sorbate",
    category: "Preservative",
    plainText: "Inhibits mold and yeast growth to extend shelf life of baked goods and sauces.",
    fssaiStatus: "Permitted under maximum numerical concentration limits.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Packaged cheese, fruit spreads, baked goods, wine.",
    healthNote: "Widely tested food preservative with low toxicity profile."
  }
];

export function initAdditiveDecoder() {
  const container = document.getElementById('additive-decoder-app');
  if (!container) return;

  renderHUDStudioHTML(container);
  bindDecoderEvents();

  const urlParams = new URLSearchParams(window.location.search);
  const rawCode = urlParams.get('code');
  if (rawCode) {
    const cleanCode = sanitizeInput(sanitizeSQL(rawCode));
    const searchInput = document.getElementById('ins-search-input');
    if (searchInput) {
      searchInput.value = cleanCode;
      searchInput.dispatchEvent(new Event('input'));

      setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
}

function renderHUDStudioHTML(container) {
  container.innerHTML = `
    <div class="hud-telemetry-workbench">
      
      <div class="hud-status-bar">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="hud-pulse-dot"></span>
          <span style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.85rem; letter-spacing: 0.05em; color: var(--color-primary);">
            🔬 BITELENS ADDITIVE DECODER LAB // ONLINE
          </span>
        </div>
        <div style="font-size: 0.78rem; font-family: monospace; color: var(--color-text-muted);">
          SEC.STATUS: SANITIZED_XSS_PREVENTED
        </div>
      </div>

      <div class="hud-controls-grid">
        <div>
          <label class="form-label" for="ins-search-input" style="display: flex; justify-content: space-between;">
            <span>Search INS / E-Number Code or Ingredient</span>
            <span style="font-size: 0.78rem; color: var(--color-primary); font-weight: 600;">Sanitized Live Input</span>
          </label>
          <div style="position: relative;">
            <input type="text" id="ins-search-input" class="form-input hud-input" placeholder="Type e.g. INS 621, Lecithin, INS 330, Preservative...">
          </div>
        </div>

        <div>
          <label class="form-label" for="ins-category-filter">Filter by Purpose</label>
          <select id="ins-category-filter" class="form-select hud-select">
            <option value="all">All Functional Classes</option>
            <option value="Emulsifier">Emulsifiers (Smoothers)</option>
            <option value="Preservative">Preservatives (Shelf Life)</option>
            <option value="Acidity Regulator">Acidity Regulators (Sour Taste)</option>
            <option value="Food Colorant">Colorants (Food Dyes)</option>
            <option value="Thickener">Thickeners (Texture Gels)</option>
            <option value="Flavor Enhancer">Flavor Enhancers (Savory)</option>
            <option value="Artificial Sweetener">Sweeteners (Zero Sugar)</option>
          </select>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <div>Displaying <strong id="ins-count-badge" style="color: var(--color-primary);">12</strong> validated food additive entries.</div>
        <div style="font-size: 0.78rem; font-family: monospace; color: var(--color-primary);">[ REAL-TIME SANITIZED MATCH ENGINE ]</div>
      </div>

      <div class="grid-2" id="additive-results-grid"></div>
    </div>
  `;
  renderCards(ADDITIVE_DATABASE);
}

function renderCards(list) {
  const grid = document.getElementById('additive-results-grid');
  const countBadge = document.getElementById('ins-count-badge');
  if (!grid) return;

  if (countBadge) countBadge.textContent = list.length;

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <p style="font-size: 1.1rem; color: var(--color-text-muted);">No matching INS codes found for your search query.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => {
    const isUnhealthy = item.novaGroup.includes('Group 4');
    const badgeColor = isUnhealthy ? '#E11D48' : '#3B7A57';
    const badgeBg = isUnhealthy ? '#FEF2F2' : '#E8F5E9';

    return `
      <div class="hud-additive-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <span class="hud-code-tag">${sanitizeInput(item.code)}</span>
            <h3 style="font-size: 1.15rem; margin-top: 0.3rem;">${sanitizeInput(item.name)}</h3>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; padding: 0.25rem 0.65rem; border-radius: 99px;">
            ${sanitizeInput(item.category)}
          </span>
        </div>

        <p style="font-size: 0.88rem; color: var(--color-text-main); margin-bottom: 0.85rem; font-weight: 500; line-height: 1.45;">
          ${sanitizeInput(item.plainText)}
        </p>

        <div style="background: rgba(241, 245, 249, 0.8); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.82rem; margin-bottom: 0.75rem; border: 1px solid var(--color-border);">
          <strong style="color: var(--color-text-main);">Common Foods:</strong> ${sanitizeInput(item.commonFoods)}
        </div>

        <div style="font-size: 0.78rem; color: var(--color-text-muted); display: flex; justify-content: space-between; align-items: center;">
          <span><strong>FSSAI Rule:</strong> ${sanitizeInput(item.fssaiStatus)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function bindDecoderEvents() {
  const searchInput = document.getElementById('ins-search-input');
  const categoryFilter = document.getElementById('ins-category-filter');

  function filterList() {
    const rawQuery = searchInput.value || '';
    const cleanQuery = sanitizeInput(sanitizeSQL(rawQuery)).toLowerCase().trim();
    const cat = categoryFilter.value;

    const filtered = ADDITIVE_DATABASE.filter(item => {
      const matchesSearch = item.code.toLowerCase().includes(cleanQuery) ||
                            item.name.toLowerCase().includes(cleanQuery) ||
                            item.plainText.toLowerCase().includes(cleanQuery) ||
                            item.category.toLowerCase().includes(cleanQuery);
      const matchesCat = cat === 'all' || item.category.toLowerCase().includes(cat.toLowerCase());
      return matchesSearch && matchesCat;
    });

    renderCards(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterList);
  if (categoryFilter) categoryFilter.addEventListener('change', filterList);
}

document.addEventListener('DOMContentLoaded', initAdditiveDecoder);
