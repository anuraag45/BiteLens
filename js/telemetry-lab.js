/* ==========================================================================
   BiteLens Web Application - Interactive Telemetry Walkthrough Laboratory
   Redesigns how-it-works.html into an interactive 4-step pipeline
   ========================================================================== */

import { 
  createIcons, 
  ScanLine, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Activity, 
  Flame, 
  FlaskConical, 
  Database, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Sliders, 
  Cpu, 
  Zap, 
  Check, 
  Eye, 
  Scale, 
  Dumbbell, 
  Heart,
  HelpCircle,
  Search
} from 'lucide';

// 5-Product Telemetry Dataset as defined in Explorer 3 analysis
export const TELEMETRY_DATASET = {
  noodles: {
    id: "noodles",
    name: "Classic Masala Instant Noodles",
    category: "Convenience Packaged Meal",
    icon: "🍜",
    rawOCR: "Wheat Flour (Maida), Palm Oil, Salt, Wheat Gluten, INS 500(i), INS 501(i), INS 412. TASTEMAKER: Hydrolyzed Groundnut Protein, Mixed Spices, INS 621, INS 635, Caramel INS 150d.",
    ocrTokens: [
      { text: "Wheat Flour (Maida)", type: "ingredient", confidence: 0.98 },
      { text: "Palm Oil", type: "warning", confidence: 0.96 },
      { text: "INS 500(i)", type: "ins", confidence: 0.94 },
      { text: "INS 501(i)", type: "ins", confidence: 0.93 },
      { text: "INS 412", type: "ins", confidence: 0.95 },
      { text: "INS 621", type: "ins", confidence: 0.99 },
      { text: "INS 635", type: "ins", confidence: 0.92 },
      { text: "INS 150d", type: "ins", confidence: 0.97 },
      { text: "Sodium: 890mg", type: "macro", confidence: 0.99 }
    ],
    insTranslations: [
      {
        code: "INS 621",
        name: "Monosodium Glutamate (MSG)",
        category: "Flavor Enhancer",
        plainEnglish: "Chemical savory powder that stimulates umami taste buds, making packaged snacks taste addictively savory.",
        origin: "Synthetic / Fermented",
        fssaiNote: "Permitted under label declaration."
      },
      {
        code: "INS 635",
        name: "Disodium 5'-Ribonucleotides",
        category: "Flavor Enhancer",
        plainEnglish: "High-potency flavor multiplier paired with MSG to amplify savory depth up to 4x.",
        origin: "Synthetic",
        fssaiNote: "Permitted additive under strict numerical limit."
      },
      {
        code: "INS 150d",
        name: "Sulfite Ammonia Caramel Color",
        category: "Food Colorant",
        plainEnglish: "Dark brown caramel coloring produced by heating carbohydrates with ammonium and sulfite compounds.",
        origin: "Synthetic Chemical",
        fssaiNote: "Permitted in seasonings, sauces, and colas."
      },
      {
        code: "INS 412",
        name: "Guar Gum",
        category: "Thickener / Stabilizer",
        plainEnglish: "Natural plant extract from guar seeds used to preserve noodle elasticity during boiling.",
        origin: "Natural Plant",
        fssaiNote: "GMP approved natural thickener."
      },
      {
        code: "INS 500(i)",
        name: "Sodium Carbonate",
        category: "Acidity Regulator",
        plainEnglish: "Mineral alkaline salt used to create firm, springy noodle dough texture.",
        origin: "Natural Mineral",
        fssaiNote: "GMP approved standard salt."
      }
    ],
    macrosPerServing: {
      servingSize: "70g pack",
      calories: 315,
      proteinG: 6.5,
      carbsG: 44.0,
      sugarG: 1.2,
      fiberG: 2.0,
      fatG: 12.5,
      satFatG: 6.0,
      sodiumMg: 890
    },
    novaAnalysis: {
      group: 4,
      groupLabel: "NOVA Group 4 — Ultra-Processed Food (UPF)",
      healthScore: 38,
      deductions: [
        { reason: "Deep fried in refined Palm Oil (high saturated fat)", points: -20 },
        { reason: "Contains industrial flavor enhancers (INS 621 MSG, INS 635)", points: -20 },
        { reason: "High Sodium Density (890mg per serving / 44% RDA)", points: -15 },
        { reason: "Synthetic food dye (INS 150d Caramel Class IV)", points: -7 }
      ]
    },
    baseGoalFitScores: {
      muscle: 42,
      weight: 25,
      clean: 15
    },
    tradeOffInsight: "High convenience and low cost, but heavy processing, palm oil, and high sodium make it a poor fit for daily health targets."
  },

  proteinbar: {
    id: "proteinbar",
    name: "High Protein Dark Chocolate Bar",
    category: "Sports Nutrition Snack",
    icon: "🍫",
    rawOCR: "Protein Blend (Whey Protein Isolate, Milk Protein Concentrate), Dark Chocolate Coating (Cocoa Solids, INS 322), Maltitol, Soluble Dietary Fiber, INS 471, INS 955 (Sucralose).",
    ocrTokens: [
      { text: "Whey Protein Isolate", type: "macro", confidence: 0.99 },
      { text: "Milk Protein Concentrate", type: "macro", confidence: 0.98 },
      { text: "INS 322", type: "ins", confidence: 0.97 },
      { text: "INS 471", type: "ins", confidence: 0.95 },
      { text: "INS 955 (Sucralose)", type: "ins", confidence: 0.98 },
      { text: "Maltitol", type: "ingredient", confidence: 0.94 },
      { text: "Protein: 20g", type: "macro", confidence: 0.99 },
      { text: "Fiber: 10g", type: "macro", confidence: 0.98 },
      { text: "Sugar: 1.5g", type: "macro", confidence: 0.98 }
    ],
    insTranslations: [
      {
        code: "INS 322",
        name: "Soy Lecithin",
        category: "Emulsifier",
        plainEnglish: "Natural plant fat derived from soybeans that prevents cocoa butter from separating in chocolate.",
        origin: "Natural Plant",
        fssaiNote: "Widely permitted natural food emulsifier."
      },
      {
        code: "INS 471",
        name: "Mono- and Diglycerides of Fatty Acids",
        category: "Emulsifier / Stabilizer",
        plainEnglish: "Industrial fat compound used to keep high-protein bars soft and chewy over months of shelf life.",
        origin: "Synthetic / Processed Fat",
        fssaiNote: "Permitted additive under GMP."
      },
      {
        code: "INS 955",
        name: "Sucralose",
        category: "Artificial Sweetener",
        plainEnglish: "Zero-calorie intense sweetener 600x sweeter than sugar, keeping calorie count low without real sugar.",
        origin: "Synthetic Chlorinated Carbohydrate",
        fssaiNote: "Permitted in energy-restricted foods with mandatory label declaration."
      }
    ],
    macrosPerServing: {
      servingSize: "60g bar",
      calories: 210,
      proteinG: 20.0,
      carbsG: 22.0,
      sugarG: 1.5,
      fiberG: 10.0,
      fatG: 7.5,
      satFatG: 3.2,
      sodiumMg: 160
    },
    novaAnalysis: {
      group: 4,
      groupLabel: "NOVA Group 4 — Ultra-Processed Food (UPF)",
      healthScore: 68,
      deductions: [
        { reason: "Contains artificial non-nutritive sweetener (INS 955 Sucralose)", points: -15 },
        { reason: "Industrial fat emulsifier for texture stability (INS 471)", points: -10 },
        { reason: "Isolated protein extracts rather than intact whole food", points: -7 }
      ]
    },
    baseGoalFitScores: {
      muscle: 94,
      weight: 86,
      clean: 52
    },
    tradeOffInsight: "Classic Macro vs. Processing Conflict: Outstanding for muscle building (20g protein), but deducted on pure health score due to synthetic emulsifiers and artificial sweeteners."
  },

  makhana: {
    id: "makhana",
    name: "Roasted Masala Makhana (Foxnuts)",
    category: "Traditional Whole Snack",
    icon: "🫘",
    rawOCR: "Foxnuts (Makhana 78%), Cold Pressed Olive Oil (12%), Rock Salt, Cumin Powder, Black Pepper, Turmeric, Dried Mango Powder.",
    ocrTokens: [
      { text: "Foxnuts (Makhana 78%)", type: "ingredient", confidence: 0.99 },
      { text: "Cold Pressed Olive Oil", type: "ingredient", confidence: 0.98 },
      { text: "Rock Salt & Spices", type: "ingredient", confidence: 0.97 },
      { text: "Protein: 5.2g", type: "macro", confidence: 0.96 },
      { text: "Sodium: 240mg", type: "macro", confidence: 0.96 }
    ],
    insTranslations: [], // Zero INS additives
    macrosPerServing: {
      servingSize: "50g pack",
      calories: 190,
      proteinG: 5.2,
      carbsG: 32.0,
      sugarG: 0.5,
      fiberG: 4.5,
      fatG: 4.8,
      satFatG: 0.6,
      sodiumMg: 240
    },
    novaAnalysis: {
      group: 2,
      groupLabel: "NOVA Group 2 — Processed Culinary Ingredients + Whole Food",
      healthScore: 94,
      deductions: [
        { reason: "Minor points for added culinary salt and cold-pressed oil seasoning", points: -6 }
      ]
    },
    baseGoalFitScores: {
      muscle: 70,
      weight: 88,
      clean: 98
    },
    tradeOffInsight: "Clean label winner: Uses traditional roasted foxnuts and natural spices without a single industrial chemical or artificial preservative."
  },

  mangodrink: {
    id: "mangodrink",
    name: "Mango Nectar Fruit Beverage",
    category: "Packaged Sweetened Drink",
    icon: "🥭",
    rawOCR: "Water, Mango Pulp (19%), Sugar, Acidity Regulator (INS 330), Antioxidant (INS 300), Preservative (INS 211), Synthetic Food Color (INS 110).",
    ocrTokens: [
      { text: "Water & Sugar Syrup", type: "warning", confidence: 0.99 },
      { text: "Mango Pulp (19%)", type: "ingredient", confidence: 0.97 },
      { text: "INS 330", type: "ins", confidence: 0.96 },
      { text: "INS 300", type: "ins", confidence: 0.95 },
      { text: "INS 211", type: "ins", confidence: 0.98 },
      { text: "INS 110", type: "ins", confidence: 0.95 },
      { text: "Added Sugar: 28g", type: "warning", confidence: 0.99 }
    ],
    insTranslations: [
      {
        code: "INS 330",
        name: "Citric Acid",
        category: "Acidity Regulator",
        plainEnglish: "Natural organic acid derived from citrus fruit providing a sharp, refreshing sour taste balance.",
        origin: "Natural Organic Acid",
        fssaiNote: "GMP approved standard food acidulant."
      },
      {
        code: "INS 300",
        name: "Ascorbic Acid (Vitamin C)",
        category: "Antioxidant",
        plainEnglish: "Essential vitamin C used to prevent color oxidation and maintain fruit flavor freshness.",
        origin: "Natural Organic Acid",
        fssaiNote: "GMP approved antioxidant."
      },
      {
        code: "INS 211",
        name: "Sodium Benzoate",
        category: "Preservative",
        plainEnglish: "Chemical preservative that halts yeast and mold growth to keep sugary liquids shelf-stable for months.",
        origin: "Synthetic Chemical",
        fssaiNote: "Permitted under maximum limit (120 ppm in beverages)."
      },
      {
        code: "INS 110",
        name: "Sunset Yellow FCF",
        category: "Synthetic Food Colorant",
        plainEnglish: "Petroleum-derived synthetic azo dye added to impart an unnaturally intense bright orange hue.",
        origin: "Synthetic Coal-Tar Dye",
        fssaiNote: "Permitted under strict numerical limit (100 ppm) with mandatory warning label."
      }
    ],
    macrosPerServing: {
      servingSize: "250ml bottle",
      calories: 135,
      proteinG: 0.4,
      carbsG: 33.0,
      sugarG: 28.0,
      fiberG: 0.5,
      fatG: 0.0,
      satFatG: 0.0,
      sodiumMg: 45
    },
    novaAnalysis: {
      group: 4,
      groupLabel: "NOVA Group 4 — Ultra-Processed Drink",
      healthScore: 44,
      deductions: [
        { reason: "High added sugar content (28g per 250ml / 112% daily free sugar target)", points: -25 },
        { reason: "Synthetic azo food dye (INS 110 Sunset Yellow)", points: -18 },
        { reason: "Chemical preservative (INS 211 Sodium Benzoate)", points: -13 }
      ]
    },
    baseGoalFitScores: {
      muscle: 30,
      weight: 18,
      clean: 35
    },
    tradeOffInsight: "Markets natural fruit imagery, but nutritional telemetry reveals 81% of calories come from added refined sugar syrup and petroleum-based dye."
  },

  biscuits: {
    id: "biscuits",
    name: "Multigrain Oats & Seeds Crisp",
    category: "Packaged Baked Snack",
    icon: "🥣",
    rawOCR: "Rolled Oats (45%), Whole Wheat (20%), Pumpkin Seeds (8%), Sunflower Oil, Jaggery, INS 500(ii) (Baking Soda), INS 322 (Sunflower Lecithin), INS 440 (Pectin).",
    ocrTokens: [
      { text: "Rolled Oats (45%)", type: "ingredient", confidence: 0.99 },
      { text: "Whole Wheat (20%)", type: "ingredient", confidence: 0.98 },
      { text: "Pumpkin Seeds (8%)", type: "ingredient", confidence: 0.97 },
      { text: "INS 500(ii)", type: "ins", confidence: 0.96 },
      { text: "INS 322", type: "ins", confidence: 0.97 },
      { text: "INS 440", type: "ins", confidence: 0.95 },
      { text: "Protein: 7.0g", type: "macro", confidence: 0.99 },
      { text: "Fiber: 5.5g", type: "macro", confidence: 0.99 }
    ],
    insTranslations: [
      {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate (Baking Soda)",
        category: "Leavening Agent",
        plainEnglish: "Traditional mineral leavening powder that creates air bubbles in dough for light crunchiness.",
        origin: "Natural Mineral",
        fssaiNote: "GMP approved standard baking agent."
      },
      {
        code: "INS 322",
        name: "Sunflower Lecithin",
        category: "Emulsifier",
        plainEnglish: "Natural sunflower seed extract that blends oil and oats evenly for consistent texture.",
        origin: "Natural Plant",
        fssaiNote: "GMP approved natural emulsifier."
      },
      {
        code: "INS 440",
        name: "Pectin",
        category: "Gelling Agent / Fiber",
        plainEnglish: "Natural plant fiber extracted from apple & citrus peels that enhances crispiness.",
        origin: "Natural Fruit Extract",
        fssaiNote: "GMP approved natural thickener."
      }
    ],
    macrosPerServing: {
      servingSize: "50g serving",
      calories: 205,
      proteinG: 7.0,
      carbsG: 31.0,
      sugarG: 6.0,
      fiberG: 5.5,
      fatG: 6.5,
      satFatG: 1.1,
      sodiumMg: 110
    },
    novaAnalysis: {
      group: 3,
      groupLabel: "NOVA Group 3 — Processed Food",
      healthScore: 78,
      deductions: [
        { reason: "Contains unrefined jaggery sweetener and sunflower oil", points: -12 },
        { reason: "Commercial high-heat baking process", points: -10 }
      ]
    },
    baseGoalFitScores: {
      muscle: 75,
      weight: 82,
      clean: 85
    },
    tradeOffInsight: "Balanced healthy option: Combines high fiber whole grains with low-risk natural plant additives."
  }
};

