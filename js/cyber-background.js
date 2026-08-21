/* ==========================================================================
   Pink Web Application - Background Canvas Engine
   Features:
   - Zero Bleed-Through: Background nodes only activate when mouse is over empty background,
     NEVER triggering behind cards, headers, footers, or buttons!
   - 3-Tier Nuanced Classification (Healthy, Mixed, Unhealthy)
   - Ultra-compact sleek tooltip popover
   ========================================================================== */

const FOOD_ITEMS = [
  // --- 1. HEALTHY FRESH WHOLE FOODS (NOVA 1 & 2) ---
  { symbol: '🍎', label: 'Fresh Apple', sub: 'Clean Whole Food', type: 'healthy', desc: 'Fresh fruit with natural fiber for stomach health and energy.' },
  { symbol: '🥑', label: 'Avocado', sub: 'Healthy Plant Fats', type: 'healthy', desc: 'Natural fruit filled with good fats that keep your heart strong.' },
  { symbol: '🌾', label: 'Whole Oats', sub: 'High Fiber Grain', type: 'healthy', desc: 'Whole grain that helps lower cholesterol and keeps you full.' },
  { symbol: '🥦', label: 'Broccoli', sub: 'Fresh Green Veggie', type: 'healthy', desc: 'Green veggie packed with natural vitamins for immunity.' },
  { symbol: '🫐', label: 'Blueberries', sub: 'Fresh Super Berry', type: 'healthy', desc: 'Sweet fresh berries full of natural antioxidants.' },
  { symbol: '🥕', label: 'Carrot', sub: 'Fresh Root Veggie', type: 'healthy', desc: 'Crunchy veggie filled with Vitamin A for sharp eyes.' },
  { symbol: '🍌', label: 'Banana', sub: 'Natural Energy Fruit', type: 'healthy', desc: 'Soft fruit packed with potassium to prevent muscle cramps.' },
  { symbol: '🍓', label: 'Strawberries', sub: 'Fresh Organic Fruit', type: 'healthy', desc: 'Juicy berry filled with Vitamin C for glowing skin.' },
  { symbol: '🥚', label: 'Boiled Egg', sub: 'Natural Protein', type: 'healthy', desc: 'High-quality protein to build strong muscles.' },
  { symbol: '🥛', label: 'Fresh Milk', sub: 'Calcium & Protein', type: 'healthy', desc: 'Natural dairy drink packed with bone-building calcium.' },
  { symbol: '🥜', label: 'Peanuts', sub: 'Healthy Plant Protein', type: 'healthy', desc: 'Crunchy nuts rich in good fats and plant protein.' },
  { symbol: '🍇', label: 'Fresh Grapes', sub: 'Natural Antioxidants', type: 'healthy', desc: 'Juicy natural fruit packed with hydration and nutrients.' },

  // --- 2. MIXED / BALANCED MACRO-DENSE FOODS ---
  { symbol: '🍔', label: 'Cheeseburger', sub: 'Mixed: High Protein & Cheese', type: 'mixed', desc: 'Good protein & calcium from meat/cheese, but high in salt.' },
  { symbol: '🍕', label: 'Cheese Pizza', sub: 'Mixed: Dairy Protein & Carbs', type: 'mixed', desc: 'Gives rich calcium & dairy protein, but crust is high in sodium.' },
  { symbol: '🌮', label: 'Mexican Taco', sub: 'Mixed: Fiber & Protein', type: 'mixed', desc: 'Wholesome beans, meat protein, and veggies in corn tortilla.' },
  { symbol: '🥞', label: 'Pancakes', sub: 'Mixed: Quick Carbohydrates', type: 'mixed', desc: 'Provides fast energy before workouts; enjoy with light syrup.' },
  { symbol: '🍿', label: 'Popcorn', sub: 'Mixed: Whole Grain Fiber', type: 'mixed', desc: 'Natural whole grain fiber; watch out for heavy theater butter.' },

  // --- 3. UNHEALTHY ULTRA-PROCESSED ADDITIVES & SWEETS (NOVA 4) ---
  { symbol: '🍟', label: 'French Fries', sub: 'High Salt & Deep Fried', type: 'unhealthy', desc: 'Deep-fried potato sticks soaked in heavy oil and high salt.' },
  { symbol: '🥤', label: 'Cola Soda', sub: 'High Added Sugar', type: 'unhealthy', desc: 'Fizzy drink with over 8 spoons of sugar and zero vitamins.' },
  { symbol: '🍩', label: 'Glazed Donut', sub: 'High Sugar Bakery', type: 'unhealthy', desc: 'Fried sweet dough covered in sugary glaze.' },
  { symbol: '🍬', label: 'Chewy Candy', sub: 'Artificial Sugar Dye', type: 'unhealthy', desc: 'Made almost entirely of artificial sugar syrup and food dyes.' },
  { symbol: 'INS 621', label: 'MSG Powder', sub: 'Savory Flavor Enhancer', type: 'unhealthy', desc: 'Chemical powder added to chips & noodles for savory saltiness.' },
  { symbol: 'INS 322', label: 'Lecithin', sub: 'Chocolate Emulsifier', type: 'healthy', desc: 'Natural plant ingredient keeping chocolate smooth.' },
  { symbol: 'INS 211', label: 'Sodium Benzoate', sub: 'Juice Preservative', type: 'unhealthy', desc: 'Liquid preservative preventing bottled juices from spoiling.' },
  { symbol: 'INS 120', label: 'Carmine Red', sub: 'Red Food Color', type: 'unhealthy', desc: 'Natural red color used in candies and pink yogurts.' },
  { symbol: 'INS 955', label: 'Sucralose', sub: 'Zero-Calorie Sweetener', type: 'unhealthy', desc: 'Super-sweet artificial powder replacing sugar in diet sodas.' },
  { symbol: 'Protein', label: 'Body Protein', sub: 'Muscle Builder', type: 'healthy', desc: 'Essential building block helping repair your body and muscles.' },
  { symbol: 'Fiber', label: 'Stomach Fiber', sub: 'Gut Cleaner', type: 'healthy', desc: 'Natural plant fiber helping digestion move smoothly.' }
];

