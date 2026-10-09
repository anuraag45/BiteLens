/* ==========================================================================
   BiteLens Web Application - Ambient Hero Canvas Engine
   Engineered with:
   - Zero UI collision: pointer-events: none, no distracting floating widgets
   - High performance: pauses on visibilitychange, caps DPR at 2
   - Accessibility: honors prefers-reduced-motion media query
   - OS-consistent vector graphics: crisp vector geometric icons (no OS emoji variance)
   - Ambient scan state reactivity
   ========================================================================== */

export function initCyberBackground() {
  const heroSection = document.querySelector('.hero') || document.querySelector('#hero-canvas-container');
  if (!heroSection) return;

  // Check if canvas already exists
  if (document.getElementById('ambient-hero-canvas')) return;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-hero-canvas';
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.75;
  `;

  // Make sure hero container has relative position to contain canvas
  const style = window.getComputedStyle(heroSection);
  if (style.position === 'static') {
    heroSection.style.position = 'relative';
  }
  heroSection.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let isRunning = true;
  let animationFrameId = null;

  // Cap DPR to 2 for battery efficiency and performance
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Listen to visibilitychange to pause canvas loop when tab is backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      isRunning = true;
      lastTime = performance.now();
      loop();
    }
  });

  // Vector Particles (Clean geometric Wellness / Food motifs: leaf, molecule, circle, drop)
  const PARTICLE_TYPES = ['leaf', 'drop', 'shield', 'ring'];
  const particles = [];
  const particleCount = Math.min(22, Math.max(10, Math.floor(width / 50)));

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 10 + Math.random() * 12,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.35,
      type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
      color: Math.random() > 0.4 ? 'rgba(59, 122, 87, 0.22)' : 'rgba(2, 132, 199, 0.18)',
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.015
    });
  }

  // Draw crisp SVG vector geometries directly on canvas
  function drawVectorShape(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.5;

    const s = p.size;

    if (p.type === 'leaf') {
      // Natural leaf path
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.8, -s * 0.4, 0, s);
      ctx.quadraticCurveTo(-s * 0.8, -s * 0.4, 0, -s);
      ctx.fill();
    } else if (p.type === 'drop') {
      // Water droplet path
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.7, 0, 0, s * 0.7);
      ctx.quadraticCurveTo(-s * 0.7, 0, 0, -s);
      ctx.fill();
    } else if (p.type === 'shield') {
      // Security shield outline
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(s * 0.6, -s * 0.4);
      ctx.lineTo(s * 0.6, s * 0.2);
      ctx.quadraticCurveTo(0, s * 0.9, 0, s * 0.9);
      ctx.quadraticCurveTo(0, s * 0.9, -s * 0.6, s * 0.2);
      ctx.lineTo(-s * 0.6, -s * 0.4);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Concentric clean ring
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  let lastTime = performance.now();

  function loop() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.vAngle;

      // Wrap around bounds
      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      drawVectorShape(ctx, p);
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  loop();
}
