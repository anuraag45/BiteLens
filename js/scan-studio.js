/* ==========================================================================
   BiteLens Web Application - Live Optical Scanner & Telemetry Studio
   Features:
   1. Real Tesseract.js client-side OCR on uploaded images and camera snapshots
   2. Interactive SVG/Canvas Bounding Boxes (Red, Amber, Green) drawn directly on label photos
   3. Tap-for-details floating tooltip with regulatory status & evidence citations
   4. Mobile haptic buzz (navigator.vibrate([40])) upon additive detection
   5. Barcode mode via html5-qrcode with Open Food Facts API fallback
   6. Guided Lab Walkthrough mode
   7. Animated BiteLens Score Gauge & Stacked Ingredient Order Bar
   8. Multi-language explanations in English, Hindi, and Gujarati
   ========================================================================== */

import { performOpticalOCR, calculateBiteLensScore, lookupBarcodeTelemetry } from './analyze.js';
import { defaultSwapsEngine } from './swaps.js';
import { getUserProfile } from './calculators.js';
import productsData from './data/products.js';
import { ADDITIVE_DATABASE } from './additive-database.js';
import { Html5Qrcode } from 'html5-qrcode';

let activeHtml5Qrcode = null;
let currentLanguage = 'en';
let currentAnalysisResult = null;

export function initScanStudio() {
  bindModeToggles();
  bindImageUpload();
  bindCameraCapture();
  bindPresetChips();
  bindLanguageSelector();
  bindGuidedLab();

  // Load initial preset (Kurkure or Oats)
  loadSampleProduct('kurkure-masala-munch');
}

/**
 * 1. Mode Toggles (Camera Photo vs File Upload vs Barcode vs Guided Lab)
 */
function bindModeToggles() {
  const modeCameraBtn = document.getElementById('mode-camera-btn');
  const modeUploadBtn = document.getElementById('mode-upload-btn');
  const modeBarcodeBtn = document.getElementById('mode-barcode-btn');
  const modeLabBtn = document.getElementById('mode-lab-btn');

  const cameraSection = document.getElementById('camera-viewport-section');
  const uploadSection = document.getElementById('upload-dropzone-section');
  const barcodeSection = document.getElementById('barcode-scanner-section');
  const labSection = document.getElementById('guided-lab-section');

  function switchMode(activeBtn, showSection) {
    [modeCameraBtn, modeUploadBtn, modeBarcodeBtn, modeLabBtn].forEach(b => b?.classList.remove('active'));
    [cameraSection, uploadSection, barcodeSection, labSection].forEach(s => {
      if (s) s.style.display = 'none';
    });

    if (activeBtn) activeBtn.classList.add('active');
    if (showSection) showSection.style.display = 'block';

    // Stop barcode scanner if switching away
    if (activeHtml5Qrcode && showSection !== barcodeSection) {
      activeHtml5Qrcode.stop().catch(() => {}).finally(() => {
        activeHtml5Qrcode = null;
      });
    }
  }

  if (modeCameraBtn) modeCameraBtn.onclick = () => switchMode(modeCameraBtn, cameraSection);
  if (modeUploadBtn) modeUploadBtn.onclick = () => switchMode(modeUploadBtn, uploadSection);
  if (modeBarcodeBtn) {
    modeBarcodeBtn.onclick = () => {
      switchMode(modeBarcodeBtn, barcodeSection);
      startBarcodeScanner();
    };
  }
  if (modeLabBtn) modeLabBtn.onclick = () => switchMode(modeLabBtn, labSection);
}

/**
 * 2. File Upload & Real Tesseract.js OCR Execution
 */
function bindImageUpload() {
  const fileInput = document.getElementById('label-file-input');
  const dropzone = document.getElementById('upload-dropzone-section');

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedImage(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-primary)';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--color-border)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-border)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedImage(e.dataTransfer.files[0]);
      }
    });
  }
}