// Lab Interactive State
class TelemetryLabState {
  constructor() {
    this.selectedProductId = 'noodles';
    this.activeStepIndex = 0; // 0: Scan, 1: Translate, 2: NOVA, 3: Goal Fit
    this.userGoal = 'muscle'; // 'muscle', 'weight', 'clean'
    this.proteinPriority = 3; // 1..5
    this.upfTolerance = 3; // 1..5
    this.comparisonViewMode = 'split'; // 'split', 'after', 'before'
    this.isScanning = false;
  }

  getProduct() {
    return TELEMETRY_DATASET[this.selectedProductId] || TELEMETRY_DATASET.noodles;
  }
}

const state = new TelemetryLabState();

// Initialize the Telemetry Walkthrough Laboratory
export function initTelemetryLab() {
  if (typeof document === 'undefined') return;
  const mountPoint = document.getElementById('telemetry-lab-app');
  if (!mountPoint) return;

  renderLabLayout(mountPoint);
}

function refreshIcons() {
  try {
    createIcons({
      icons: {
        ScanLine,
        Sparkles,
        ShieldCheck,
        Target,
        Activity,
        Flame,
        FlaskConical,
        Database,
        ChevronRight,
        ChevronLeft,
        CheckCircle2,
        AlertTriangle,
        ShieldAlert,
        Info,
        Sliders,
        Cpu,
        Zap,
        Check,
        Eye,
        Scale,
        Dumbbell,
        Heart,
        HelpCircle,
        Search
      }
    });
  } catch (err) {
    console.warn("Lucide icons refresh notice:", err);
  }
}

