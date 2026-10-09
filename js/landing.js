/* ==========================================================================
   BiteLens Web Application - Interactive Landing Page Logic
   Features:
   1. Scroll-driven Kurkure label progressive decode
   2. Canvas-based WhatsApp Share Card Generator (Growth Loop for India)
   3. Personalized Onboarding "For You" profile status
   ========================================================================== */

import { calculateBiteLensScore } from './analyze.js';
import { getUserProfile } from './calculators.js';
import productsData from './data/products.js';

export function initLandingPage() {
  initScrollDecode();
  initWhatsAppShareCard();
  updateOnboardingBanner();
}

/**
 * 1. Pinned Scroll-Driven Kurkure Label Progressive Decoder
 */
function initScrollDecode() {
  const steps = document.querySelectorAll('.decode-step-card');
  const labelHighlight = document.getElementById('kurkure-ingredients-view');
  const statusBadge = document.getElementById('decode-status-badge');
  const scoreGauge = document.getElementById('decode-gauge-val');
  const swapBox = document.getElementById('decode-swap-box');

  if (!steps.length || !labelHighlight) return;

  const rawIngredients = `Rice Meal (52.8%), Edible Vegetable Oil (Palmolein Oil), Corn Meal (19.8%), Gram Meal (3.3%), Spices and Condiments, Salt, Sugar, <mark class="hl-330">Acidity Regulator (INS 330)</mark>, <mark class="hl-627">Flavor Enhancer (INS 627)</mark>, <mark class="hl-631">Flavor Enhancer (INS 631)</mark>.`;

  function setStage(stageIndex) {
    steps.forEach((step, idx) => {
      if (idx === stageIndex) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    if (stageIndex === 0) {
      labelHighlight.innerHTML = `Rice Meal (52.8%), Edible Vegetable Oil (Palmolein Oil), Corn Meal (19.8%), Gram Meal (3.3%), Spices and Condiments, Salt, Sugar, Acidity Regulator (INS 330), Flavor Enhancer (INS 627), Flavor Enhancer (INS 631).`;
      if (statusBadge) statusBadge.textContent = "Raw Label Captured";
      if (scoreGauge) scoreGauge.textContent = "--";
      if (swapBox) swapBox.style.display = "none";
    } else if (stageIndex === 1) {
      labelHighlight.innerHTML = `Rice Meal (52.8%), Edible Vegetable Oil (Palmolein Oil), Corn Meal (19.8%), Gram Meal (3.3%), Spices and Condiments, Salt, Sugar, <span style="background: #E8F5E9; color: #166534; padding: 2px 5px; border-radius: 4px; font-weight: 700;">Acidity Regulator (INS 330)</span>, Flavor Enhancer (INS 627), Flavor Enhancer (INS 631).`;
      if (statusBadge) statusBadge.textContent = "INS 330 (Citric Acid) Identified • Low Concern";
      if (scoreGauge) scoreGauge.textContent = "75";
      if (swapBox) swapBox.style.display = "none";
    } else if (stageIndex === 2) {
      labelHighlight.innerHTML = `Rice Meal (52.8%), Edible Vegetable Oil (Palmolein Oil), Corn Meal (19.8%), Gram Meal (3.3%), Spices and Condiments, Salt, Sugar, <span style="background: #E8F5E9; color: #166534; padding: 2px 4px; border-radius: 4px;">INS 330</span>, <span style="background: #FEF3C7; color: #92400E; padding: 2px 5px; border-radius: 4px; font-weight: 700;">Flavor Enhancers (INS 627, INS 631)</span>.`;
      if (statusBadge) statusBadge.textContent = "Dual Umami Multipliers (Purine Precursors) • UPF Flag";
      if (scoreGauge) scoreGauge.textContent = "48";
      if (swapBox) swapBox.style.display = "none";
    } else {
      labelHighlight.innerHTML = `Rice Meal (52.8%), <span style="background: #FEE2E2; color: #991B1B; padding: 2px 4px; border-radius: 4px; font-weight: 700;">Palmolein Oil (34.6% Fat)</span>, Corn Meal (19.8%), Gram Meal (3.3%), Spices and Condiments, <span style="background: #FEE2E2; color: #991B1B; padding: 2px 4px; border-radius: 4px; font-weight: 700;">Salt (860mg Sodium)</span>, Sugar, <span style="background: #E8F5E9; color: #166534; padding: 2px 4px; border-radius: 4px;">INS 330</span>, <span style="background: #FEF3C7; color: #92400E; padding: 2px 4px; border-radius: 4px; font-weight: 700;">INS 627 & 631</span>.`;
      if (statusBadge) statusBadge.textContent = "Final BiteLens Score: 26/100 (NOVA 4 Ultra-Processed)";
      if (scoreGauge) scoreGauge.textContent = "26";
      if (swapBox) swapBox.style.display = "block";
    }
  }

  // Interactive Click on Steps
  steps.forEach((step, idx) => {
    step.addEventListener('click', () => setStage(idx));
  });

  // Intersection Observer for scroll triggers
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepIndex = parseInt(entry.target.dataset.stepIndex, 10);
          if (!isNaN(stepIndex)) setStage(stepIndex);
        }
      });
    }, { threshold: 0.6 });

    steps.forEach(step => observer.observe(step));
  }

  setStage(0);
}

