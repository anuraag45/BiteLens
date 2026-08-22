/* ==========================================================================
   BiteLens Web Application - Interactive Label Scanner Studio Page
   Allows visitors to test 5 real Indian packaged food profiles
   ========================================================================== */

export const SCANNER_PROFILES = {
  noodles: {
    id: "noodles",
    title: "Classic Masala Instant Noodles",
    category: "Packaged Convenience Meal",
    image: "🍜",
    rawOCR: "Wheat Flour (Maida), Palm Oil, Salt, Wheat Gluten, INS 500(i), INS 501(i), INS 412. TASTEMAKER: Hydrolyzed Groundnut Protein, Mixed Spices, INS 621, INS 635, Caramel INS 150d.",
    decodedIngredients: [
      { name: "Maida & Palm Oil Base", note: "Refined carbohydrate fried in palm oil (high saturated fat)." },
      { name: "INS 621 (MSG)", note: "Monosodium Glutamate — potent savory flavor enhancer." },
      { name: "INS 635 (Disodium 5'-ribonucleotides)", note: "Synergistic flavor enhancer paired with MSG." },
      { name: "INS 412 (Guar Gum)", note: "Natural plant thickener maintaining noodle texture." },
      { name: "INS 150d (Caramel Color)", note: "Sulfite ammonia caramel dark coloring agent." }
    ],
    flags: [
      { type: "high-sodium", label: "High Sodium Warning", text: "890mg sodium per serving (44% of daily recommended limit)." },
      { type: "high-fat", label: "High Saturated Fat", text: "Deep-fried in palm oil; high saturated fat density." }
    ],
    healthScore: 38,
    healthTier: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#E11D48",
    goalScore: 45,
    goalTier: "Low Goal Fit (Refined Carbs & High Salt)",
    goalColor: "#D97706"
  },
  mangodrink: {
    id: "mangodrink",
    title: "Mango Nectar Fruit Beverage",
    category: "Packaged Fruit Drink",
    image: "🥭",
    rawOCR: "Water, Mango Pulp (19%), Sugar, Acidity Regulator (INS 330), Antioxidant (INS 300), Preservative (INS 211), Synthetic Food Color (INS 110).",
    decodedIngredients: [
      { name: "Water & Sugar Base", note: "Contains 19% real pulp; remaining volume is sugar syrup." },
      { name: "INS 330 (Citric Acid)", note: "Natural organic acid adding tartness." },
      { name: "INS 300 (Vitamin C)", note: "Ascorbic acid acting as antioxidant preservative." },
      { name: "INS 211 (Sodium Benzoate)", note: "Chemical preservative extending shelf life." },
      { name: "INS 110 (Sunset Yellow)", note: "Synthetic azo dye colorant giving bright orange hue." }
    ],
    flags: [
      { type: "high-sugar", label: "High Added Sugar Flag", text: "28g added sugar per 250ml bottle (exceeds recommended daily limit)." }
    ],
    healthScore: 46,
    healthTier: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#D97706",
    goalScore: 30,
    goalTier: "Poor Goal Fit for Weight Control",
    goalColor: "#E11D48"
  },
  proteinbar: {
    id: "proteinbar",
    title: "High Protein Chocolate Bar",
    category: "Sports Nutrition Snack",
    image: "🍫",
    rawOCR: "Protein Blend (Whey Protein Isolate, Milk Protein Concentrate), Dark Chocolate Coating (Cocoa Solids, INS 322), Maltitol, Dietary Fiber, INS 471, INS 955 (Sucralose).",
    decodedIngredients: [
      { name: "Whey & Milk Isolate", note: "High quality bioavailable protein source (20g per bar)." },
      { name: "INS 322 (Soy Lecithin)", note: "Emulsifier maintaining smooth chocolate coating." },
      { name: "INS 955 (Sucralose)", note: "Zero-calorie artificial sweetener keeping sugar low." },
      { name: "Maltitol", note: "Sugar alcohol bulk sweetener (low glycemic impact)." }
    ],
    flags: [
      { type: "info", label: "Dual Conflict Example", text: "Fits muscle building goal (20g protein) but uses UPF emulsifiers & sweeteners." }
    ],
    healthScore: 68,
    healthTier: "NOVA Group 4 (Ultra-Processed UPF)",
    healthColor: "#D97706",
    goalScore: 92,
    goalLabel: "Excellent Goal Fit (High Protein & Low Sugar)",
    goalColor: "#3B7A57"
  },
  biscuits: {
    id: "biscuits",
    title: "High Fiber Digestive Biscuits",
    category: "Packaged Baked Snack",
    image: "🍪",
    rawOCR: "Whole Wheat Flour (55%), Vegetable Oil (Palm), Sugar, Wheat Bran (4.5%), Raising Agents (INS 500ii, INS 503ii), Emulsifiers (INS 471, INS 472e), Salt, Malt Extract.",
    decodedIngredients: [
      { name: "Whole Wheat (55%) & Bran", note: "Good whole grain base with added dietary fiber." },
      { name: "Palm Oil & Sugar", note: "Standard commercial bakery shortening and sweetener." },
      { name: "INS 500(ii) & INS 503(ii)", note: "Sodium & ammonium bicarbonate leavening agents." },
      { name: "INS 472e", note: "Dough conditioner improving biscuit crispness." }
    ],
    flags: [
      { type: "moderate-sugar", label: "Moderate Sugar & Fat", text: "Whole wheat base, but contains 14g sugar and 16g fat per 100g." }
    ],
    healthScore: 71,
    healthTier: "NOVA Group 3 (Processed)",
    healthColor: "#3B7A57",
    goalScore: 75,
    goalTier: "Moderate Goal Fit (Fiber Content)",
    goalColor: "#0284C7"
  },
  chips: {
    id: "chips",
    title: "Spiced Potato Chips",
    category: "Packaged Savory Snack",
    image: "🍟",
    rawOCR: "Potatoes, Palmolein Oil, Seasoning (Salt, Chili Powder, Onion Powder, Garlic Powder, Sugar, INS 330, INS 621, INS 627, INS 631, Anti-caking Agent INS 551).",
    decodedIngredients: [
      { name: "Potatoes Fried in Palmolein", note: "High thermal processing producing crispy texture." },
      { name: "INS 621, 627, 631", note: "Triple flavor enhancer blend (MSG + Disodium Inosinate/Guanulate)." },
      { name: "INS 551 (Silicon Dioxide)", note: "Anti-caking agent preventing seasoning clumping." }
    ],
    flags: [
      { type: "high-sodium", label: "High Sodium & Calories", text: "High caloric density and high sodium seasoning." }
    ],
    healthScore: 42,
    healthTier: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#E11D48",
    goalScore: 35,
    goalTier: "Poor Goal Fit for Weight Loss",
    goalColor: "#E11D48"
  }
};