// Master Render Function
function renderLabLayout(container) {
  const product = state.getProduct();

  container.innerHTML = `
    <!-- Top Status Bar & Header -->
    <div class="hud-status-bar">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div class="hud-pulse-dot"></div>
        <div>
          <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.95rem; color: var(--color-text-main);">
            TELEMETRY WALKTHROUGH LABORATORY
          </div>
          <div style="font-size: 0.78rem; color: var(--color-text-muted);">
            Interactive 4-Step Packaging Inspection Engine
          </div>
        </div>
      </div>
      <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; background: rgba(59, 122, 87, 0.1); border-radius: var(--radius-pill); border: 1px solid rgba(59, 122, 87, 0.25); font-size: 0.75rem; color: var(--color-primary); font-weight: 700;">
        <i data-lucide="cpu" style="width: 0.85rem; height: 0.85rem;"></i> Live Sample: ${product.name}
      </div>
    </div>

    <!-- Product Preset Selector Buttons -->
    <div style="margin-bottom: 1.25rem;">
      <div style="font-size: 0.75rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
        Select Sample Product Profile:
      </div>
      <div class="product-presets-bar">
        ${Object.values(TELEMETRY_DATASET).map(p => `
          <button class="preset-chip-btn ${p.id === state.selectedProductId ? 'active' : ''}" data-product-id="${p.id}">
            <span>${p.icon}</span>
            <span>${p.name}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Stepper Navigation Header Tabs (4 Steps) -->
    <div class="telemetry-stepper-header">
      <button class="telemetry-step-btn ${state.activeStepIndex === 0 ? 'active' : (state.activeStepIndex > 0 ? 'completed' : '')}" data-step="0">
        <div class="step-btn-badge">${state.activeStepIndex > 0 ? '✓' : '1'}</div>
        <div>
          <div>1. Optical Scan</div>
          <div style="font-size: 0.72rem; font-weight: 500; opacity: 0.8;">OCR Extraction</div>
        </div>
      </button>

      <button class="telemetry-step-btn ${state.activeStepIndex === 1 ? 'active' : (state.activeStepIndex > 1 ? 'completed' : '')}" data-step="1">
        <div class="step-btn-badge">${state.activeStepIndex > 1 ? '✓' : '2'}</div>
        <div>
          <div>2. INS Translation</div>
          <div style="font-size: 0.72rem; font-weight: 500; opacity: 0.8;">Plain English</div>
        </div>
      </button>

      <button class="telemetry-step-btn ${state.activeStepIndex === 2 ? 'active' : (state.activeStepIndex > 2 ? 'completed' : '')}" data-step="2">
        <div class="step-btn-badge">${state.activeStepIndex > 2 ? '✓' : '3'}</div>
        <div>
          <div>3. NOVA Engine</div>
          <div style="font-size: 0.72rem; font-weight: 500; opacity: 0.8;">Processing Score</div>
        </div>
      </button>

      <button class="telemetry-step-btn ${state.activeStepIndex === 3 ? 'active' : ''}" data-step="3">
        <div class="step-btn-badge">4</div>
        <div>
          <div>4. Goal Fit</div>
          <div style="font-size: 0.72rem; font-weight: 500; opacity: 0.8;">Trade-off Simulator</div>
        </div>
      </button>
    </div>

    <!-- Active Step Content Viewport -->
    <div id="step-viewport" style="min-height: 380px;">
      ${renderStepView(state.activeStepIndex, product)}
    </div>

    <!-- Footer Controls (Previous / Next / Indicator) -->
    <div class="telemetry-footer-controls">
      <button class="btn btn-outline" id="prev-step-btn" ${state.activeStepIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        <i data-lucide="chevron-left"></i> Previous Step
      </button>

      <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-muted);">
        Step <span style="color: var(--color-primary);">${state.activeStepIndex + 1}</span> of 4
      </div>

      <button class="btn btn-primary" id="next-step-btn" ${state.activeStepIndex === 3 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        Next Step <i data-lucide="chevron-right"></i>
      </button>
    </div>
  `;

  bindGlobalEvents(container);
  bindStepEvents(container);
  refreshIcons();
}

// Render active step HTML based on state
function renderStepView(stepIndex, product) {
  switch (stepIndex) {
    case 0:
      return renderStep1OpticalScan(product);
    case 1:
      return renderStep2INSTranslator(product);
    case 2:
      return renderStep3NOVAEngine(product);
    case 3:
      return renderStep4GoalFitSimulator(product);
    default:
      return renderStep1OpticalScan(product);
  }
}

/* ==========================================================================
   STEP 1: Optical Scan & Label Extraction
   ========================================================================== */
function renderStep1OpticalScan(product) {
  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;" class="grid-2">
      <!-- Camera HUD Simulation -->
      <div class="hud-viewfinder">
        <div class="cyber-scan-beam ${state.isScanning ? 'scanning' : ''}" id="scan-beam-overlay"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="scan-line" style="color: #38BDF8;"></i>
            <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 0.9rem; color: #F8FAFC;">OPTICAL HUD VIEWFINDER</span>
          </div>
          <span style="font-size: 0.75rem; color: #94A3B8; font-family: monospace;">FSSAI-OCR v2.4</span>
        </div>

        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 3.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3));">${product.icon}</div>
          <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 1.15rem; color: #FFFFFF;">${product.name}</div>
          <div style="font-size: 0.8rem; color: #94A3B8;">${product.category}</div>
        </div>

        <div style="margin-top: 1rem; text-align: center;">
          <button class="btn btn-primary" id="trigger-scan-btn" style="width: 100%; justify-content: center; background: var(--color-secondary); border-color: var(--color-secondary);">
            <i data-lucide="zap"></i> ${state.isScanning ? 'Scanning Label...' : 'Re-Run Optical Scan Simulation'}
          </button>
        </div>
      </div>

      <!-- Raw OCR Text & Token Extraction Stream -->
      <div>
        <div class="card" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h4 style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="database" style="color: var(--color-primary);"></i> Tokenized OCR Text Stream
              </h4>
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); background: rgba(59, 122, 87, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">
                ${product.ocrTokens.length} Tokens Parsed
              </span>
            </div>

            <div style="background: #FAF8F5; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.85rem; font-family: monospace; font-size: 0.82rem; color: var(--color-text-main); margin-bottom: 1rem; line-height: 1.5;">
              <div style="font-weight: 700; color: var(--color-text-muted); font-size: 0.72rem; text-transform: uppercase; margin-bottom: 0.25rem;">Raw Back-of-Pack Label OCR:</div>
              "${product.rawOCR}"
            </div>

            <div style="font-size: 0.8rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-main); margin-bottom: 0.5rem;">
              Extracted & Categorized Token Pills:
            </div>
            
            <div class="ocr-token-grid">
              ${product.ocrTokens.map(tok => {
                let pillClass = 'token-pill-ingredient';
                let iconName = 'check';
                if (tok.type === 'ins') { pillClass = 'token-pill-ins'; iconName = 'flask-conical'; }
                else if (tok.type === 'macro') { pillClass = 'token-pill-macro'; iconName = 'activity'; }
                else if (tok.type === 'warning') { pillClass = 'token-pill-warning'; iconName = 'alert-triangle'; }
                return `
                  <span class="token-pill ${pillClass}">
                    <i data-lucide="${iconName}" style="width: 0.75rem; height: 0.75rem;"></i>
                    ${tok.text}
                  </span>
                `;
              }).join('')}
            </div>
          </div>

          <div style="margin-top: 1.25rem; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; color: var(--color-text-main); display: flex; gap: 0.5rem; align-items: flex-start;">
            <i data-lucide="info" style="color: var(--color-secondary); width: 1.1rem; height: 1.1rem; flex-shrink: 0; margin-top: 0.1rem;"></i>
            <div>
              <strong>Step 1 Logic:</strong> BiteLens isolates cramped ingredient strings, recognizing standardized FSSAI numerical codes and nutritional targets in under 800 milliseconds.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   STEP 2: Plain-English INS Additive Translation
   ========================================================================== */
function renderStep2INSTranslator(product) {
  const hasAdditives = product.insTranslations && product.insTranslations.length > 0;

  return `
    <div>
      <!-- View Control Mode Toggles -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem;">Demystifying Cryptic FSSAI INS Additives</h3>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
            Compare raw regulatory numbers against BiteLens's plain consumer English translations.
          </p>
        </div>

        <div style="display: flex; gap: 0.4rem; background: #FAF8F5; padding: 0.3rem; border-radius: var(--radius-pill); border: 1px solid var(--color-border);">
          <button class="goal-btn ${state.comparisonViewMode === 'split' ? 'active' : ''}" id="mode-split-btn">
            ⚡ Side-by-Side Split
          </button>
          <button class="goal-btn ${state.comparisonViewMode === 'after' ? 'active' : ''}" id="mode-after-btn">
            🌿 Plain English
          </button>
          <button class="goal-btn ${state.comparisonViewMode === 'before' ? 'active' : ''}" id="mode-before-btn">
            📜 Raw Jargon
          </button>
        </div>
      </div>

      ${!hasAdditives ? `
        <div class="card" style="text-align: center; padding: 3rem 1.5rem; border-left: 4px solid var(--color-primary);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌿</div>
          <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">Clean Label Confirmed — Zero Synthetic INS Additives</h3>
          <p style="max-width: 600px; margin: 0 auto; color: var(--color-text-muted);">
            This product (${product.name}) uses 100% whole natural ingredients with traditional seasonings (rock salt, spices, cold-pressed oil). No industrial chemical emulsifiers, artificial colors, or flavor enhancers were detected!
          </p>
        </div>
      ` : `
        <div class="comparison-card-grid">
          
          <!-- Before Column: Raw Jargon -->
          ${(state.comparisonViewMode === 'split' || state.comparisonViewMode === 'before') ? `
            <div class="comparison-column comparison-column-raw">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem;">
                <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.9rem; color: #64748B;">
                  🔴 BEFORE: Cryptic Industry Packaging Jargon
                </div>
                <span class="hud-code-tag" style="background: #E2E8F0; color: #475569; border-color: #CBD5E1;">FSSAI Raw</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${product.insTranslations.map(ins => `
                  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--radius-sm); padding: 0.85rem;">
                    <div style="font-family: monospace; font-weight: 800; font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 0.25rem;">
                      ${ins.code}
                    </div>
                    <div style="font-size: 0.82rem; color: #64748B; font-weight: 600;">
                      Technical Title: ${ins.name}
                    </div>
                    <div style="font-size: 0.78rem; color: #94A3B8; margin-top: 0.35rem;">
                      Category: ${ins.category} (${ins.origin})
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- After Column: BiteLens Plain English Translation -->
          ${(state.comparisonViewMode === 'split' || state.comparisonViewMode === 'after') ? `
            <div class="comparison-column comparison-column-decoded" style="${state.comparisonViewMode === 'after' ? 'grid-column: span 2;' : ''}">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(59, 122, 87, 0.2); padding-bottom: 0.5rem;">
                <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.9rem; color: var(--color-primary);">
                  🟢 AFTER: BiteLens Plain-English Consumer Translation
                </div>
                <span class="hud-code-tag">Decoded</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${product.insTranslations.map(ins => `
                  <div style="background: #FFFFFF; border: 1.5px solid rgba(59, 122, 87, 0.25); border-radius: var(--radius-sm); padding: 1rem; box-shadow: var(--shadow-sm); border-left: 4px solid var(--color-primary);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.4rem;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="hud-code-tag">${ins.code}</span>
                        <strong style="font-size: 0.92rem; color: var(--color-text-main);">${ins.name}</strong>
                      </div>
                      <span style="font-size: 0.75rem; font-weight: 700; background: rgba(2, 132, 199, 0.1); color: var(--color-secondary); padding: 0.2rem 0.65rem; border-radius: var(--radius-pill);">
                        Tag: ${ins.category}
                      </span>
                    </div>

                    <p style="font-size: 0.85rem; color: var(--color-text-main); margin-bottom: 0.5rem; line-height: 1.5; font-weight: 500;">
                      👉 "${ins.plainEnglish}"
                    </p>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--color-text-muted); border-top: 1px dashed var(--color-border); padding-top: 0.4rem; margin-top: 0.4rem;">
                      <span>Origin: <strong>${ins.origin}</strong></span>
                      <span>FSSAI Status: <em>${ins.fssaiNote}</em></span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      `}
    </div>
  `;
}

/* ==========================================================================
   STEP 3: NOVA Health & Processing Score Engine
   ========================================================================== */
function renderStep3NOVAEngine(product) {
  const nova = product.novaAnalysis;

  return `
    <div>
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem;">NOVA Health & Processing Score Engine</h3>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Evaluates industrial processing levels (Groups 1-4) and applies mathematical deduction penalties.
        </p>
      </div>

      <!-- 4-Tier NOVA Group Gauge Header -->
      <div class="nova-gauge-grid">
        
        <!-- Group 1 -->
        <div class="nova-tier-card group-1 ${nova.group === 1 ? 'active' : ''}">
          <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: #2D6A4F;">GROUP 1</div>
          <div style="font-weight: 700; font-size: 0.85rem; margin: 0.25rem 0;">Unprocessed</div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">Whole grains, fresh fruit</div>
          ${nova.group === 1 ? '<div style="margin-top: 0.4rem; font-size: 0.7rem; font-weight: 800; color: #2D6A4F;">★ ACTIVE TIER</div>' : ''}
        </div>

        <!-- Group 2 -->
        <div class="nova-tier-card group-2 ${nova.group === 2 ? 'active' : ''}">
          <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: #D97706;">GROUP 2</div>
          <div style="font-weight: 700; font-size: 0.85rem; margin: 0.25rem 0;">Culinary Prep</div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">Oils, butter, rock salt</div>
          ${nova.group === 2 ? '<div style="margin-top: 0.4rem; font-size: 0.7rem; font-weight: 800; color: #D97706;">★ ACTIVE TIER</div>' : ''}
        </div>

        <!-- Group 3 -->
        <div class="nova-tier-card group-3 ${nova.group === 3 ? 'active' : ''}">
          <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: #EA580C;">GROUP 3</div>
          <div style="font-weight: 700; font-size: 0.85rem; margin: 0.25rem 0;">Processed</div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">Baked goods, cheeses</div>
          ${nova.group === 3 ? '<div style="margin-top: 0.4rem; font-size: 0.7rem; font-weight: 800; color: #EA580C;">★ ACTIVE TIER</div>' : ''}
        </div>

        <!-- Group 4 -->
        <div class="nova-tier-card group-4 ${nova.group === 4 ? 'active' : ''}">
          <div style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: #E11D48;">GROUP 4</div>
          <div style="font-weight: 700; font-size: 0.85rem; margin: 0.25rem 0;">Ultra-Processed</div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">UPF formulation</div>
          ${nova.group === 4 ? '<div style="margin-top: 0.4rem; font-size: 0.7rem; font-weight: 800; color: #E11D48;">★ ACTIVE TIER</div>' : ''}
        </div>

      </div>

      <!-- Mathematical Score Calculation Breakdown Card -->
      <div class="card" style="border-left: 5px solid ${nova.group === 4 ? 'var(--color-accent)' : (nova.group === 3 ? '#EA580C' : 'var(--color-primary)')};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 1.1rem; color: var(--color-text-main);">
              Mathematical Health Score Breakdown
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Classification: <strong>${nova.groupLabel}</strong>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.72rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-muted); text-transform: uppercase;">Calculated Score</div>
            <div style="font-family: var(--font-family-display); font-size: 2.2rem; font-weight: 800; color: ${nova.healthScore >= 75 ? 'var(--color-primary)' : (nova.healthScore >= 50 ? 'var(--color-warning)' : 'var(--color-accent)')}; leading: 1;">
              ${nova.healthScore} <span style="font-size: 1rem; color: var(--color-text-muted); font-weight: 600;">/ 100</span>
            </div>
          </div>
        </div>

        <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-main); margin-bottom: 0.5rem;">
          Deduction Step Log (Starting Base Score = 100):
        </div>

        <div class="deduction-list">
          <div class="deduction-item" style="background: #F0FDF4; border-color: rgba(59, 122, 87, 0.2);">
            <span><strong>Base Health Purity Baseline</strong></span>
            <span style="font-weight: 800; color: var(--color-primary); font-family: var(--font-family-display);">+100 pts</span>
          </div>

          ${nova.deductions.map(ded => `
            <div class="deduction-item">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="shield-alert" style="color: var(--color-accent); width: 1rem; height: 1rem;"></i>
                <span>${ded.reason}</span>
              </div>
              <span class="deduction-chip">${ded.points} pts</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--color-text-muted); background: #FAF8F5; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
          <strong>Scientific Principle:</strong> Pure nutrient counts alone do not reflect body impact. Industrial cosmetic additives (flavor enhancers, synthetic colorants, non-nutritive sweeteners) trigger linear deductions to assess real processing level.
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   STEP 4: Personal Goal Fit Alignment Simulator
   ========================================================================== */
function renderStep4GoalFitSimulator(product) {
  // Calculate dynamic Goal Fit Score based on sliders and goal selection
  const dynamicGoalFit = calculateDynamicGoalFit(product, state.userGoal, state.proteinPriority, state.upfTolerance);
  const healthScore = product.novaAnalysis.healthScore;

  return `
    <div>
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem;">Personal Goal Fit Alignment Simulator</h3>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Simulate how macronutrient alignment and processing tolerance intersect for your health goals.
        </p>
      </div>

      <!-- Goal Selector Pills -->
      <div style="margin-bottom: 1rem;">
        <div style="font-size: 0.75rem; font-weight: 700; font-family: var(--font-family-display); color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
          Select Your Active Personal Health Goal:
        </div>
        <div class="goal-selector-group">
          <button class="goal-btn ${state.userGoal === 'muscle' ? 'active' : ''}" id="goal-muscle-btn">
            💪 Muscle Building
          </button>
          <button class="goal-btn ${state.userGoal === 'weight' ? 'active' : ''}" id="goal-weight-btn">
            ⚖️ Calorie Deficit
          </button>
          <button class="goal-btn ${state.userGoal === 'clean' ? 'active' : ''}" id="goal-clean-btn">
            🌿 Clean Whole Food
          </button>
        </div>
      </div>

      <!-- Dual Score Telemetry Meters (Health vs Goal Fit) -->
      <div class="dual-meters-grid">
        
        <!-- Health Score Meter -->
        <div class="meter-box meter-box-health">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-primary); text-transform: uppercase;">
              1. Health Score (Processing Purity)
            </span>
            <span style="font-family: var(--font-family-display); font-weight: 800; font-size: 1.2rem; color: var(--color-primary);">
              ${healthScore}/100
            </span>
          </div>

          <div class="score-progress-bar">
            <div class="score-progress-fill" style="width: ${healthScore}%; background-color: ${healthScore >= 75 ? 'var(--color-primary)' : (healthScore >= 50 ? 'var(--color-warning)' : 'var(--color-accent)')};"></div>
          </div>

          <div style="font-size: 0.75rem; color: var(--color-text-muted);">
            NOVA Rating: <strong>Group ${product.novaAnalysis.group}</strong> (${healthScore >= 70 ? 'Minimal Processing' : 'Ultra-Processed UPF'})
          </div>
        </div>

        <!-- Goal Fit Score Meter -->
        <div class="meter-box meter-box-goal">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-family-display); color: var(--color-secondary); text-transform: uppercase;">
              2. Goal Fit Score (${state.userGoal.toUpperCase()})
            </span>
            <span id="goal-fit-score-val" style="font-family: var(--font-family-display); font-weight: 800; font-size: 1.2rem; color: var(--color-secondary);">
              ${dynamicGoalFit}/100
            </span>
          </div>

          <div class="score-progress-bar">
            <div id="goal-fit-progress-fill" class="score-progress-fill" style="width: ${dynamicGoalFit}%; background-color: var(--color-secondary);"></div>
          </div>

          <div style="font-size: 0.75rem; color: var(--color-text-muted);">
            Macro Fit Verdict: <span id="goal-fit-verdict-val"><strong>${getGoalVerdictText(dynamicGoalFit)}</strong></span>
          </div>
        </div>

      </div>

      <!-- Interactive Trade-off Controls & Sliders -->
      <div class="tradeoff-controls-card">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <i data-lucide="sliders" style="color: var(--color-secondary);"></i>
          <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 0.95rem; color: var(--color-text-main);">
            Interactive Trade-off Preference Sliders
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;" class="grid-2">
          
          <!-- Slider 1: Protein Priority -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
              <span>Protein Target Weight:</span>
              <span id="protein-priority-val" style="color: var(--color-secondary); font-family: var(--font-family-display);">Level ${state.proteinPriority} / 5</span>
            </div>
            <input type="range" min="1" max="5" value="${state.proteinPriority}" class="slider-input" id="protein-priority-slider">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 0.2rem;">
              Higher weight prioritizes total protein grams per serving.
            </div>
          </div>

          <!-- Slider 2: UPF Tolerance -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
              <span>UPF Additive Strictness:</span>
              <span id="upf-tolerance-val" style="color: var(--color-secondary); font-family: var(--font-family-display);">Level ${state.upfTolerance} / 5</span>
            </div>
            <input type="range" min="1" max="5" value="${state.upfTolerance}" class="slider-input" id="upf-tolerance-slider">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 0.2rem;">
              Higher strictness penalizes synthetic emulsifiers and sweeteners heavily.
            </div>
          </div>

        </div>
      </div>

      <!-- Dynamic Trade-off Insight Card -->
      <div class="card" style="background: rgba(2, 132, 199, 0.05); border: 1.5px solid rgba(2, 132, 199, 0.25);">
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <i data-lucide="target" style="color: var(--color-secondary); width: 1.4rem; height: 1.4rem; flex-shrink: 0; margin-top: 0.15rem;"></i>
          <div>
            <div style="font-family: var(--font-family-display); font-weight: 800; font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 0.25rem;">
              Live Dual-Scoring Trade-Off Analysis:
            </div>
            <p id="tradeoff-insight-text" style="font-size: 0.88rem; color: var(--color-text-main); line-height: 1.5; margin: 0;">
              ${getTradeOffText(product, state.userGoal, dynamicGoalFit, healthScore)}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Pure math dynamic Goal Fit calculator
export function calculateDynamicGoalFit(product, goal, proteinPriority, upfTolerance) {
  const safeGoal = goal || 'muscle';
  const pPriority = Number.isFinite(Number(proteinPriority)) ? Number(proteinPriority) : 3;
  const upfStrictness = Number.isFinite(Number(upfTolerance)) ? Number(upfTolerance) : 3;

  const baseScore = (product && product.baseGoalFitScores && product.baseGoalFitScores[safeGoal] !== undefined)
    ? product.baseGoalFitScores[safeGoal]
    : 50;
  
  const proteinG = Math.max(0, (product && product.macrosPerServing && product.macrosPerServing.proteinG) || 0);
  const fiberG = Math.max(0, (product && product.macrosPerServing && product.macrosPerServing.fiberG) || 0);
  const sugarG = Math.max(0, (product && product.macrosPerServing && product.macrosPerServing.sugarG) || 0);
  const healthScore = Math.max(0, Math.min(100, (product && product.novaAnalysis && product.novaAnalysis.healthScore) ?? 50));
  const processingDeficit = 100 - healthScore;

  const pScale = pPriority / 3; // Positive scaling factor: 1/3 (0.33) to 5/3 (1.67)
  let modifier = 0;
  
  if (safeGoal === 'muscle') {
    const proteinBonus = (proteinG - 10) * pScale * 1.5;
    const upfPenalty = (upfStrictness / 3) * processingDeficit * 0.15;
    modifier = proteinBonus - upfPenalty;
  } else if (safeGoal === 'weight') {
    const proteinBonus = (proteinG - 10) * pScale * 0.5;
    const fiberBonus = (fiberG - 3) * 2;
    const sugarPenalty = (sugarG - 5) * 1.5;
    const upfPenalty = (upfStrictness / 3) * processingDeficit * 0.2;
    modifier = proteinBonus + fiberBonus - sugarPenalty - upfPenalty;
  } else if (safeGoal === 'clean') {
    const proteinBonus = (proteinG - 10) * pScale * 0.2;
    const upfPenalty = (upfStrictness / 3) * processingDeficit * 0.25;
    modifier = proteinBonus - upfPenalty;
  }

  const finalScore = Math.round(baseScore + modifier);
  return Math.max(10, Math.min(100, finalScore));
}

function getGoalVerdictText(score) {
  if (score >= 85) return "Excellent Goal Alignment";
  if (score >= 70) return "Good Goal Fit";
  if (score >= 50) return "Moderate Fit with Trade-offs";
  return "Poor Goal Fit";
}

function getTradeOffText(product, goal, goalFitScore, healthScore) {
  if (product.id === 'proteinbar') {
    return `<strong>Protein vs Processing Trade-off:</strong> High Protein Bar delivers ${product.macrosPerServing.proteinG}g bioavailable protein (${goalFitScore}% Goal Fit for ${goal}), but receives a Health Score of ${healthScore}/100 due to synthetic emulsifiers (INS 471) and artificial sweeteners (INS 955). Excellent for hitting macro targets, but less ideal for strict clean-eating diets.`;
  }
  if (product.id === 'makhana') {
    return `<strong>Clean Label Synergy:</strong> Roasted Makhana achieves a Health Score of ${healthScore}/100 and ${goalFitScore}% Goal Fit for ${goal}. Zero synthetic INS additives combined with whole foxnuts makes this snack ideal across all goals.`;
  }
  if (product.id === 'noodles') {
    return `<strong>High Processing & Sodium Conflict:</strong> Instant Noodles provide quick calories but score low on Health (${healthScore}/100) and Goal Fit (${goalFitScore}% for ${goal}) due to MSG (INS 621), deep palm-oil frying, and 890mg sodium per serving.`;
  }
  if (product.id === 'mangodrink') {
    return `<strong>Liquid Sugar Spike Alert:</strong> Mango Nectar delivers 28g added sugar with synthetic dye INS 110, resulting in a low Health Score (${healthScore}/100) and poor Goal Fit (${goalFitScore}% for ${goal}).`;
  }
  return `<strong>Balanced Whole Grain Profile:</strong> Multigrain Oat Crisp offers 5.5g dietary fiber with clean plant emulsifiers (INS 322, 440), providing a strong Health Score (${healthScore}/100) and solid Goal Fit (${goalFitScore}% for ${goal}).`;
}

// Bind Global UI Click & Input Handlers
function bindGlobalEvents(container) {
  // Product Preset Buttons
  container.querySelectorAll('.preset-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedProductId = btn.dataset.productId;
      state.isScanning = false;
      renderLabLayout(container);
    });
  });

  // Stepper Header Buttons (1-4)
  container.querySelectorAll('.telemetry-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeStepIndex = parseInt(btn.dataset.step, 10);
      renderLabLayout(container);
    });
  });
}

