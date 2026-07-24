/* ==========================================================================
   BiteLens Web Application - Interactive Food Scanning Showcase
   Theme: Light Wellness Elevated Cards
   ========================================================================== */

const FOOD_SAMPLES = {
  oats: {
    name: "Multigrain Oats Crisp",
    category: "Packaged Breakfast Cereal",
    image: "🥣",
    insCodes: [
      { code: "INS 500(ii)", title: "Acidity Regulator", text: "Sodium hydrogen carbonate — pH balance stabilizer." },
      { code: "INS 322", title: "Emulsifier", text: "Soy lecithin — prevents lipid separation." }
    ],
    healthScore: 72,
    healthLabel: "NOVA Group 3 (Processed)",
    healthColor: "#3B7A57",
    healthBg: "#E8F5E9",
    goalScore: 88,
    goalLabel: "High Fit (Protein & Fiber)",
    goalColor: "#0284C7",
    goalBg: "#E0F2FE",
    flagText: "Contains added dietary fiber; moderate sodium."
  },
  yogurt: {
    name: "Berry Flavored Yogurt",
    category: "Dairy Dessert Product",
    image: "🍓",
    insCodes: [
      { code: "INS 120", title: "Natural Colorant", text: "Carmine — red pigment derived from natural sources." },
      { code: "INS 440", title: "Stabilizer", text: "Pectin — thickener extracted from citrus peels." }
    ],
    healthScore: 54,
    healthLabel: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#D97706",
    healthBg: "#FEF3C7",
    goalScore: 62,
    goalLabel: "Moderate Fit (Added Sugars)",
    goalColor: "#0284C7",
    goalBg: "#E0F2FE",
    flagText: "High added sugar flag (14g per serving)."
  },
  makhana: {
    name: "Roasted Masala Makhana",
    category: "Traditional Indian Snack",
    image: "🫘",
    insCodes: [
      { code: "Natural Herbs", title: "Whole Spices", text: "Cumin, turmeric, black salt — zero synthetic additives." }
    ],
    healthScore: 92,
    healthLabel: "NOVA Group 2 (Minimal Processing)",
    healthColor: "#3B7A57",
    healthBg: "#E8F5E9",
    goalScore: 90,
    goalLabel: "Excellent Fit (Low Fat, High Fiber)",
    goalColor: "#3B7A57",
    goalBg: "#E8F5E9",
    flagText: "Clean label item; low sodium seasoning."
  }
};

export function initScannerDemo() {
  const container = document.getElementById('hero-scanner-container');
  if (!container) return;

  renderScannerHTML(container);
  bindScannerEvents();
  loadSample('oats');
}

function renderScannerHTML(container) {
  container.innerHTML = `
    <div class="phone-mockup">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        
        <!-- Target Sample Switcher -->
        <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.45rem; text-align: center; letter-spacing: 0.05em;">
          Select Sample Food Item:
        </div>
        <div class="scanner-selector">
          <button class="food-sample-btn active" data-sample="oats">🥣 Oats Crisp</button>
          <button class="food-sample-btn" data-sample="yogurt">🍓 Yogurt Cup</button>
          <button class="food-sample-btn" data-sample="makhana">🫘 Makhana</button>
        </div>

        <!-- Live Scanner Display Card -->
        <div class="scanner-display-card" id="scanner-display-card">
          <div class="cyber-scan-beam"></div>

          <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-size: 2rem;" id="scanner-img">🥣</div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 0.98rem; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="scanner-name">Multigrain Oats Crisp</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);" id="scanner-cat">Packaged Breakfast Cereal</div>
            </div>
          </div>

          <!-- Decoded INS Codes -->
          <div style="font-size: 0.72rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-secondary); text-transform: uppercase; margin-bottom: 0.4rem;">
            Decoded INS Codes & Ingredients:
          </div>
          <div id="ins-list" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
            <!-- Injected dynamically -->
          </div>

          <!-- Dual Telemetry Score Badges (Clean Elevated Styling) -->
          <div class="score-badge-group">
            <div class="score-box score-box-health">
              <div style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-family-display); color: #E11D48; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 0.15rem;">
                HEALTH SCORE (NOVA)
              </div>
              <div class="score-number" id="health-score-val" style="color: #E11D48;">72/100</div>
              <div id="health-score-label" style="font-size: 0.68rem; font-weight: 700; color: #991B1B; background: #FEE2E2; padding: 0.25rem 0.4rem; border-radius: 6px; margin-top: 0.25rem; line-height: 1.25;">
                NOVA Group 3 (Processed)
              </div>
            </div>

            <div class="score-box score-box-goal">
              <div style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-family-display); color: #0284C7; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 0.15rem;">
                GOAL FIT SCORE
              </div>
              <div class="score-number" id="goal-score-val" style="color: #0284C7;">88/100</div>
              <div id="goal-score-label" style="font-size: 0.68rem; font-weight: 700; color: #075985; background: #E0F2FE; padding: 0.25rem 0.4rem; border-radius: 6px; margin-top: 0.25rem; line-height: 1.25;">
                High Fit (Protein & Fiber)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

function bindScannerEvents() {
  const btns = document.querySelectorAll('.food-sample-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const sampleKey = e.target.dataset.sample;
      loadSample(sampleKey);
    });
  });
}

function loadSample(key) {
  const sample = FOOD_SAMPLES[key];
  if (!sample) return;

  const imgEl = document.getElementById('scanner-img');
  const nameEl = document.getElementById('scanner-name');
  const catEl = document.getElementById('scanner-cat');
  const insListEl = document.getElementById('ins-list');
  
  const healthValEl = document.getElementById('health-score-val');
  const healthLabelEl = document.getElementById('health-score-label');
  const goalValEl = document.getElementById('goal-score-val');
  const goalLabelEl = document.getElementById('goal-score-label');

  if (imgEl) imgEl.textContent = sample.image;
  if (nameEl) nameEl.textContent = sample.name;
  if (catEl) catEl.textContent = sample.category;

  if (insListEl) {
    insListEl.innerHTML = sample.insCodes.map(code => `
      <div style="background: rgba(241, 245, 249, 0.8); border: 1px solid var(--color-border); padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.78rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">${code.code}</span>
          <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600;">${code.title}</span>
        </div>
        <div style="color: var(--color-text-main); margin-top: 0.15rem; font-weight: 500;">${code.text}</div>
      </div>
    `).join('');
  }

  if (healthValEl) {
    healthValEl.textContent = `${sample.healthScore}/100`;
    healthValEl.style.color = sample.healthColor;
  }
  if (healthLabelEl) {
    healthLabelEl.textContent = sample.healthLabel;
    healthLabelEl.style.color = sample.healthColor;
    healthLabelEl.style.backgroundColor = sample.healthBg;
  }

  if (goalValEl) {
    goalValEl.textContent = `${sample.goalScore}/100`;
    goalValEl.style.color = sample.goalColor;
  }
  if (goalLabelEl) {
    goalLabelEl.textContent = sample.goalLabel;
    goalLabelEl.style.color = sample.goalColor;
    goalLabelEl.style.backgroundColor = sample.goalBg;
  }

  // Trigger beam scan animation
  const beam = document.querySelector('.cyber-scan-beam');
  if (beam) {
    beam.style.animation = 'none';
    void beam.offsetWidth;
    beam.style.animation = 'lightScan 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

document.addEventListener('DOMContentLoaded', initScannerDemo);
