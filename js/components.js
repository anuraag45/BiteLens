import { CONFIG } from './config.js';
import { initCyberBackground } from './cyber-background.js';
import { getStoredUser, logoutUser } from './auth.js';
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
  User, 
  Mail, 
  ChevronDown, 
  Menu, 
  Info,
  CheckCircle2,
  Cpu,
  Search,
  PieChart,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus,
  Eye
} from 'lucide';

export function renderComponents() {
  initCyberBackground();
  renderBiteLensSplashScreen();

  const headerContainer = document.getElementById('site-header-container');
  const footerContainer = document.getElementById('site-footer-container');

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = getStoredUser();

  if (headerContainer) {
    const authNavHTML = currentUser ? `
      <!-- Logged-In User Profile Chip -->
      <div style="display: inline-flex; align-items: center; gap: 0.55rem; background: rgba(59, 122, 87, 0.1); border: 1px solid rgba(59, 122, 87, 0.3); padding: 0.3rem 0.85rem; border-radius: var(--radius-pill); height: 38px;">
        <span style="font-size: 0.95rem;">${currentUser.avatar || '👤'}</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--color-primary); line-height: 1.1;">${currentUser.name}</span>
          <span style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 600;">${currentUser.goal}</span>
        </div>
        <button id="logout-btn" style="background: none; border: none; color: #E11D48; cursor: pointer; padding: 0 0.15rem; margin-left: 0.2rem;" title="Logout">
          <i data-lucide="log-out" style="width: 0.9rem; height: 0.9rem;"></i>
        </button>
      </div>
    ` : `
      <!-- Logged-Out Auth Buttons -->
      <a href="login.html" class="nav-link ${currentPath === 'login.html' ? 'active' : ''}">
        <i data-lucide="log-in" style="width: 0.9rem; height: 0.9rem;"></i> Login
      </a>
      <a href="signup.html" class="btn btn-outline" style="height: 38px; padding: 0 0.9rem; font-size: 0.85rem;">
        <i data-lucide="user-plus" style="width: 0.85rem; height: 0.85rem;"></i> Sign Up
      </a>
    `;

    headerContainer.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a href="index.html" class="brand-logo">
            <div class="brand-logo-icon">
              <i data-lucide="eye"></i>
            </div>
            <span>${CONFIG.BRAND_NAME}</span>
          </a>

          <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle navigation">
            <i data-lucide="menu"></i>
          </button>

          <nav class="main-nav" id="main-nav">
            <a href="index.html" class="nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">Home</a>
            <a href="features.html" class="nav-link ${currentPath === 'features.html' ? 'active' : ''}">Features</a>
            <a href="how-it-works.html" class="nav-link ${currentPath === 'how-it-works.html' ? 'active' : ''}">How It Works</a>
            
            <!-- Calculators Dropdown -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath.includes('calculator') || currentPath.includes('budget') ? 'active' : ''}">
                Calculators <i data-lucide="chevron-down" style="width: 0.9rem; height: 0.9rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="bmi-calculator.html" class="dropdown-item">
                  <i data-lucide="activity"></i> BMI Calculator
                </a>
                <a href="calorie-calculator.html" class="dropdown-item">
                  <i data-lucide="flame"></i> Calorie Calculator
                </a>
                <a href="snack-budget.html" class="dropdown-item">
                  <i data-lucide="pie-chart"></i> Snack Budget Simulator
                </a>
              </div>
            </div>

            <!-- Tools & Studio Dropdown -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath.includes('decoder') || currentPath.includes('scanner-demo') || currentPath.includes('faq') ? 'active' : ''}">
                Tools & Studio <i data-lucide="chevron-down" style="width: 0.9rem; height: 0.9rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="additive-decoder.html" class="dropdown-item">
                  <i data-lucide="search"></i> INS Additive Decoder
                </a>
                <a href="scanner-demo.html" class="dropdown-item">
                  <i data-lucide="scan-line"></i> Label Scanner Studio
                </a>
                <a href="faq.html" class="dropdown-item">
                  <i data-lucide="help-circle"></i> Labeling FAQ
                </a>
              </div>
            </div>

            <a href="science.html" class="nav-link ${currentPath === 'science.html' ? 'active' : ''}">Science</a>
            <a href="about.html" class="nav-link ${currentPath === 'about.html' ? 'active' : ''}">About</a>
            <a href="contact.html" class="nav-link ${currentPath === 'contact.html' ? 'active' : ''}">Contact</a>
            
            ${authNavHTML}
          </nav>
        </div>
      </header>
    `;
  }

  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          
          <div class="footer-main-grid">
            
            <div style="grid-column: span 1;">
              <div class="brand-logo" style="margin-bottom: 0.75rem;">
                <div class="brand-logo-icon" style="background: rgba(59, 122, 87, 0.2); border-color: var(--color-primary); color: #FFFFFF;">
                  <i data-lucide="eye"></i>
                </div>
                <span style="color: #FFFFFF;">${CONFIG.BRAND_NAME}</span>
              </div>
              <p style="color: #94A3B8; font-size: 0.9rem; margin-bottom: 1.25rem; line-height: 1.5;">
                ${CONFIG.TAGLINE}
              </p>
              <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.8rem; background: #1E293B; border-radius: var(--radius-pill); font-size: 0.78rem; color: #38BDF8; font-weight: 700;">
                <i data-lucide="sparkles" style="width: 0.85rem; height: 0.85rem;"></i> Smart Label Telemetry App
              </div>
            </div>

            <div>
              <div class="footer-col-title">Navigation</div>
              <ul class="footer-link-list">
                <li><a href="index.html">Home Overview</a></li>
                <li><a href="features.html">App Features</a></li>
                <li><a href="how-it-works.html">How BiteLens Works</a></li>
                <li><a href="about.html">About Team</a></li>
                <li><a href="contact.html">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Calculators</div>
              <ul class="footer-link-list">
                <li><a href="bmi-calculator.html">BMI Calculator</a></li>
                <li><a href="calorie-calculator.html">Calorie Calculator</a></li>
                <li><a href="snack-budget.html">Snack Budget Simulator</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Analysis Tools</div>
              <ul class="footer-link-list">
                <li><a href="additive-decoder.html">INS Additive Decoder</a></li>
                <li><a href="scanner-demo.html">Label Scanner Studio</a></li>
                <li><a href="science.html">NOVA & FSSAI Matrix</a></li>
                <li><a href="faq.html">Food Labeling FAQ</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Account Access</div>
              <ul class="footer-link-list">
                <li><a href="login.html">Login to BiteLens</a></li>
                <li><a href="signup.html">Create Free Account</a></li>
              </ul>
            </div>

          </div>

          <div class="footer-compliance-card">
            <i data-lucide="shield-alert" style="width: 2rem; height: 2rem; color: var(--color-accent); flex-shrink: 0; margin-top: 0.2rem;"></i>
            <div>
              <div style="font-weight: 700; font-family: var(--font-family-display); font-size: 0.95rem; color: #FFFFFF; margin-bottom: 0.25rem;">
                Scientific & Medical Compliance Disclaimer
              </div>
              <div style="font-size: 0.85rem; color: #94A3B8; line-height: 1.5;">
                ${CONFIG.DISCLAIMER_TEXT}
              </div>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div>© ${new Date().getFullYear()} ${CONFIG.BRAND_NAME} Mobile App. All Rights Reserved.</div>
            <div>Direct Support: <code>${CONFIG.CONTACT_EMAIL}</code></div>
          </div>

        </div>
      </footer>
    `;
  }

  // Initialize Lucide Icons
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
      User,
      Mail,
      ChevronDown,
      Menu,
      Info,
      CheckCircle2,
      Cpu,
      Search,
      PieChart,
      HelpCircle,
      ArrowRight,
      ShieldAlert,
      LogOut,
      LogIn,
      UserPlus,
      Eye
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  setupEventListeners();
}