// Bind Active Step View Events
function bindStepEvents(container) {
  // Navigation Footer Buttons
  const prevBtn = container.querySelector('#prev-step-btn');
  const nextBtn = container.querySelector('#next-step-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.activeStepIndex > 0) {
        state.activeStepIndex--;
        renderLabLayout(container);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.activeStepIndex < 3) {
        state.activeStepIndex++;
        renderLabLayout(container);
      }
    });
  }

  // Step 1: Scan Simulation Button
  const triggerScanBtn = container.querySelector('#trigger-scan-btn');
  if (triggerScanBtn) {
    triggerScanBtn.addEventListener('click', () => {
      state.isScanning = true;
      const overlay = container.querySelector('#scan-beam-overlay');
      if (overlay) overlay.classList.add('scanning');
      triggerScanBtn.textContent = 'Scanning Label...';
      
      setTimeout(() => {
        state.isScanning = false;
        renderLabLayout(container);
      }, 1200);
    });
  }

  // Step 2: Comparison Mode Buttons
  const splitBtn = container.querySelector('#mode-split-btn');
  const afterBtn = container.querySelector('#mode-after-btn');
  const beforeBtn = container.querySelector('#mode-before-btn');

  if (splitBtn) {
    splitBtn.addEventListener('click', () => {
      state.comparisonViewMode = 'split';
      renderLabLayout(container);
    });
  }
  if (afterBtn) {
    afterBtn.addEventListener('click', () => {
      state.comparisonViewMode = 'after';
      renderLabLayout(container);
    });
  }
  if (beforeBtn) {
    beforeBtn.addEventListener('click', () => {
      state.comparisonViewMode = 'before';
      renderLabLayout(container);
    });
  }

  // Step 4: Goal Selector Buttons
  const goalMuscleBtn = container.querySelector('#goal-muscle-btn');
  const goalWeightBtn = container.querySelector('#goal-weight-btn');
  const goalCleanBtn = container.querySelector('#goal-clean-btn');

  if (goalMuscleBtn) {
    goalMuscleBtn.addEventListener('click', () => {
      state.userGoal = 'muscle';
      renderLabLayout(container);
    });
  }
  if (goalWeightBtn) {
    goalWeightBtn.addEventListener('click', () => {
      state.userGoal = 'weight';
      renderLabLayout(container);
    });
  }
  if (goalCleanBtn) {
    goalCleanBtn.addEventListener('click', () => {
      state.userGoal = 'clean';
      renderLabLayout(container);
    });
  }

  // Step 4: Sliders
  const proteinSlider = container.querySelector('#protein-priority-slider');
  const upfSlider = container.querySelector('#upf-tolerance-slider');

  if (proteinSlider) {
    proteinSlider.addEventListener('input', (e) => {
      state.proteinPriority = parseInt(e.target.value, 10);
      updateStep4DynamicUI(container);
    });
  }

  if (upfSlider) {
    upfSlider.addEventListener('input', (e) => {
      state.upfTolerance = parseInt(e.target.value, 10);
      updateStep4DynamicUI(container);
    });
  }
}