/**
 * 2. Canvas-Based WhatsApp Share Card Generator
 */
function initWhatsAppShareCard() {
  const genBtn = document.getElementById('generate-whatsapp-card-btn');
  const canvas = document.getElementById('whatsapp-preview-canvas');
  if (!genBtn || !canvas) return;

  function renderCard(productName = "Kurkure Masala Munch", score = 26, category = "NOVA Group 4 (Ultra-Processed)") {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#FAF8F5');
    bgGrad.addColorStop(1, '#F1EFEA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Header Card
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 60, 60, 960, 960, 48);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.stroke();

    // BiteLens Brand Badge
    ctx.fillStyle = '#3B7A57';
    roundRect(ctx, 120, 120, 240, 64, 32);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('BiteLens Audit', 145, 164);

    // Date
    ctx.fillStyle = '#475569';
    ctx.font = '26px sans-serif';
    ctx.fillText('Verified FSSAI Food Analysis', 620, 164);

    // Product Title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(productName, 120, 270);

    ctx.fillStyle = '#475569';
    ctx.font = '32px sans-serif';
    ctx.fillText('Category: Packaged Savory Extruded Snack', 120, 325);

    // Large Score Dial Box
    const scoreBoxGrad = ctx.createLinearGradient(120, 380, 520, 700);
    scoreBoxGrad.addColorStop(0, '#FEF2F2');
    scoreBoxGrad.addColorStop(1, '#FEE2E2');
    ctx.fillStyle = scoreBoxGrad;
    roundRect(ctx, 120, 380, 400, 320, 32);
    ctx.fill();
    ctx.strokeStyle = '#FECACA';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('BITELENS SCORE', 160, 440);

    ctx.fillStyle = '#B91C1C';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${score}`, 160, 570);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('/100', 315, 570);

    ctx.fillStyle = '#7F1D1D';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(category, 160, 645);

    // Additives & Flagged Factors Box
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, 550, 380, 410, 320, 32);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('KEY TELEMETRY FLAGS', 580, 435);

    ctx.fillStyle = '#475569';
    ctx.font = '26px sans-serif';
    ctx.fillText('• INS 627 (Disodium Guanylate)', 580, 490);
    ctx.fillText('• INS 631 (Disodium Inosinate)', 580, 535);
    ctx.fillText('• 860mg Sodium (43% Daily Limit)', 580, 580);
    ctx.fillText('• Palmolein Oil (34.6g Fat)', 580, 625);

    // Healthy Swap Recommendation
    ctx.fillStyle = '#ECFDF5';
    roundRect(ctx, 120, 730, 840, 150, 24);
    ctx.fill();
    ctx.strokeStyle = '#A7F3D0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('✨ RECOMMENDED HEALTHY SWAP:', 160, 785);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Roasted Masala Makhana (+66 Score Upgrade)', 160, 840);

    // Footer Watermark
    ctx.fillStyle = '#94A3B8';
    ctx.font = '26px sans-serif';
    ctx.fillText('Scan your snacks on bitelens.app • 100% On-Device & Private', 120, 950);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  renderCard();

  genBtn.addEventListener('click', () => {
    // Generate image data and trigger download or Web Share
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'BiteLens_Food_Audit_Kurkure.png';
    link.href = dataUrl;
    link.click();
  });

  const whatsappBtn = document.getElementById('share-whatsapp-direct-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const shareText = encodeURIComponent(
        `🔍 BiteLens Food Audit Report:\n` +
        `Product: Kurkure Masala Munch\n` +
        `Score: 26/100 (NOVA 4 Ultra-Processed)\n` +
        `Additives Detected: INS 330, INS 627, INS 631\n` +
        `Sodium: 860mg (43% Daily Limit)\n` +
        `Recommended Clean Swap: Roasted Masala Makhana (+66 pts upgrade!)\n\n` +
        `Check your food ingredients on https://bitelenss.vercel.app`
      );
      window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    });
  }
}

/**
 * 3. Onboarding Status Banner Update
 */
function updateOnboardingBanner() {
  const profileBanner = document.getElementById('hero-onboarding-chip');
  if (!profileBanner) return;

  const profile = getUserProfile();
  if (profile && profile.targetCalories) {
    profileBanner.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 0.5rem; background: #E8F5E9; color: #166534; padding: 0.35rem 0.85rem; border-radius: 99px; font-size: 0.82rem; font-weight: 700;">
        <span>🎯 Active Profile:</span>
        <span>${profile.targetCalories} kcal • ${profile.weightGoal || 'Maintenance'} (Scores reading for you)</span>
      </span>
    `;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
}
