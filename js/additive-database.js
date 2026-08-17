/* ==========================================================================
   BiteLens Web Application - INS Additive Search & Decoder Database
   Accelerated with High-Performance Data Structures:
   - Trie for O(L) prefix indexing & autocompletion
   - LRUCache for O(1) instant search memory caching
   - FuzzyMatcher (Levenshtein) for typo-tolerant OCR search
   - Security Hardening (XSS & SQL Injection Sanitization)
   ========================================================================== */

import { sanitizeInput, sanitizeSQL } from './security.js';
import { Trie, LRUCache, FuzzyMatcher } from './data-structures.js';

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
    name: "Caramel IV (Sulphite Ammonia Caramel)",
    category: "Food Colorant",
    plainText: "Dark brown food coloring manufactured with ammonia to give colas and dark sauces their rich color.",
    fssaiStatus: "Permitted in colas, dark beers, and seasonings under strict limit.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Cola sodas, barbecue sauces, gravies, confectioneries.",
    healthNote: "Synthesized colorant containing 4-MEI byproduct; signals heavy industrial formulation."
  },
  {
    code: "INS 223",
    name: "Sodium Metabisulphite",
    category: "Preservative / Antioxidant",
    plainText: "Preservative powder used to stop potato chips and dried fruits from turning dark.",
    fssaiStatus: "Permitted in dried fruits and biscuits with allergen declaration.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Dried fruits, potato flakes, wine, packaged fruit juices.",
    healthNote: "Sulphite compound; can trigger respiratory sensitivity in individuals with asthma."
  },
  {
    code: "INS 471",
    name: "Mono- and Diglycerides of Fatty Acids",
    category: "Emulsifier",
    plainText: "Industrial oil stabilizer that keeps packaged bread soft and stops peanut butter from separating.",
    fssaiStatus: "Permitted under Good Manufacturing Practice.",
    novaGroup: "NOVA Group 4 (Ultra-Processed)",
    commonFoods: "Packaged sliced bread, ice creams, margarines, packaged cakes.",
    healthNote: "Processed fat derivative; hallmark indicator of ultra-processed bakery goods."
  }
];

// --- Data Structure Initialization ---
const additiveTrie = new Trie();
const searchLRUCache = new LRUCache(80);

// Populate Trie with code, name, and alias tokens
ADDITIVE_DATABASE.forEach(item => {
  additiveTrie.insert(item.code, item);
  additiveTrie.insert(item.name, item);
  additiveTrie.insert(item.code.replace(/\s+/g, ''), item); // e.g. "INS621"
  additiveTrie.insert(item.code.replace(/INS\s*/i, ''), item); // e.g. "621"
  if (item.name.includes("MSG")) additiveTrie.insert("MSG", item);
});

export function initAdditiveDecoder() {
  const container = document.getElementById('additive-decoder-container') || document.getElementById('additive-decoder-app');
  if (!container) return;

  renderDecoderHTML(container);
  bindDecoderEvents();
  handleUrlQueryParams();
}

function handleUrlQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get('code');
  if (codeParam) {
    const searchInput = document.getElementById('ins-search-input');
    if (searchInput) {
      searchInput.value = codeParam;
      searchInput.dispatchEvent(new Event('input'));
      setTimeout(() => {
        const grid = document.getElementById('additive-results-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
}

function renderDecoderHTML(container) {
  container.innerHTML = `
    <div class="hud-telemetry-workbench">
      <div class="hud-status-bar">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="hud-pulse-dot"></div>
          <span style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.85rem; letter-spacing: 0.05em; color: var(--color-primary);">
            TRIE-INDEXED FSSAI ADDITIVE DECODER
          </span>
        </div>
        <div style="font-family: monospace; font-size: 0.78rem; color: var(--color-text-muted);">
          STATUS: <span style="color: #2D6A4F; font-weight: 700;">LIVE O(L) TRIE & LRU CACHE ACTIVE</span>
        </div>
      </div>

      <div class="hud-controls-grid">
        <div>
          <label for="ins-search-input" class="form-label" style="font-size: 0.85rem; text-transform: uppercase;">
            Search by INS Code, Name or Keyword
          </label>
          <input 
            type="text" 
            id="ins-search-input" 
            class="form-input hud-input" 
            placeholder="e.g. INS 621, MSG, Lecithin, Preservative..."
            autocomplete="off"
          >
        </div>

        <div>
          <label for="ins-category-filter" class="form-label" style="font-size: 0.85rem; text-transform: uppercase;">
            Filter by Additive Class
          </label>
          <select id="ins-category-filter" class="form-select hud-select">
            <option value="all">All Functional Classes</option>
            <option value="Flavor Enhancer">Flavor Enhancers</option>
            <option value="Emulsifier">Emulsifiers</option>
            <option value="Preservative">Preservatives</option>
            <option value="Colorant">Food Colorants</option>
            <option value="Sweetener">Artificial Sweeteners</option>
            <option value="Thickener">Thickeners / Stabilizers</option>
            <option value="Acidity Regulator">Acidity Regulators</option>
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--color-text-muted);">
        <div>Displaying <strong id="ins-count-badge" style="color: var(--color-primary);">${ADDITIVE_DATABASE.length}</strong> validated food additive entries.</div>
        <div style="font-size: 0.78rem; font-family: monospace; color: var(--color-primary);">[ REAL-TIME TRIE & LEVENSHTEIN FUZZY MATCH ]</div>
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
    const cacheKey = `${cleanQuery}__${cat}`;

    // 1. Check LRU Cache
    if (searchLRUCache.has(cacheKey)) {
      renderCards(searchLRUCache.get(cacheKey));
      return;
    }

    if (!cleanQuery && cat === 'all') {
      searchLRUCache.put(cacheKey, ADDITIVE_DATABASE);
      renderCards(ADDITIVE_DATABASE);
      return;
    }

    // 2. Perform Hybrid Trie + Filter Search
    let matchedItems = [];
    
    // Check Trie for exact prefix
    const trieMatches = additiveTrie.autocomplete(cleanQuery, 10);
    const seenCodes = new Set();

    trieMatches.forEach(item => {
      if (!seenCodes.has(item.code)) {
        seenCodes.add(item.code);
        matchedItems.push(item);
      }
    });

    // Fallback general filter
    ADDITIVE_DATABASE.forEach(item => {
      if (seenCodes.has(item.code)) return;
      const matchesSearch = item.code.toLowerCase().includes(cleanQuery) ||
                            item.name.toLowerCase().includes(cleanQuery) ||
                            item.plainText.toLowerCase().includes(cleanQuery) ||
                            item.category.toLowerCase().includes(cleanQuery) ||
                            FuzzyMatcher.similarity(item.name, cleanQuery) > 0.65;
      if (matchesSearch) {
        seenCodes.add(item.code);
        matchedItems.push(item);
      }
    });

    // Apply Category Filter
    if (cat !== 'all') {
      matchedItems = matchedItems.filter(item => item.category.toLowerCase().includes(cat.toLowerCase()));
    }

    searchLRUCache.put(cacheKey, matchedItems);
    renderCards(matchedItems);
  }

  if (searchInput) searchInput.addEventListener('input', filterList);
  if (categoryFilter) categoryFilter.addEventListener('change', filterList);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAdditiveDecoder);
}