// In-place dynamic UI updater for Step 4 slider inputs (prevents full innerHTML re-render)
function updateStep4DynamicUI(container) {
  const product = state.getProduct();
  const dynamicGoalFit = calculateDynamicGoalFit(product, state.userGoal, state.proteinPriority, state.upfTolerance);
  const healthScore = product.novaAnalysis ? product.novaAnalysis.healthScore : 50;

  const proteinValEl = container.querySelector('#protein-priority-val');
  if (proteinValEl) proteinValEl.textContent = `Level ${state.proteinPriority} / 5`;

  const upfValEl = container.querySelector('#upf-tolerance-val');
  if (upfValEl) upfValEl.textContent = `Level ${state.upfTolerance} / 5`;

  const goalFitScoreEl = container.querySelector('#goal-fit-score-val');
  if (goalFitScoreEl) goalFitScoreEl.textContent = `${dynamicGoalFit}/100`;

  const goalFitFillEl = container.querySelector('#goal-fit-progress-fill');
  if (goalFitFillEl) goalFitFillEl.style.width = `${dynamicGoalFit}%`;

  const verdictEl = container.querySelector('#goal-fit-verdict-val');
  if (verdictEl) verdictEl.innerHTML = `<strong>${getGoalVerdictText(dynamicGoalFit)}</strong>`;

  const tradeoffTextEl = container.querySelector('#tradeoff-insight-text');
  if (tradeoffTextEl) tradeoffTextEl.innerHTML = getTradeOffText(product, state.userGoal, dynamicGoalFit, healthScore);
}

// Auto-initialize on DOM ready (safely guarded for SSR / Node environments)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTelemetryLab);
  } else {
    initTelemetryLab();
  }
}