export function initCyberBackground() {
  if (document.getElementById('cyber-bg-canvas')) return;

  let isPaused = false;
  let dimLevel = 1;

  const canvas = document.createElement('canvas');
  canvas.id = 'cyber-bg-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: auto;
    background: #FAF8F5;
    transition: opacity 0.3s ease;
  `;
  document.body.prepend(canvas);

  renderControlBar();
  renderCutePopoverCard();

  const ctx = canvas.getContext('2d');
  let width, height;
  let foodNodes = [];

  const mouse = {
    x: -1000,
    y: -1000,
    radius: 65
  };

  // Zero Bleed-Through Check: If mouse cursor is over any foreground UI element, disable background hover!
  window.addEventListener('mousemove', (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest('.card, .hud-card, .glass-card, .calculator-card, .hud-telemetry-workbench, .site-header, .site-footer, .modal-card, .cute-popover-card, .bg-control-widget, button, input, select, a, textarea')) {
      mouse.x = -1000;
      mouse.y = -1000;
    } else {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Zero Bleed-Through Click Handler: Ignore clicks on foreground cards/inputs!
  window.addEventListener('click', (e) => {
    if (e.target.closest('.card, .hud-card, .glass-card, .calculator-card, .hud-telemetry-workbench, .site-header, .site-footer, .modal-card, .cute-popover-card, .bg-control-widget, button, input, select, a')) return;

    for (let node of foodNodes) {
      if (node.scanned) {
        showCutePopoverOverNode(node.item, node.x, node.y);
        return;
      }
    }
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class FoodNode {
    constructor(preset = null, customX = null, customY = null) {
      this.item = preset || FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
      this.x = customX !== null ? customX : Math.random() * width;
      this.y = customY !== null ? customY : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.alpha = (Math.random() * 0.20 + 0.50);
      this.scanned = false;
      this.scanScale = 1;
    }
    update() {
      if (isPaused) return;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        this.scanned = true;
        this.scanScale = Math.min(this.scanScale + 0.05, 1.25);
      } else {
        this.scanned = false;
        this.scanScale = Math.max(this.scanScale - 0.05, 1);
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.y < -45) {
          this.y = height + 45;
          this.x = Math.random() * width;
        }
        if (this.x < -45) this.x = width + 45;
        if (this.x > width + 45) this.x = -45;
      }
    }
    draw() {
      if (dimLevel === 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scanScale, this.scanScale);

      let accentColor = '#3B7A57';
      if (this.item.type === 'mixed') accentColor = '#0284C7';
      if (this.item.type === 'unhealthy') accentColor = '#E11D48';

      if (this.scanned) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(30, 41, 59, 0.12)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-42, 22, 84, 22, 6);
        ctx.fill();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.item.label, 0, 36);
      }

      if (this.item.symbol.startsWith('INS') || this.item.symbol === 'Protein' || this.item.symbol === 'Fiber') {
        ctx.fillStyle = (this.item.type === 'mixed') ? 'rgba(2, 132, 199, 0.12)' : (this.item.type === 'unhealthy' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(59, 122, 87, 0.12)');
        ctx.strokeStyle = (this.item.type === 'mixed') ? 'rgba(2, 132, 199, 0.4)' : (this.item.type === 'unhealthy' ? 'rgba(225, 29, 72, 0.4)' : 'rgba(59, 122, 87, 0.4)');
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-32, -11, 64, 22, 11);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 9.5px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.item.symbol, 0, 3);
      } else {
        ctx.globalAlpha = this.alpha * dimLevel;
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.item.symbol, 0, 0);
      }

      ctx.restore();
    }
  }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      isPaused = true;
    }

    const isMobile = window.innerWidth < 768;
    const maxNodes = isMobile ? 18 : 54;
    const nodeCount = Math.min(Math.floor((width * height) / (isMobile ? 32000 : 18000)), maxNodes);
    for (let i = 0; i < nodeCount; i++) {
      foodNodes.push(new FoodNode());
    }

  function renderCutePopoverCard() {
    if (document.getElementById('cute-telemetry-popover')) return;

    const popover = document.createElement('div');
    popover.id = 'cute-telemetry-popover';
    popover.className = 'cute-popover-card';
    popover.style.display = 'none';
    document.body.appendChild(popover);
  }

  function showCutePopoverOverNode(item, posX, posY) {
    const popover = document.getElementById('cute-telemetry-popover');
    if (!popover) return;

    let badgeColor = '#3B7A57';
    let badgeBg = '#E8F5E9';
    if (item.type === 'mixed') {
      badgeColor = '#0284C7';
      badgeBg = '#E0F2FE';
    } else if (item.type === 'unhealthy') {
      badgeColor = '#E11D48';
      badgeBg = '#FEF2F2';
    }

    const popWidth = 220;
    const popHeight = 110;
    let targetLeft = posX - (popWidth / 2);
    let targetTop = posY - popHeight - 14;

    targetLeft = Math.max(12, Math.min(targetLeft, window.innerWidth - popWidth - 16));
    if (targetTop < 12) {
      targetTop = posY + 30;
    }

    popover.style.left = `${targetLeft}px`;
    popover.style.top = `${targetTop}px`;
    popover.style.borderColor = badgeColor;

    const targetUrl = item.symbol.startsWith('INS') 
      ? `additive-decoder.html?code=${encodeURIComponent(item.symbol)}` 
      : `scanner-demo.html?search=${encodeURIComponent(item.label)}`;

    popover.innerHTML = `
      <button class="cute-popover-close" id="close-cute-popover">✕</button>
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; padding-right: 1.2rem;">
        <span style="font-size: 1.4rem; line-height: 1;">${item.symbol}</span>
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 0.88rem; font-weight: 800; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${item.label}
          </div>
          <div style="font-size: 0.68rem; font-weight: 700; color: ${badgeColor}; line-height: 1.1;">
            ${item.sub}
          </div>
        </div>
      </div>
      <p style="font-size: 0.75rem; color: #475569; margin: 0 0 0.4rem 0; line-height: 1.35;">
        ${item.desc}
      </p>
      <div style="text-align: right;">
        <a href="${targetUrl}" style="font-size: 0.75rem; font-weight: 800; color: ${badgeColor}; text-decoration: none; display: inline-flex; align-items: center; gap: 0.2rem;">
          Decode in Tools Studio ➔
        </a>
      </div>
    `;

    popover.style.display = 'block';
    setTimeout(() => popover.classList.add('active'), 10);

    document.getElementById('close-cute-popover').addEventListener('click', () => {
      popover.classList.remove('active');
      setTimeout(() => popover.style.display = 'none', 160);
    });
  }

  function renderControlBar() {
    if (document.getElementById('bg-control-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'bg-control-bar';
    bar.className = 'bg-control-widget';
    bar.innerHTML = `
      <button class="bg-ctrl-btn" id="toggle-pause-btn" title="Pause or Resume Background Motion">
        ⏸️ Pause
      </button>
      <button class="bg-ctrl-btn" id="toggle-dim-btn" title="Toggle Background Dimming">
        👁️ Dim (50%)
      </button>
    `;
    document.body.appendChild(bar);

    const pauseBtn = document.getElementById('toggle-pause-btn');
    const dimBtn = document.getElementById('toggle-dim-btn');

    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused ? '▶️ Play' : '⏸️ Pause';
      pauseBtn.classList.toggle('active', isPaused);
    });

    dimBtn.addEventListener('click', () => {
      if (dimLevel === 1) {
        dimLevel = 0.4;
        dimBtn.innerHTML = '👁️ Dim (40%)';
        canvas.style.opacity = '0.4';
      } else if (dimLevel === 0.4) {
        dimLevel = 0;
        dimBtn.innerHTML = '🚫 Hidden';
        canvas.style.opacity = '0';
      } else {
        dimLevel = 1;
        dimBtn.innerHTML = '👁️ Dim (Full)';
        canvas.style.opacity = '1';
      }
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 3, 50,
      width / 2, height / 2, width * 0.85
    );
    bgGradient.addColorStop(0, '#FAF8F5');
    bgGradient.addColorStop(0.6, '#F1F5F9');
    bgGradient.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (!isPaused && mouse.x > 0 && mouse.y > 0 && dimLevel > 0) {
      ctx.save();
      const mouseScannerGlow = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, mouse.radius
      );
      mouseScannerGlow.addColorStop(0, 'rgba(59, 122, 87, 0.08)');
      mouseScannerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseScannerGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    foodNodes.forEach(node => {
      node.update();
      node.draw();
    });

    requestAnimationFrame(render);
  }

  render();
}

document.addEventListener('DOMContentLoaded', initCyberBackground);
