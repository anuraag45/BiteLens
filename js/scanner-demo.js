/* ==========================================================================
   BiteLens Web Application - Live Optical Scanner Studio Logic
   Supports: Live Camera Stream, Photo File Upload, OCR Simulation & API Wire
   ========================================================================== */

import { scanAPI } from './api.js';

const SCAN_PRESETS = {
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
      { code: "INS 500(ii)", name: "Acidity Regulator", text: "Sodium hydrogen carbonate — leavening agent." },
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
      { code: "INS 120", name: "Carmine Red", text: "Natural red pigment derived from cochineal." },
      { code: "INS 440", name: "Pectin", text: "Fruit thickener extracted from citrus peels." }
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
      { code: "Natural Spices", name: "Whole Spices", text: "Turmeric, cumin, black pepper — zero synthetic additives." }
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
let currentFacingMode = 'environment'; // 'user' or 'environment'

export function initLiveScanner() {
  const videoEl = document.getElementById('scanner-video');
  const modeCameraBtn = document.getElementById('mode-camera-btn');
  const modeUploadBtn = document.getElementById('mode-upload-btn');
  const cameraViewport = document.getElementById('camera-viewport-container');
  const uploadDropzone = document.getElementById('upload-dropzone-container');
  const captureBtn = document.getElementById('capture-scan-btn');
  const toggleCamBtn = document.getElementById('toggle-camera-btn');
  const fileInput = document.getElementById('label-file-input');

  // 1. Initialize Camera
  if (videoEl && cameraViewport) {
    startCameraStream();
  }

  // 2. Mode Switching (Camera vs Upload)
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

  // 3. Capture & Decode Action
  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      triggerScanAnimation();
      setTimeout(() => {
        // Randomly pick sample or use noodles for demonstration
        const keys = Object.keys(SCAN_PRESETS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        renderScanResults(SCAN_PRESETS[randomKey]);
      }, 1200);
    });
  }

  // 4. Camera Switcher
  if (toggleCamBtn) {
    toggleCamBtn.addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      startCameraStream();
    });
  }

  // 5. File Upload Handler
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        triggerScanAnimation();
        setTimeout(() => {
          renderScanResults(SCAN_PRESETS.oats);
        }, 1000);
      }
    });
  }

  // 6. Sample Preset Buttons
  const sampleBtns = document.querySelectorAll('[data-sample-test]');
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.dataset.sampleTest;
      if (SCAN_PRESETS[key]) {
        triggerScanAnimation();
        renderScanResults(SCAN_PRESETS[key]);
      }
    });
  });

  // Load default result
  renderScanResults(SCAN_PRESETS.oats);
}

async function startCameraStream() {
  const videoEl = document.getElementById('scanner-video');
  if (!videoEl || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn("Camera API not supported in this environment.");
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
    console.warn("Camera access denied or unavailable:", err.message);
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

function renderScanResults(product) {
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

document.addEventListener('DOMContentLoaded', initLiveScanner);