/**
 * Renders the animated BiteLens splash screen on initial page load
 */
function renderBiteLensSplashScreen() {
  if (sessionStorage.getItem('bitelens_splash_shown')) return;

  const splash = document.createElement('div');
  splash.id = 'bitelens-splash-screen';
  splash.className = 'splash-overlay';
  splash.innerHTML = `
    <div class="splash-brand-logo">
      <div class="splash-icon-ring">
        <i data-lucide="eye" style="width: 2.2rem; height: 2.2rem;"></i>
      </div>
      <span>BiteLens</span>
    </div>
    <div class="splash-progress-track">
      <div class="splash-progress-fill" id="splash-fill"></div>
    </div>
    <div class="splash-status-text" id="splash-status">INITIALIZING OPTICAL TELEMETRY ENGINE...</div>
  `;

  document.body.prepend(splash);
  sessionStorage.setItem('bitelens_splash_shown', 'true');

  const fill = document.getElementById('splash-fill');
  const status = document.getElementById('splash-status');

  let progress = 0;
  const interval = setInterval(() => {
    progress += 8;
    if (fill) fill.style.width = `${progress}%`;

    if (progress === 40 && status) status.textContent = 'DECODING FSSAI & NOVA DATABASES...';
    if (progress === 80 && status) status.textContent = 'PREPARING DASHBOARD...';

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 500);
      }, 200);
    }
  }, 35);
}

function setupEventListeners() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-open');
    });
  }
}

document.addEventListener('DOMContentLoaded', renderComponents);
