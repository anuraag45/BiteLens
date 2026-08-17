/* ==========================================================================
   BiteLens Web Application - Food Scanner Showcase & Live Camera Studio
   Supports:
   1. Interactive Smartphone Scanner Frame on Hero Landing Page (#hero-scanner-container)
   2. Live Camera Viewfinder & File Upload Studio on scanner-demo.html (#camera-viewport-container)
   ========================================================================== */

const FOOD_SAMPLES = {
  oats: {
    name: "Multigrain Oats Crisp",
    category: "Packaged Breakfast Cereal",
    image: "🥣",
    healthScore: 72,
    healthLabel: "NOVA Group 3 (Processed)",
    healthColor: "#3B7A57",
    healthBg: "#E8F5E9",
    goalScore: 88,
    goalLabel: "High Fit (Protein & Fiber)",
    goalColor: "#0284C7",
    goalBg: "#E0F2FE",
    additives: [
      { code: "INS 500(ii)", name: "Acidity Regulator", text: "Sodium hydrogen carbonate — pH balance stabilizer." },
      { code: "INS 322", name: "Emulsifier", text: "Soy lecithin — prevents lipid separation." }
    ],
    summary: "Whole oat base with added leavening minerals. Clean label with moderate natural fiber."
  },
  yogurt: {
    name: "Berry Flavored Yogurt",
    category: "Dairy Dessert Product",
    image: "🍓",
    healthScore: 54,
    healthLabel: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#D97706",
    healthBg: "#FEF3C7",
    goalScore: 62,
    goalLabel: "Moderate Fit (Added Sugars)",
    goalColor: "#0284C7",
    goalBg: "#E0F2FE",
    additives: [
      { code: "INS 120", name: "Natural Colorant", text: "Carmine — red pigment derived from natural sources." },
      { code: "INS 440", name: "Stabilizer", text: "Pectin — thickener extracted from citrus peels." }
    ],
    summary: "Contains natural fruit thickeners but flagged for 14g added industrial syrup per serving."
  },
  makhana: {
    name: "Roasted Masala Makhana",
    category: "Traditional Indian Snack",
    image: "🫘",
    healthScore: 92,
    healthLabel: "NOVA Group 2 (Minimal Processing)",
    healthColor: "#3B7A57",
    healthBg: "#E8F5E9",
    goalScore: 90,
    goalLabel: "Excellent Fit (Low Fat, High Fiber)",
    goalColor: "#3B7A57",
    goalBg: "#E8F5E9",
    additives: [
      { code: "Natural Herbs", name: "Whole Spices", text: "Cumin, turmeric, black salt — zero synthetic additives." }
    ],
    summary: "Clean formulation with zero artificial preservatives and low sodium seasoning."
  },
  noodles: {
    name: "Masala Instant Noodles",
    category: "Instant Convenience Food",
    image: "🍜",
    healthScore: 32,
    healthLabel: "NOVA Group 4 (Ultra-Processed)",
    healthColor: "#E11D48",
    healthBg: "#FEE2E2",
    goalScore: 40,
    goalLabel: "Low Fit (High Sodium & Refined Flour)",
    goalColor: "#E11D48",
    goalBg: "#FEE2E2",
    additives: [
      { code: "INS 621", name: "MSG (Flavor Enhancer)", text: "Monosodium glutamate — intense savory flavor powder." },
      { code: "INS 412", name: "Guar Gum (Stabilizer)", text: "Vegetable gum used for dough elasticity." },
      { code: "INS 451(i)", name: "Emulsifying Salts", text: "Penta sodium triphosphate — moisture retainer." }
    ],
    summary: "Ultra-processed noodle cake with high sodium density (820mg) and synthetic flavor enhancers."
  }
};

let currentStream = null;
let currentFacingMode = 'environment';