export function initScannerStudio() {
  const container = document.getElementById('scanner-studio-app');
  if (!container) return;

  renderStudioHTML(container);
  bindStudioEvents();
  loadStudioProfile('noodles');
}

function renderStudioHTML(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
      
      <!-- Profile Selector Column -->
      <div>
        <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-neon-emerald); text-transform: uppercase; margin-bottom: 0.75rem;">
          Select Sample Food Profile:
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="profile-btn-list">
          <button class="btn btn-outline studio-profile-btn active" data-id="noodles" style="justify-content: flex-start; text-align: left;">
            <span style="font-size: 1.5rem;">🍜</span>
            <div>
              <div style="font-weight: 700;">Instant Noodles</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">High Sodium & MSG</div>
            </div>
          </button>

          <button class="btn btn-outline studio-profile-btn" data-id="mangodrink" style="justify-content: flex-start; text-align: left;">
            <span style="font-size: 1.5rem;">🥭</span>
            <div>
              <div style="font-weight: 700;">Mango Fruit Nectar</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">High Added Sugar</div>
            </div>
          </button>

          <button class="btn btn-outline studio-profile-btn" data-id="proteinbar" style="justify-content: flex-start; text-align: left;">
            <span style="font-size: 1.5rem;">🍫</span>
            <div>
              <div style="font-weight: 700;">Protein Bar</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">High Protein / UPF Conflict</div>
            </div>
          </button>

          <button class="btn btn-outline studio-profile-btn" data-id="biscuits" style="justify-content: flex-start; text-align: left;">
            <span style="font-size: 1.5rem;">🍪</span>
            <div>
              <div style="font-weight: 700;">Digestive Biscuits</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Whole Wheat & Fiber</div>
            </div>
          </button>

          <button class="btn btn-outline studio-profile-btn" data-id="chips" style="justify-content: flex-start; text-align: left;">
            <span style="font-size: 1.5rem;">🍟</span>
            <div>
              <div style="font-weight: 700;">Spiced Potato Chips</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Triple Flavor Enhancers</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Studio Analysis Output Screen -->
      <div class="calculator-card" style="margin: 0;" id="studio-output-card">
        <!-- Rendered dynamically -->
      </div>

    </div>
  `;
}

function bindStudioEvents() {
  const btns = document.querySelectorAll('.studio-profile-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadStudioProfile(btn.dataset.id);
    });
  });
}

function loadStudioProfile(key) {
  const item = SCANNER_PROFILES[key];
  const output = document.getElementById('studio-output-card');
  if (!item || !output) return;

  output.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
      <div style="font-size: 3rem;">${item.image}</div>
      <div>
        <h2 style="font-size: 1.6rem; margin-bottom: 0.2rem;">${item.title}</h2>
        <div style="font-size: 0.88rem; color: var(--color-cyber-cyan); font-weight: 600;">${item.category}</div>
      </div>
    </div>

    <!-- Raw OCR Extraction -->
    <div style="margin-bottom: 1.5rem;">
      <div style="font-size: 0.8rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
        📷 Raw Label OCR Text Extraction:
      </div>
      <div style="background: rgba(241, 245, 249, 0.9); padding: 0.85rem; border-radius: var(--radius-sm); font-family: monospace; font-size: 0.82rem; color: var(--color-text-main); border: 1px solid var(--color-border);">
        "${item.rawOCR}"
      </div>
    </div>

    <!-- Decoded Plain Language Ingredients -->
    <div style="margin-bottom: 1.5rem;">
      <div style="font-size: 0.8rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-neon-emerald); text-transform: uppercase; margin-bottom: 0.6rem;">
        ✨ Plain-Language Decoded Breakdown:
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${item.decodedIngredients.map(ing => `
          <div style="background: #FFFFFF; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); border-left: 4px solid var(--color-neon-emerald);">
            <strong style="font-size: 0.9rem; color: var(--color-text-main);">${ing.name}</strong>
            <p style="font-size: 0.82rem; margin: 0.2rem 0 0 0; color: var(--color-text-muted);">${ing.note}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Dual Score Telemetry Meters -->
    <div class="grid-2" style="margin-bottom: 1.5rem;">
      <div class="result-box" style="margin: 0; background: rgba(59, 122, 87, 0.08); border-color: ${item.healthColor};">
        <div style="font-size: 0.8rem; font-weight: 700; font-family: var(--font-family-display); color: ${item.healthColor}; text-transform: uppercase;">Health Score (NOVA Processing)</div>
        <div class="result-val" style="color: ${item.healthColor};">${item.healthScore}/100</div>
        <div class="badge" style="background: ${item.healthColor}; color: white; font-size: 0.78rem; margin: 0;">${item.healthTier}</div>
      </div>

      <div class="result-box" style="margin: 0; background: rgba(2, 132, 199, 0.08); border-color: ${item.goalColor};">
        <div style="font-size: 0.8rem; font-weight: 700; font-family: var(--font-family-display); color: ${item.goalColor}; text-transform: uppercase;">Goal Fit Score</div>
        <div class="result-val" style="color: ${item.goalColor};">${item.goalScore}/100</div>
        <div class="badge" style="background: ${item.goalColor}; color: white; font-size: 0.78rem; margin: 0;">${item.goalTier || 'Evaluated'}</div>
      </div>
    </div>

    <!-- Flags -->
    <div>
      ${item.flags.map(f => `
        <div style="background: #FEF2F2; border: 1px solid #FCA5A5; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: #991B1B;">
          <strong>⚠️ ${f.label}:</strong> ${f.text}
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initScannerStudio);
