/* ==========================================================================
   BiteLens Mobile Application Controller (Blinkit-Style UX)
   Manages:
   - Fast grocery catalog with category filtering and real-time search
   - Live hardware camera viewfinder & native BarcodeDetector API
   - Animated laser scan reticle & 1-tap test barcode chips
   - Slide-up Blinkit-style product telemetry bottom sheet
   - NOVA processing classification & FSSAI additive decoding
   - Dynamic Goal Fit alignment and Clean Swaps
   ========================================================================== */

import { INDIAN_PRODUCTS_CATALOG } from './data/indianProductsCatalog.js';

class BiteLensMobileApp {
  constructor() {
    this.catalog = INDIAN_PRODUCTS_CATALOG;
    this.currentCategory = 'all';
    this.activeProduct = null;
    this.stream = null;
    this.facingMode = 'environment';
    this.barcodeDetector = null;
    this.detectionInterval = null;
    this.userGoal = localStorage.getItem('bitelens_user_goal') || 'maintenance';

    this.init();
  }

  async init() {
    this.bindDOM();
    this.renderCatalog(this.catalog);
    this.initBarcodeDetector();
    this.checkURLParams();
  }

  bindDOM() {
    // Search input
    const searchInput = document.getElementById('mobileSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Category pills
    const categoryButtons = document.querySelectorAll('[data-mobile-cat]');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => b.classList.remove('active', 'bg-emerald-700', 'text-white'));
        const target = e.currentTarget;
        target.classList.add('active', 'bg-emerald-700', 'text-white');
        this.filterCategory(target.dataset.mobileCat);
      });
    });

    // Scanner trigger buttons
    const scanTriggers = document.querySelectorAll('[data-action="open-scanner"]');
    scanTriggers.forEach(btn => {
      btn.addEventListener('click', () => this.openScanner());
    });

    // Close scanner
    const closeScannerBtn = document.getElementById('closeScannerBtn');
    if (closeScannerBtn) {
      closeScannerBtn.addEventListener('click', () => this.closeScanner());
    }

    // Camera flip & torch
    const flipCamBtn = document.getElementById('flipCameraBtn');
    if (flipCamBtn) {
      flipCamBtn.addEventListener('click', () => this.flipCamera());
    }

    const torchBtn = document.getElementById('torchToggleBtn');
    if (torchBtn) {
      torchBtn.addEventListener('click', () => this.toggleTorch());
    }

    // Enable live camera button
    const enableCamBtn = document.getElementById('enableWebcamBtn');
    if (enableCamBtn) {
      enableCamBtn.addEventListener('click', () => this.startCameraStream());
    }

    // Bottom sheet close
    const closeSheetBtn = document.getElementById('closeProductSheetBtn');
    if (closeSheetBtn) {
      closeSheetBtn.addEventListener('click', () => this.closeBottomSheet());
    }

    // Backdrop click
    const backdrop = document.getElementById('sheetBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeBottomSheet());
    }

    // File upload fallback
    const fileInput = document.getElementById('barcodeFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  // --- 1. CATALOG RENDERING & FILTERING ---

  renderCatalog(items) {
    const grid = document.getElementById('mobileProductGrid');
    const countLabel = document.getElementById('mobileItemCount');
    if (!grid) return;

    if (countLabel) {
      countLabel.textContent = `Showing ${items.length} verified items`;
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-2 py-12 text-center text-slate-400">
          <div class="text-4xl mb-2">🔍</div>
          <p class="text-xs font-bold text-slate-700">No packaged food items found</p>
          <p class="text-[11px] text-slate-400 mt-1">Try searching by additive code or food category</p>
          <button onclick="window.bitelensApp.filterCategory('all')" class="mt-3 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => `
      <div class="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <!-- Header Badges -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full" style="background-color: ${p.novaBg}; color: ${p.novaColor};">
              NOVA ${p.novaGroup}
            </span>
            <span class="text-[9px] text-slate-400 font-mono tracking-tight">EAN ${p.barcode.slice(-4)}</span>
          </div>

          <!-- Product Graphic -->
          <div class="w-full h-20 bg-slate-50 rounded-xl flex items-center justify-center text-4xl mb-2 select-none border border-slate-100/60">
            ${p.image}
          </div>

          <!-- Title & Specs -->
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${p.brand}</div>
          <h5 class="font-bold text-xs text-slate-900 leading-snug line-clamp-1">${p.name}</h5>
          <div class="text-[11px] text-slate-500 font-medium">${p.size}</div>
          
          <!-- Health Pill -->
          <div class="mt-1.5">
            <span class="text-[10px] font-bold" style="color: ${p.goalColor};">
              Score ${p.healthScore}/100
            </span>
          </div>
        </div>

        <!-- Price & Action Button -->
        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="font-display font-extrabold text-sm text-slate-900">₹${p.price}</span>
          </div>
          <button 
            onclick="window.bitelensApp.triggerScan('${p.barcode}')" 
            class="bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition flex items-center gap-1 shadow-xs"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>Scan</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  filterCategory(category) {
    this.currentCategory = category;
    if (category === 'all') {
      this.renderCatalog(this.catalog);
    } else {
      const filtered = this.catalog.filter(p => p.category === category);
      this.renderCatalog(filtered);
    }
  }

  handleSearch(term) {
    const q = term.toLowerCase().trim();
    if (!q) {
      this.filterCategory(this.currentCategory);
      return;
    }
    const results = this.catalog.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.additives.some(a => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    );
    this.renderCatalog(results);
  }

  // --- 2. BARCODE SCANNER ENGINE ---

  async initBarcodeDetector() {
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('ean_13') || formats.includes('qr_code')) {
          this.barcodeDetector = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'qr_code', 'code_128'] });
        }
      } catch (e) {
        console.warn('Native BarcodeDetector initialization note:', e);
      }
    }
  }

  openScanner() {
    const modal = document.getElementById('mobileScannerModal');
    if (modal) {
      modal.classList.remove('hidden');
      this.startCameraStream();
    }
  }

  closeScanner() {
    const modal = document.getElementById('mobileScannerModal');
    if (modal) {
      modal.classList.add('hidden');
      this.stopCameraStream();
    }
  }

  async startCameraStream() {
    const video = document.getElementById('scannerVideoElement');
    const placeholder = document.getElementById('scannerCameraPlaceholder');
    if (!video) return;

    try {
      this.stopCameraStream();
      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.stream;
      await video.play();
      
      video.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');

      this.startContinuousBarcodeDetection(video);
    } catch (err) {
      console.warn('Camera stream could not start (permission or device limit):', err);
      if (placeholder) {
        placeholder.classList.remove('hidden');
      }
      if (video) {
        video.classList.add('hidden');
      }
    }
  }

  stopCameraStream() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  startContinuousBarcodeDetection(video) {
    if (!this.barcodeDetector) return;

    this.detectionInterval = setInterval(async () => {
      if (video.readyState >= 2) {
        try {
          const barcodes = await this.barcodeDetector.detect(video);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            this.handleBarcodeDetected(rawValue);
          }
        } catch (err) {
          // Frame drop or read failure
        }
      }
    }, 500);
  }

  flipCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.startCameraStream();
  }

  toggleTorch() {
    if (this.stream) {
      const track = this.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        const currentTorch = track.getSettings().torch || false;
        track.applyConstraints({
          advanced: [{ torch: !currentTorch }]
        }).catch(() => {});
      } else {
        alert("Flashlight / Torch hardware control is not supported on this browser or camera.");
      }
    } else {
      alert("Please enable the camera stream first.");
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Simulate scanning uploaded food packaging label
    // Default to Instant Noodles or Makhana
    this.triggerScan('8901030383178');
  }

  handleBarcodeDetected(rawCode) {
    const cleanCode = rawCode.trim();
    this.triggerScan(cleanCode);
  }

  triggerScan(barcode) {
    const product = this.catalog.find(p => p.barcode === barcode);
    if (!product) {
      alert(`Barcode ${barcode} not found in catalog. Try one of the test barcodes (e.g. 8901725134821 or 8901030383178).`);
      return;
    }

    this.activeProduct = product;
    this.closeScanner();
    this.showProductDetails(product);

    // Save to local scan history
    this.saveScanToHistory(product);
  }

  // --- 3. SLIDE-UP PRODUCT DETAILS BOTTOM SHEET ---

  showProductDetails(p) {
    const sheet = document.getElementById('mobileBottomSheet');
    const backdrop = document.getElementById('sheetBackdrop');
    const content = document.getElementById('bottomSheetContent');
    if (!sheet || !content) return;

    content.innerHTML = `
      <!-- Main Identity Card -->
      <div class="flex items-start gap-3.5 pb-2">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-100 flex-shrink-0 select-none">
          ${p.image}
        </div>
        <div class="flex-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${p.brand}</span>
          <h3 class="font-display font-bold text-base text-slate-900 leading-tight">${p.name}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs font-semibold text-slate-500">${p.size}</span>
            <span class="text-slate-300">•</span>
            <span class="text-xs font-mono font-bold text-emerald-800">EAN ${p.barcode}</span>
          </div>
        </div>
      </div>

      <!-- NOVA Processing & Health Score HUD -->
      <div class="grid grid-cols-2 gap-2">
        <!-- NOVA Badge -->
        <div class="p-3 rounded-2xl border" style="background-color: ${p.novaBg}; border-color: ${p.novaColor}30;">
          <span class="text-[10px] font-bold uppercase tracking-wider block" style="color: ${p.novaColor};">NOVA Classification</span>
          <div class="font-display font-extrabold text-lg mt-0.5" style="color: ${p.novaColor};">Tier ${p.novaGroup}</div>
          <div class="text-[11px] font-semibold mt-0.5 leading-snug" style="color: ${p.novaColor};">${p.novaLabel}</div>
        </div>

        <!-- BiteLens Score -->
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">BiteLens Score</span>
          <div class="font-display font-extrabold text-lg text-emerald-700 mt-0.5">${p.healthScore}<span class="text-xs text-slate-400 font-normal">/100</span></div>
          <div class="text-[11px] font-semibold text-emerald-800 mt-0.5 truncate">${p.goalFit}</div>
        </div>
      </div>

      <!-- Plain Summary -->
      <div class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[11px] text-slate-700 leading-relaxed">
        <strong class="text-emerald-900">Food Summary:</strong> ${p.summary}
      </div>

      <!-- Macronutrients Telemetry Table -->
      <div class="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
        <div class="flex items-center justify-between mb-2.5">
          <h5 class="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">Macronutrients (per ${p.servingSize})</h5>
          <span class="text-[10px] text-slate-500 font-medium">FSSAI Reference</span>
        </div>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
            <span class="text-[10px] text-slate-400 font-semibold block">Energy</span>
            <span class="font-bold text-xs text-slate-900">${p.calories}</span>
            <span class="text-[9px] text-slate-400 block">kcal</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
            <span class="text-[10px] text-slate-400 font-semibold block">Protein</span>
            <span class="font-bold text-xs text-emerald-700">${p.protein}g</span>
            <span class="text-[9px] text-slate-400 block">${Math.round(p.protein * 4)} kcal</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
            <span class="text-[10px] text-slate-400 font-semibold block">Sugars</span>
            <span class="font-bold text-xs ${p.sugars > 10 ? 'text-red-600' : 'text-slate-900'}">${p.sugars}g</span>
            <span class="text-[9px] font-bold ${p.sugars > 10 ? 'text-red-500' : 'text-slate-400'} block">${p.sugars > 10 ? '⚠️ High' : 'Safe'}</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
            <span class="text-[10px] text-slate-400 font-semibold block">Sodium</span>
            <span class="font-bold text-xs ${p.sodium > 600 ? 'text-red-600' : 'text-slate-900'}">${p.sodium}mg</span>
            <span class="text-[9px] font-bold ${p.sodium > 600 ? 'text-red-500' : 'text-slate-400'} block">${p.sodium > 600 ? '⚠️ High' : 'Safe'}</span>
          </div>
        </div>
      </div>

      <!-- FSSAI Additives Breakdown -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">FSSAI Chemical Dossier</h5>
          <span class="text-[10px] font-semibold text-emerald-700">${p.additives.length} Detected</span>
        </div>
        <div class="space-y-1.5">
          ${p.additives.map(a => `
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs font-mono text-emerald-800">${a.code}</span>
                <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  a.status === 'Clean' ? 'bg-emerald-100 text-emerald-800' :
                  a.status === 'Watchlist' || a.status === 'Allergen Alert' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                }">${a.status}</span>
              </div>
              <div class="font-semibold text-xs text-slate-800 mt-0.5">${a.name} <span class="text-[10px] text-slate-500 font-normal">(${a.purpose})</span></div>
              <div class="text-[11px] text-slate-500 mt-0.5">${a.note}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Allergens Alert -->
      <div class="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <div>
          <strong>Declared Allergens:</strong> ${p.allergens.join(', ')}
        </div>
      </div>

      <!-- Blinkit 10m Clean Swap Recommendation -->
      ${p.swaps ? `
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5">
          <div class="flex items-center gap-1.5 text-emerald-800 font-bold text-xs font-display mb-1">
            <span>⚡</span>
            <span>Healthier Clean Swap Available</span>
          </div>
          <p class="text-[11px] text-slate-600 mb-2.5">${p.swaps.reason}</p>
          <button onclick="window.bitelensApp.triggerScan('${p.swaps.recommendedBarcode}')" class="w-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-2">
            <span>Inspect ${p.swaps.recommendedName}</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      ` : ''}
    `;

    // Show backdrop & sheet
    if (backdrop) backdrop.classList.remove('hidden');
    sheet.classList.remove('translate-y-full');
    sheet.classList.add('translate-y-0');
  }

  closeBottomSheet() {
    const sheet = document.getElementById('mobileBottomSheet');
    const backdrop = document.getElementById('sheetBackdrop');
    if (sheet) {
      sheet.classList.remove('translate-y-0');
      sheet.classList.add('translate-y-full');
    }
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
  }

  saveScanToHistory(product) {
    try {
      const history = JSON.parse(localStorage.getItem('bitelens_scan_history') || '[]');
      const updated = [
        {
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          novaGroup: product.novaGroup,
          healthScore: product.healthScore,
          timestamp: new Date().toISOString()
        },
        ...history.filter(h => h.barcode !== product.barcode)
      ].slice(0, 10);
      localStorage.setItem('bitelens_scan_history', JSON.stringify(updated));
    } catch (e) {
      // storage unavailable
    }
  }

  logToSnackBudget() {
    if (!this.activeProduct) return;
    const p = this.activeProduct;
    alert(`Logged ${p.name} (${p.calories} kcal, ${p.sodium}mg sodium) to your daily snack budget.`);
    this.closeBottomSheet();
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const scanCode = urlParams.get('scan');
    if (scanCode) {
      setTimeout(() => this.triggerScan(scanCode), 400);
    }
  }
}

// Instantiate globally
document.addEventListener('DOMContentLoaded', () => {
  window.bitelensApp = new BiteLensMobileApp();
});