// --- 1. HERO SMARTPHONE SCANNER (index.html) ---
export function initHeroScanner() {
  const container = document.getElementById('hero-scanner-container');
  if (!container) return;

  container.innerHTML = `
    <div class="phone-mockup">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        
        <!-- Target Sample Switcher -->
        <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.45rem; text-align: center; letter-spacing: 0.05em;">
          Select Sample Food Item:
        </div>
        <div class="scanner-selector">
          <button type="button" class="food-sample-btn active" data-hero-sample="oats">🥣 Oats Crisp</button>
          <button type="button" class="food-sample-btn" data-hero-sample="yogurt">🍓 Yogurt Cup</button>
          <button type="button" class="food-sample-btn" data-hero-sample="makhana">🫘 Makhana</button>
        </div>

        <!-- Live Scanner Display Card -->
        <div class="scanner-display-card" id="hero-scanner-card">
          <div class="cyber-scan-beam" id="hero-scan-beam"></div>

          <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-size: 2rem;" id="hero-img">🥣</div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 0.98rem; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="hero-name">Multigrain Oats Crisp</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);" id="hero-cat">Packaged Breakfast Cereal</div>
            </div>
          </div>

          <!-- Decoded INS Codes -->
          <div style="font-size: 0.72rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-secondary); text-transform: uppercase; margin-bottom: 0.4rem;">
            Decoded INS Codes & Ingredients:
          </div>
          <div id="hero-ins-list" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem;">
            <!-- Injected dynamically -->
          </div>

          <!-- Dual Telemetry Score Badges -->
          <div class="score-badge-group">
            <div class="score-box score-box-health">
              <div style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-family-display); color: #E11D48; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 0.15rem;">
                HEALTH SCORE (NOVA)
              </div>
              <div class="score-number" id="hero-health-val" style="color: #E11D48;">72/100</div>
              <div id="hero-health-label" style="font-size: 0.68rem; font-weight: 700; color: #991B1B; background: #FEE2E2; padding: 0.25rem 0.4rem; border-radius: 6px; margin-top: 0.25rem; line-height: 1.25;">
                NOVA Group 3 (Processed)
              </div>
            </div>

            <div class="score-box score-box-goal">
              <div style="font-size: 0.65rem; font-weight: 800; font-family: var(--font-family-display); color: #0284C7; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 0.15rem;">
                GOAL FIT SCORE
              </div>
              <div class="score-number" id="hero-goal-val" style="color: #0284C7;">88/100</div>
              <div id="hero-goal-label" style="font-size: 0.68rem; font-weight: 700; color: #075985; background: #E0F2FE; padding: 0.25rem 0.4rem; border-radius: 6px; margin-top: 0.25rem; line-height: 1.25;">
                High Fit (Protein & Fiber)
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
      e.target.classList.add('active');
      const key = e.target.dataset.heroSample;
      loadHeroSample(key);
    });
  });

  loadHeroSample('oats');
}

function loadHeroSample(key) {
  const sample = FOOD_SAMPLES[key];
  if (!sample) return;

  const imgEl = document.getElementById('hero-img');
  const nameEl = document.getElementById('hero-name');
  const catEl = document.getElementById('hero-cat');
  const insListEl = document.getElementById('hero-ins-list');
  const healthValEl = document.getElementById('hero-health-val');
  const healthLabelEl = document.getElementById('hero-health-label');
  const goalValEl = document.getElementById('hero-goal-val');
  const goalLabelEl = document.getElementById('hero-goal-label');

  if (imgEl) imgEl.textContent = sample.image;
  if (nameEl) nameEl.textContent = sample.name;
  if (catEl) catEl.textContent = sample.category;

  if (insListEl) {
    insListEl.innerHTML = sample.additives.map(code => `
      <div style="background: rgba(241, 245, 249, 0.8); border: 1px solid var(--color-border); padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.78rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">${code.code}</span>
          <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600;">${code.name}</span>
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

  const beam = document.getElementById('hero-scan-beam');
  if (beam) {
    beam.style.animation = 'none';
    void beam.offsetWidth;
    beam.style.animation = 'scanSweep 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

// --- 2. LIVE CAMERA SCANNER STUDIO (scanner-demo.html) ---
export function initLiveScanner() {
  const cameraViewport = document.getElementById('camera-viewport-container');
  if (!cameraViewport) return;

  const videoEl = document.getElementById('scanner-video');
  const modeCameraBtn = document.getElementById('mode-camera-btn');
  const modeUploadBtn = document.getElementById('mode-upload-btn');
  const uploadDropzone = document.getElementById('upload-dropzone-container');
  const captureBtn = document.getElementById('capture-scan-btn');
  const toggleCamBtn = document.getElementById('toggle-camera-btn');
  const fileInput = document.getElementById('label-file-input');

  if (videoEl && cameraViewport) {
    startCameraStream();
  }

  if (modeCameraBtn && modeUploadBtn) {
    modeCameraBtn.addEventListener('click', () => {
      modeCameraBtn.classList.add('active');
      modeUploadBtn.classList.remove('active');
      cameraViewport.style.display = 'flex';
      uploadDropzone.style.display = 'none';
      startCameraStream();
    });

    modeUploadBtn.addEventListener('click', () => {
      modeUploadBtn.classList.add('active');
      modeCameraBtn.classList.remove('active');
      cameraViewport.style.display = 'none';
      uploadDropzone.style.display = 'block';
      stopCameraStream();
    });
  }

  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      triggerScanAnimation();
      setTimeout(() => {
        const keys = Object.keys(FOOD_SAMPLES);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        renderStudioResults(FOOD_SAMPLES[randomKey]);
      }, 1200);
    });
  }

  if (toggleCamBtn) {
    toggleCamBtn.addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      startCameraStream();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        triggerScanAnimation();
        setTimeout(() => {
          renderStudioResults(FOOD_SAMPLES.oats);
        }, 1000);
      }
    });
  }

  const sampleBtns = document.querySelectorAll('[data-sample-test]');
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.dataset.sampleTest;
      if (FOOD_SAMPLES[key]) {
        triggerScanAnimation();
        renderStudioResults(FOOD_SAMPLES[key]);
      }
    });
  });

  renderStudioResults(FOOD_SAMPLES.oats);
}

