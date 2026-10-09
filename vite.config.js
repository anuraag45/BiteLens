import { resolve, basename } from 'path';
import { readdirSync } from 'fs';
import { defineConfig } from 'vite';

// Dynamic glob for HTML page inputs in project root (exactly the 10 production pages)
const htmlFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.html') && !file.includes('Sample') && !file.includes('Interview'));

const input = {};
for (const file of htmlFiles) {
  const name = file.replace(/\.html$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  input[name] = resolve(__dirname, file);
}

/**
 * Vite plugin for build-time HTML includes.
 * Injects pre-rendered header, footer, and mobile bottom tab bar into HTML at build time,
 * eliminating layout shift (CLS = 0), enabling full search indexing, and ensuring pages
 * remain fully readable and navigatable without JavaScript.
 */
function buildTimeIncludesPlugin() {
  return {
    name: 'vite-plugin-build-time-includes',
    transformIndexHtml(html, ctx) {
      const filename = ctx.filename ? basename(ctx.filename) : 'index.html';

      const isActive = (target) => {
        if (target === 'index.html' && (filename === 'index.html' || filename === '')) return 'active';
        return filename === target ? 'active' : '';
      };

      const headerHTML = `
      <header class="site-header">
        <div class="container header-inner" style="display: flex; align-items: center; justify-content: space-between; height: 68px;">
          <!-- Brand Logo -->
          <a href="index.html" class="brand-logo" style="text-decoration: none;">
            <div class="brand-logo-icon">
              <i data-lucide="eye"></i>
            </div>
            <span>BiteLens</span>
          </a>

          <!-- Main Desktop Navigation Bar -->
          <nav class="main-nav" id="main-nav" style="display: flex; align-items: center; gap: 0.4rem;">
            <a href="index.html" class="nav-link ${isActive('index.html')}">Home</a>
            <a href="scan.html" class="nav-link ${isActive('scan.html')}">
              <i data-lucide="camera" style="width: 1rem; height: 1rem;"></i> Scan Label
            </a>
            <a href="additives.html" class="nav-link ${isActive('additives.html')}">Additives</a>
            <a href="compare.html" class="nav-link ${isActive('compare.html')}">Compare</a>
            <a href="health-calculator.html" class="nav-link ${isActive('health-calculator.html')}">Profile & Calculator</a>
            <a href="learn.html" class="nav-link ${isActive('learn.html')}">Learn & Science</a>
            <a href="dashboard.html" class="nav-link ${isActive('dashboard.html')}">Journal</a>
            <a href="about.html" class="nav-link ${isActive('about.html')}">About</a>
          </nav>

          <!-- Desktop Right Action Pill -->
          <div id="header-user-action" style="display: flex; align-items: center; gap: 0.65rem;">
            <a href="download.html" class="btn btn-primary" style="height: 38px; padding: 0 1rem; font-size: 0.85rem; border-radius: var(--radius-pill); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="download" style="width: 0.95rem; height: 0.95rem;"></i> App APK
            </a>
          </div>
        </div>
      </header>`;

      const footerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2.5rem;">
            <div>
              <div class="brand-logo" style="margin-bottom: 0.75rem;">
                <div class="brand-logo-icon"><i data-lucide="eye"></i></div>
                <span>BiteLens</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.5;">
                Demystifying packaged food labels in India with transparent INS code decoding and objective NOVA processing classifications.
              </p>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-main);">Features</h4>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.85rem;">
                <li><a href="scan.html" style="color: var(--color-text-muted); text-decoration: none;">Optical Label Scanner</a></li>
                <li><a href="additives.html" style="color: var(--color-text-muted); text-decoration: none;">FSSAI Additives Directory</a></li>
                <li><a href="compare.html" style="color: var(--color-text-muted); text-decoration: none;">Food Matchup & Swaps</a></li>
                <li><a href="health-calculator.html" style="color: var(--color-text-muted); text-decoration: none;">Profile & BMI Calculator</a></li>
              </ul>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-main);">Resources</h4>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.85rem;">
                <li><a href="learn.html" style="color: var(--color-text-muted); text-decoration: none;">NOVA Classification & Science</a></li>
                <li><a href="learn.html#faq" style="color: var(--color-text-muted); text-decoration: none;">Labeling FAQ & Myths</a></li>
                <li><a href="download.html" style="color: var(--color-text-muted); text-decoration: none;">Download Android App</a></li>
                <li><a href="report.html" style="color: var(--color-text-muted); text-decoration: none;">Academic Project Report</a></li>
              </ul>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-main);">Privacy & Team</h4>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.85rem;">
                <li><a href="about.html" style="color: var(--color-text-muted); text-decoration: none;">Mission & Authors</a></li>
                <li><a href="about.html#contact" style="color: var(--color-text-muted); text-decoration: none;">Contact Us</a></li>
                <li><span style="color: var(--color-text-muted); font-size: 0.82rem;">100% On-Device • Zero Sign-Up</span></li>
              </ul>
            </div>
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.82rem; color: var(--color-text-muted);">
            <div>© 2026 BiteLens. Independent Food Literacy Project.</div>
            <div>Built with Vite, Vanilla JS, and Go.</div>
          </div>
        </div>
      </footer>`;

      const toolsActive = (filename === 'compare.html' || filename === 'health-calculator.html') ? 'active' : '';
      const learnActive = (filename === 'learn.html' || filename === 'additives.html') ? 'active' : '';

      const mobileTabBarHTML = `
      <nav id="site-mobile-tab-bar" class="mobile-tab-bar" aria-label="Mobile Navigation Tabs">
        <a href="scan.html" class="mobile-tab-item ${isActive('scan.html')}">
          <i data-lucide="camera"></i>
          <span>Scan</span>
        </a>
        <a href="compare.html" class="mobile-tab-item ${toolsActive}">
          <i data-lucide="scale"></i>
          <span>Tools</span>
        </a>
        <a href="learn.html" class="mobile-tab-item ${learnActive}">
          <i data-lucide="book-open"></i>
          <span>Learn</span>
        </a>
        <a href="dashboard.html" class="mobile-tab-item ${isActive('dashboard.html')}">
          <i data-lucide="layout-dashboard"></i>
          <span>Journal</span>
        </a>
      </nav>`;

      let transformed = html;
      if (transformed.includes('<div id="site-header-container"></div>')) {
        transformed = transformed.replace('<div id="site-header-container"></div>', `<div id="site-header-container">${headerHTML}</div>`);
      }
      if (transformed.includes('<div id="site-footer-container"></div>')) {
        transformed = transformed.replace('<div id="site-footer-container"></div>', `<div id="site-footer-container">${footerHTML}</div>`);
      }
      if (!transformed.includes('site-mobile-tab-bar') && transformed.includes('</body>')) {
        transformed = transformed.replace('</body>', `${mobileTabBarHTML}\n</body>`);
      }

      return transformed;
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [
    buildTimeIncludesPlugin()
  ],
  build: {
    rollupOptions: {
      input
    }
  }
});