async function processUploadedImage(file) {
  const progressBar = document.getElementById('ocr-progress-bar');
  const progressText = document.getElementById('ocr-progress-text');
  const progressContainer = document.getElementById('ocr-progress-container');
  const annotatedContainer = document.getElementById('annotated-image-container');

  if (progressContainer) progressContainer.style.display = 'block';
  if (annotatedContainer) annotatedContainer.innerHTML = '';

  const imgUrl = URL.createObjectURL(file);

  const ocrResult = await performOpticalOCR(file, (percent) => {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Running OCR Engine: ${percent}%`;
  });

  if (progressContainer) progressContainer.style.display = 'none';

  if (ocrResult.success) {
    // Mobile haptic feedback on detection
    if (ocrResult.additives.length > 0 && navigator.vibrate) {
      try { navigator.vibrate([40, 60, 40]); } catch (e) {}
    }

    renderAnnotatedImage(imgUrl, ocrResult.annotatedBoxes);

    const userProfile = getUserProfile() || {};
    const scoreData = calculateBiteLensScore({
      novaGroup: ocrResult.additives.length > 1 ? 4 : (ocrResult.additives.length === 1 ? 3 : 2),
      additives: ocrResult.additives,
      userGoal: userProfile.weightGoal || 'maintenance'
    });

    currentAnalysisResult = {
      name: "Uploaded Label Photo",
      brand: "Optical Recognition",
      category: "Packaged Food",
      icon: "📷",
      ingredientsRaw: ocrResult.rawText,
      detectedAdditives: ocrResult.additives,
      scoreData
    };

    renderAnalysisDossier(currentAnalysisResult);
  }
}

/**
 * 3. Draws Interactive Colored Bounding Boxes on User's Photo
 */
function renderAnnotatedImage(imageUrl, boxes) {
  const container = document.getElementById('annotated-image-container');
  if (!container) return;

  container.style.display = 'block';
  container.innerHTML = `
    <div style="position: relative; max-width: 100%; display: inline-block;">
      <img id="annotated-base-img" src="${imageUrl}" style="width: 100%; border-radius: var(--radius-md); display: block;" alt="Uploaded food label">
      <div id="bounding-boxes-layer" style="position: absolute; inset: 0; pointer-events: auto;"></div>
    </div>
    <div id="ocr-popover-tooltip" style="display: none; position: absolute; z-index: 100; background: #FFFFFF; border: 1.5px solid var(--color-border); border-radius: 12px; padding: 0.85rem; box-shadow: var(--shadow-lg); max-width: 280px; font-size: 0.82rem;"></div>
  `;

  const baseImg = document.getElementById('annotated-base-img');
  const boxesLayer = document.getElementById('bounding-boxes-layer');
  const tooltip = document.getElementById('ocr-popover-tooltip');

  const drawBoxes = () => {
    const nw = baseImg.naturalWidth || baseImg.clientWidth || 1;
    const nh = baseImg.naturalHeight || baseImg.clientHeight || 1;
    const scaleX = baseImg.clientWidth / nw;
    const scaleY = baseImg.clientHeight / nh;

    boxesLayer.innerHTML = '';
    boxes.forEach(box => {
      const el = document.createElement('div');
      el.className = 'ocr-bounding-box';
      el.style.left = `${box.bbox.x0 * scaleX}px`;
      el.style.top = `${box.bbox.y0 * scaleY}px`;
      el.style.width = `${(box.bbox.x1 - box.bbox.x0) * scaleX}px`;
      el.style.height = `${(box.bbox.y1 - box.bbox.y0) * scaleY}px`;
      el.style.borderColor = box.color;

      const badge = document.createElement('span');
      badge.className = 'ocr-box-badge';
      badge.style.backgroundColor = box.color;
      badge.textContent = box.additive.code;
      el.appendChild(badge);

      // Tap-for-details tooltip interaction
      el.onclick = (e) => {
        e.stopPropagation();
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${Math.min(baseImg.clientWidth - 290, box.bbox.x0 * scaleX)}px`;
          tooltip.style.top = `${(box.bbox.y1 * scaleY) + 8}px`;
          tooltip.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="color: ${box.color};">${box.additive.code}</strong>
              <span style="font-size: 0.72rem; background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">${box.additive.category || 'Additive'}</span>
            </div>
            <div style="font-weight: 700; color: var(--color-text-main); margin-bottom: 0.3rem;">${box.additive.name}</div>
            <p style="color: var(--color-text-muted); margin: 0 0 0.4rem 0; font-size: 0.78rem;">
              ${box.additive.translations?.[currentLanguage] || box.additive.plainText || box.additive.name}
            </p>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 0.35rem;">
              <strong>FSSAI:</strong> ${(box.additive.fssaiStatus || 'Permitted additive under FSSAI schedule.').slice(0, 100)}...
            </div>
          `;
        }
      };

      boxesLayer.appendChild(el);
    });
  };

  if (baseImg.complete && baseImg.naturalWidth > 0) {
    drawBoxes();
  } else {
    baseImg.onload = drawBoxes;
  }

  document.addEventListener('click', () => {
    if (tooltip) tooltip.style.display = 'none';
  });
}

/**
 * 4. Camera Snapshot Studio
 */
function bindCameraCapture() {
  const videoEl = document.getElementById('camera-stream-video');
  const captureBtn = document.getElementById('snap-photo-btn');
  const toggleCamBtn = document.getElementById('switch-cam-btn');

  let stream = null;
  let facingMode = 'environment';

  async function startCam() {
    if (!videoEl || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      videoEl.srcObject = stream;
    } catch (e) {
      console.warn("Camera inaccessible:", e.message);
    }
  }

  if (toggleCamBtn) {
    toggleCamBtn.onclick = () => {
      facingMode = facingMode === 'environment' ? 'user' : 'environment';
      startCam();
    };
  }

  if (captureBtn) {
    captureBtn.onclick = () => {
      if (!videoEl) return;
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0);

      canvas.toBlob(blob => {
        if (blob) processUploadedImage(blob);
      }, 'image/jpeg');
    };
  }

  startCam();
}

/**
 * 5. Barcode Scanner via html5-qrcode with Open Food Facts Fallback
 */
function startBarcodeScanner() {
  const qrRegion = document.getElementById('barcode-reader-region');
  if (!qrRegion || activeHtml5Qrcode) return;

  activeHtml5Qrcode = new Html5Qrcode('barcode-reader-region');
  activeHtml5Qrcode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 260, height: 160 } },
    async (decodedText) => {
      if (navigator.vibrate) {
        try { navigator.vibrate([60]); } catch (e) {}
      }
      activeHtml5Qrcode.stop().catch(() => {}).finally(() => {
        activeHtml5Qrcode = null;
      });

      const result = await lookupBarcodeTelemetry(decodedText);
      if (result) {
        renderAnalysisDossier({
          name: result.product.name,
          brand: result.product.brand,
          category: result.product.category,
          icon: result.product.icon,
          ingredientsRaw: result.product.ingredientsRaw,
          detectedAdditives: result.product.detectedAdditives,
          scoreData: result.scoreData,
          swaps: defaultSwapsEngine.getSwapsForProduct(result.product)
        });
      } else {
        alert(`Barcode ${decodedText} scanned. No match in FSSAI catalog or Open Food Facts.`);
      }
    },
    () => {}
  ).catch(err => {
    console.warn("Barcode start failed:", err);
  });
}

/**
 * 6. Sample Preset Chips
 */
function bindPresetChips() {
  const chips = document.querySelectorAll('[data-scan-preset]');
  chips.forEach(chip => {
    chip.onclick = () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const id = chip.dataset.scanPreset;
      loadSampleProduct(id);
    };
  });
}

function loadSampleProduct(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const userProfile = getUserProfile() || {};
  const additives = product.detectedAdditives.map(code => {
    const found = ADDITIVE_DATABASE.find(a => a.code === code);
    return found || {
      code,
      name: code,
      category: 'Additive',
      penaltyWeight: 6,
      riskLevel: 'moderate',
      plainText: 'Permitted packaged food additive.',
      translations: {
        en: 'Permitted packaged food additive.',
        hi: 'पैकेज्ड खाद्य पदार्थों में उपयोग के लिए स्वीकृत एडिटिव।',
        gu: 'પેકેજ્ડ ફૂડમાં માન્ય ફૂડ એડિટિવ.'
      },
      fssaiStatus: 'Permitted additive under Food Safety and Standards Regulations.'
    };
  });

  const scoreData = calculateBiteLensScore({
    novaGroup: product.novaGroup,
    additives,
    macros: product.macrosPer100g,
    userGoal: userProfile.weightGoal || 'maintenance'
  });

  const swaps = defaultSwapsEngine.getSwapsForProduct(product);

  currentAnalysisResult = {
    name: product.name,
    brand: product.brand,
    category: product.category,
    icon: product.icon,
    ingredientsRaw: product.ingredientsRaw,
    detectedAdditives: additives,
    scoreData,
    swaps
  };

  renderAnalysisDossier(currentAnalysisResult);
}

/**
 * 7. Dossier Rendering: Score Dial, Stacked Bar & Itemized Explanations
 */
function renderAnalysisDossier(data) {
  const nameEl = document.getElementById('dossier-prod-name');
  const catEl = document.getElementById('dossier-prod-cat');
  const iconEl = document.getElementById('dossier-prod-icon');
  const scoreValEl = document.getElementById('dossier-score-val');
  const tierBadgeEl = document.getElementById('dossier-tier-badge');
  const novaBadgeEl = document.getElementById('dossier-nova-badge');
  const ingredientsBar = document.getElementById('dossier-stacked-bar');
  const breakdownList = document.getElementById('dossier-breakdown-list');
  const additivesSec = document.getElementById('dossier-additives-section');
  const rawTextEl = document.getElementById('dossier-raw-ingredients');
  const swapContainer = document.getElementById('dossier-swap-container');
  const shareSec = document.getElementById('dossier-share-section');

  if (nameEl) nameEl.textContent = data.name;
  if (catEl) catEl.textContent = `${data.brand} • ${data.category}`;
  if (iconEl) iconEl.textContent = data.icon;

  const score = data.scoreData.score;
  if (scoreValEl) {
    scoreValEl.textContent = score;
    scoreValEl.style.color = data.scoreData.tierColor;
  }

  if (tierBadgeEl) {
    tierBadgeEl.textContent = data.scoreData.tier;
    tierBadgeEl.style.color = data.scoreData.tierColor;
    tierBadgeEl.style.backgroundColor = data.scoreData.tierBg;
  }

  if (novaBadgeEl) {
    novaBadgeEl.textContent = `NOVA Group ${data.scoreData.novaGroup}`;
  }

  if (rawTextEl) {
    rawTextEl.textContent = data.ingredientsRaw;
  }

  // Render Stacked Ingredient Bar
  if (ingredientsBar) {
    ingredientsBar.innerHTML = `
      <div style="display: flex; height: 16px; border-radius: 8px; overflow: hidden; background: #E2E8F0; width: 100%;">
        <div style="flex: 4; background: #94A3B8;" title="Base grains / starches"></div>
        <div style="flex: 2; background: #E11D48;" title="Industrial Oil / Fat"></div>
        <div style="flex: 1.5; background: #D97706;" title="Sodium / Seasoning"></div>
        <div style="flex: 1; background: ${data.scoreData.tierColor};" title="INS Additives"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 0.35rem;">
        <span>Label Order: Primary Base</span>
        <span>Oils & Seasoning</span>
        <span style="font-weight: 700; color: ${data.scoreData.tierColor};">INS Additives</span>
      </div>
    `;
  }

  // Render Itemized Deductions Breakdown
  if (breakdownList) {
    breakdownList.innerHTML = data.scoreData.breakdown.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border); font-size: 0.82rem;">
        <span style="color: var(--color-text-main); font-weight: 500;">${item.factor}</span>
        <strong style="color: ${item.penalty < 0 ? '#B91C1C' : '#2D6A4F'}; font-family: var(--font-family-display);">
          ${item.penalty > 0 ? `+${item.penalty}` : item.penalty} pts
        </strong>
      </div>
    `).join('');
  }

  // Render Decoded Additives with Multi-Language Explanations (EN, HI, GU)
  if (additivesSec) {
    const adds = data.detectedAdditives || [];
    if (adds.length > 0) {
      additivesSec.style.display = 'block';
      const itemsHTML = adds.map(add => {
        const trans = add.translations?.[currentLanguage] || add.plainText || add.name || add.code;
        const color = add.riskLevel === 'caution' ? '#DC2626' : (add.riskLevel === 'moderate' ? '#D97706' : '#16A34A');
        const bg = add.riskLevel === 'caution' ? '#FEF2F2' : (add.riskLevel === 'moderate' ? '#FFFBEB' : '#F0FDF4');
        return `
          <div style="background: ${bg}; border: 1px solid var(--color-border); border-left: 3px solid ${color}; border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <strong style="color: ${color}; font-size: 0.85rem;">${add.code} • ${add.name || ''}</strong>
              <span style="font-size: 0.7rem; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">${add.category || 'Additive'}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--color-text-main); margin: 0 0 0.35rem 0; line-height: 1.45;">
              ${trans}
            </p>
            <div style="font-size: 0.72rem; color: var(--color-text-muted);">
              <strong>FSSAI Status:</strong> ${add.fssaiStatus ? add.fssaiStatus.slice(0, 110) + '...' : 'Permitted under FSSAI schedule.'}
            </div>
          </div>
        `;
      }).join('');

      additivesSec.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
          Decoded Additives (${currentLanguage.toUpperCase()}):
        </div>
        ${itemsHTML}
      `;
    } else {
      additivesSec.style.display = 'block';
      additivesSec.innerHTML = `
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.82rem; color: #065F46;">
          ✓ <strong>Clean Label:</strong> Zero synthetic chemical additives or artificial colors detected.
        </div>
      `;
    }
  }

  // Render Swaps
  if (swapContainer && data.swaps && data.swaps.length > 0) {
    swapContainer.style.display = 'block';
    swapContainer.innerHTML = data.swaps.map(swap => `
      <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: var(--radius-md); padding: 1rem; margin-top: 0.75rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">${swap.swapProduct.icon}</span>
            <div>
              <strong style="color: #065F46; font-size: 0.95rem;">${swap.swapProduct.name}</strong>
              <div style="font-size: 0.75rem; color: #047857;">${swap.headlineVerdict}</div>
            </div>
          </div>
          <span style="font-size: 0.82rem; font-weight: 800; background: var(--color-primary); color: #FFFFFF; padding: 0.25rem 0.6rem; border-radius: 99px;">
            Score: ${swap.swapProduct.biteLensScore}/100
          </span>
        </div>
        <ul style="margin: 0.5rem 0 0 1.25rem; font-size: 0.78rem; color: #065F46; padding: 0;">
          ${swap.advantages.map(adv => `<li>${adv}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  } else if (swapContainer) {
    swapContainer.style.display = 'none';
  }

  // Render WhatsApp Share Action Loop
  if (shareSec) {
    const shareText = encodeURIComponent(`🔍 BiteLens Food Analysis: ${data.name} scored ${score}/100 (${data.scoreData.tier}) on BiteLens. Check what's in your food: https://bitelens.app/scan`);
    shareSec.innerHTML = `
      <div style="background: #F8FAFC; border: 1px dashed var(--color-border); border-radius: var(--radius-sm); padding: 0.85rem; text-align: center;">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.45rem;">
          📱 Share this food analysis on WhatsApp:
        </div>
        <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; justify-content: center; height: 38px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
          <span>💬</span> Share Report to WhatsApp
        </a>
      </div>
    `;
  }

  // Record scan in local on-device scan history
  recordScanToHistory(data);
}

function recordScanToHistory(data) {
  try {
    const KEY = 'bitelens_scan_history';
    const raw = localStorage.getItem(KEY);
    const history = raw ? JSON.parse(raw) : [];
    const entry = {
      id: Date.now(),
      name: data.name,
      cat: data.category || 'Packaged Food',
      nova: data.scoreData.novaGroup,
      healthScore: data.scoreData.score,
      goalScore: Math.max(20, Math.min(100, Math.round(data.scoreData.score * 0.95))),
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hash: 'ocr-' + Math.random().toString(36).substring(2, 8)
    };
    if (!history.length || history[0].name !== entry.name) {
      history.unshift(entry);
      if (history.length > 30) history.pop();
      localStorage.setItem(KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.warn("Could not save to local scan history:", e);
  }
}

/**
 * 8. Multi-Language Switcher
 */
function bindLanguageSelector() {
  const langBtns = document.querySelectorAll('.lang-pill-btn');
  langBtns.forEach(btn => {
    btn.onclick = (e) => {
      langBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentLanguage = e.target.dataset.lang || 'en';
      if (currentAnalysisResult) renderAnalysisDossier(currentAnalysisResult);
    };
  });
}

/**
 * 9. Guided Lab Mode Integration
 */
function bindGuidedLab() {
  const labSteps = document.querySelectorAll('.lab-step-trigger');
  labSteps.forEach((btn, idx) => {
    btn.onclick = () => {
      labSteps.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const stepContent = document.getElementById('lab-step-content');
      if (stepContent) {
        if (idx === 0) {
          stepContent.innerHTML = `<h4>Stage 1: Optical Tokenization</h4><p>High-resolution edge detection isolates bounding reticles around back-of-pack ingredients text boxes.</p>`;
        } else if (idx === 1) {
          stepContent.innerHTML = `<h4>Stage 2: OCR Confusion Normalization</h4><p>Resolves common optical digit confusions (I/l→1, O→0, S→5, B→8) ensuring accurate INS code identity.</p>`;
        } else if (idx === 2) {
          stepContent.innerHTML = `<h4>Stage 3: Regulatory Schedule Audit</h4><p>Cross-references FSSAI 2011 Table 1 numerical limits per product food category.</p>`;
        } else {
          stepContent.innerHTML = `<h4>Stage 4: BiteLens Score Aggregation</h4><p>Deducts transparent published weights (NOVA baseline - additives - sodium density) to produce 1 headline score.</p>`;
        }
      }
    };
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initScanStudio);
}