async function startCameraStream() {
  const videoEl = document.getElementById('scanner-video');
  if (!videoEl || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return;
  }

  try {
    stopCameraStream();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode }
    });
    currentStream = stream;
    videoEl.srcObject = stream;
  } catch (err) {
    console.warn("Camera stream unavailable:", err.message);
  }
}

function stopCameraStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

function triggerScanAnimation() {
  const beam = document.getElementById('active-scan-beam');
  if (beam) {
    beam.classList.remove('scanning');
    void beam.offsetWidth;
    beam.classList.add('scanning');
  }
}

function renderStudioResults(product) {
  const nameEl = document.getElementById('res-product-name');
  const catEl = document.getElementById('res-product-cat');
  const iconEl = document.getElementById('res-product-icon');
  const statusTag = document.getElementById('product-status-tag');
  
  const healthScore = document.getElementById('res-health-score');
  const healthBadge = document.getElementById('res-health-badge');
  const goalScore = document.getElementById('res-goal-score');
  const goalBadge = document.getElementById('res-goal-badge');
  
  const additivesList = document.getElementById('res-additives-list');
  const additiveCount = document.getElementById('res-additive-count');
  const summaryText = document.getElementById('res-summary-text');

  if (nameEl) nameEl.textContent = product.name;
  if (catEl) catEl.textContent = product.category;
  if (iconEl) iconEl.textContent = product.image;
  if (statusTag) {
    statusTag.textContent = "Telemetry Decoded";
    statusTag.style.background = "rgba(59, 122, 87, 0.15)";
    statusTag.style.color = "#3B7A57";
  }

  if (healthScore) {
    healthScore.textContent = `${product.healthScore}/100`;
    healthScore.style.color = product.healthColor;
  }
  if (healthBadge) {
    healthBadge.textContent = product.healthLabel;
    healthBadge.style.color = product.healthColor;
    healthBadge.style.backgroundColor = product.healthBg;
  }

  if (goalScore) {
    goalScore.textContent = `${product.goalScore}/100`;
    goalScore.style.color = product.goalColor;
  }
  if (goalBadge) {
    goalBadge.textContent = product.goalLabel;
    goalBadge.style.color = product.goalColor;
    goalBadge.style.backgroundColor = product.goalBg;
  }

  if (additiveCount) {
    additiveCount.textContent = `${product.additives.length} Detected`;
  }

  if (additivesList) {
    additivesList.innerHTML = product.additives.map(item => `
      <div style="background: rgba(241, 245, 249, 0.8); border: 1px solid var(--color-border); padding: 0.45rem 0.65rem; border-radius: 8px; font-size: 0.8rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary);">${item.code}</span>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">${item.name}</span>
        </div>
        <div style="color: var(--color-text-main); margin-top: 0.15rem;">${item.text}</div>
      </div>
    `).join('');
  }

  if (summaryText) {
    summaryText.textContent = product.summary;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroScanner();
    initLiveScanner();
  });
}
