/* ==========================================================================
   Pink Web Application - Interactive Food Scanning Showcase (Light Mode)
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
    goalScore: 88,
    goalLabel: "High Fit (Protein & Fiber)",
    goalColor: "#0284C7",
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
    goalScore: 62,
    goalLabel: "Moderate Fit (Added Sugars)",
    goalColor: "#0284C7",
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
    goalScore: 90,
    goalLabel: "Excellent Fit (Low Fat, High Fiber)",
    goalColor: "#3B7A57",
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
        <div style="font-size: 0.78rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-neon-emerald); text-transform: uppercase; margin-bottom: 0.4rem; text-align: center; letter-spacing: 0.03em;">
          Select Sample Food Item:
        </div>
        <div class="scanner-selector">
          <button class="food-sample-btn active" data-sample="oats">🥣 Oats Crisp</button>
          <button class="food-sample-btn" data-sample="yogurt">🍓 Yogurt Cup</button>
          <button class="food-sample-btn" data-sample="makhana">🫘 Makhana</button>
        </div>

        <!-- Live Scanner Display Card -->
        <div class="scanner-display-card" id="scanner-display-card">
          <!-- Animated Laser Beam Overlay -->
          <div class="cyber-scan-beam"></div>

          <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-size: 2rem;" id="scanner-img">🥣</div>
            <div>
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 1rem; color: var(--color-text-main);" id="scanner-name">Multigrain Oats Crisp</div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);" id="scanner-cat">Packaged Breakfast Cereal</div>
            </div>
          </div>

          <!-- Decoded INS Codes -->
          <div style="font-size: 0.75rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-cyber-cyan); text-transform: uppercase; margin-bottom: 0.4rem;">
            Decoded INS Codes & Ingredients:
          </div>
          <div id="ins-list" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
            <!-- Injected dynamically -->
          </div>

          <!-- Score Badges Group -->
          <div class="score-badge-group">
            <div class="score-box score-box-health">
              <div style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-neon-emerald); text-transform: uppercase;">Health Score</div>
              <div class="score-number" id="health-score-val" style="color: var(--color-neon-emerald);">72/100</div>
              <div style="font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted);" id="health-score-label">NOVA Group 3</div>
            </div>

            <div class="score-box score-box-goal">
              <div style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-cyber-cyan); text-transform: uppercase;">Goal Fit Score</div>
              <div class="score-number" id="goal-score-val" style="color: var(--color-cyber-cyan);">88/100</div>
              <div style="font-size: 0.68rem; font-weight: 600; color: var(--color-text-muted);" id="goal-score-label">High Protein Fit</div>
            </div>
          </div>

          <div style="margin-top: 0.75rem; background: var(--color-bg-space); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--color-text-muted); border: 1px solid var(--color-border);" id="scanner-flag">
            Contains added dietary fiber; moderate sodium.
          </div>
        </div>

      </div>
    </div>
  `;
}

function bindScannerEvents() {
  const buttons = document.querySelectorAll('.food-sample-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadSample(btn.dataset.sample);
    });
  });
}

function loadSample(key) {
  const item = FOOD_SAMPLES[key];
  if (!item) return;

  const card = document.getElementById('scanner-display-card');
  if (card) {
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.98)';
  }

  setTimeout(() => {
    document.getElementById('scanner-img').textContent = item.image;
    document.getElementById('scanner-name').textContent = item.name;
    document.getElementById('scanner-cat').textContent = item.category;

    const insList = document.getElementById('ins-list');
    insList.innerHTML = item.insCodes.map(ins => `
      <div style="background: rgba(241, 245, 249, 0.8); padding: 0.45rem 0.65rem; border-radius: 6px; border-left: 3px solid var(--color-neon-emerald);">
        <strong style="font-size: 0.8rem; color: var(--color-text-main); font-family: var(--font-family-display);">${ins.code}: ${ins.title}</strong>
        <p style="font-size: 0.75rem; margin: 0; color: var(--color-text-muted);">${ins.text}</p>
      </div>
    `).join('');

    const healthVal = document.getElementById('health-score-val');
    healthVal.textContent = `${item.healthScore}/100`;
    healthVal.style.color = item.healthColor;
    document.getElementById('health-score-label').textContent = item.healthLabel;

    const goalVal = document.getElementById('goal-score-val');
    goalVal.textContent = `${item.goalScore}/100`;
    goalVal.style.color = item.goalColor;
    document.getElementById('goal-score-label').textContent = item.goalLabel;

    document.getElementById('scanner-flag').textContent = `💡 Note: ${item.flagText}`;

    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    }
  }, 120);
}

// Auto init
document.addEventListener('DOMContentLoaded', initScannerDemo);
