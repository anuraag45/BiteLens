import { CONFIG } from './config.js';
import { initCyberBackground } from './cyber-background.js';
import { getUserSession, logoutUser } from './auth.js';
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
  Eye,
  Columns,
  LayoutDashboard,
  Camera,
  View,
  UploadCloud,
  RefreshCw,
  Scan,
  History,
  Barcode,
  AlertTriangle,
  UserCheck
} from 'lucide';

export function renderComponents() {
  initCyberBackground();
  renderBiteLensSplashScreen();

  const headerContainer = document.getElementById('site-header-container');
  const footerContainer = document.getElementById('site-footer-container');

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = getUserSession();

  if (headerContainer) {
    const authNavHTML = currentUser ? `
      <!-- Logged-In User Profile Chip -->
      <a href="dashboard.html" style="display: inline-flex; align-items: center; gap: 0.55rem; background: rgba(59, 122, 87, 0.1); border: 1px solid rgba(59, 122, 87, 0.3); padding: 0.3rem 0.85rem; border-radius: var(--radius-pill); height: 38px; text-decoration: none;">
        <span style="font-size: 0.95rem;">👤</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--color-primary); line-height: 1.1;">${currentUser.fullName || currentUser.email?.split('@')[0]}</span>
          <span style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 600;">Dashboard</span>
        </div>
      </a>
      <button id="logout-btn" style="background: none; border: none; color: #E11D48; cursor: pointer; padding: 0 0.25rem;" title="Logout">
        <i data-lucide="log-out" style="width: 1.1rem; height: 1.1rem;"></i>
      </button>
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
            <a href="dashboard.html" class="nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">
              <i data-lucide="layout-dashboard" style="width: 0.9rem; height: 0.9rem;"></i> Dashboard
            </a>
            <a href="compare.html" class="nav-link ${currentPath === 'compare.html' ? 'active' : ''}">
              <i data-lucide="columns" style="width: 0.9rem; height: 0.9rem;"></i> Compare
            </a>
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
                <a href="scanner-demo.html" class="dropdown-item">
                  <i data-lucide="scan-line"></i> Live Camera Scanner
                </a>
                <a href="additive-decoder.html" class="dropdown-item">
                  <i data-lucide="search"></i> INS Additive Decoder
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
                <li><a href="dashboard.html">Member Dashboard</a></li>
                <li><a href="compare.html">Food Comparison</a></li>
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
                <li><a href="scanner-demo.html">Live Camera Scanner</a></li>
                <li><a href="additive-decoder.html">INS Additive Decoder</a></li>
                <li><a href="science.html">NOVA & FSSAI Matrix</a></li>
                <li><a href="faq.html">Food Labeling FAQ</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Academic & Legal</div>
              <ul class="footer-link-list">
                <li><a href="sgp_report.html" target="_blank">Indus SGP Report (PDF)</a></li>
                <li><span style="color: #64748B;">Version 2.4.0 (Go Microservice)</span></li>
                <li><span style="color: #64748B;">DPDP Act Minor Protection</span></li>
              </ul>
            </div>

          </div>

          <div class="footer-compliance-card">
            <div style="font-size: 1.5rem;">⚖️</div>
            <div>
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 0.95rem; margin-bottom: 0.25rem;">
                Scientific Independence & Legal Compliance
              </div>
              <p style="color: #94A3B8; font-size: 0.82rem; margin: 0; line-height: 1.45;">
                BiteLens operates independently. Health scores are calculated mathematically using the peer-reviewed NOVA food processing framework and official FSSAI Food Safety and Standards (Labelling and Display) Regulations. We do not accept sponsorship from food brands or ingredient manufacturers.
              </p>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div>
              © 2026 ${CONFIG.BRAND_NAME}. Built with Go (Golang) & Vite. All rights reserved.
            </div>
            <div style="display: flex; gap: 1.5rem;">
              <a href="sgp_report.html" target="_blank" style="color: #94A3B8; font-size: 0.85rem;">Indus University SGP Report</a>
              <a href="about.html" style="color: #94A3B8; font-size: 0.85rem;">Project Credits</a>
              <a href="contact.html" style="color: #94A3B8; font-size: 0.85rem;">Support</a>
            </div>
          </div>

        </div>
      </footer>
    `;
  }

  // Refresh Lucide Icons
  createIcons({
    icons: {
      ScanLine, Sparkles, ShieldCheck, Target, Activity, Flame, FlaskConical,
      Database, User, Mail, ChevronDown, Menu, Info, CheckCircle2, Cpu,
      Search, PieChart, HelpCircle, ArrowRight, ShieldAlert, LogOut, LogIn,
      UserPlus, Eye, Columns, LayoutDashboard, Camera, View, UploadCloud,
      RefreshCw, Scan, History, Barcode, AlertTriangle, UserCheck
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-open');
    });
  }

  // Logout listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      window.location.href = 'index.html';
    });
  }
}

function renderBiteLensSplashScreen() {
  const splashContainer = document.getElementById('bitelens-splash-screen');
  if (!splashContainer) return;

  const splashShown = sessionStorage.getItem('bitelens_splash_shown');
  if (splashShown) {
    splashContainer.style.display = 'none';
    return;
  }

  splashContainer.innerHTML = `
    <div class="splash-overlay" id="splash-overlay-el">
      <div class="splash-brand-logo">
        <div class="splash-icon-ring">
          <i data-lucide="eye" style="width: 2.2rem; height: 2.2rem;"></i>
        </div>
        <span>${CONFIG.BRAND_NAME}</span>
      </div>

      <div class="splash-progress-track">
        <div class="splash-progress-fill" id="splash-progress-fill"></div>
      </div>
      <div class="splash-status-text" id="splash-status-text">INITIALIZING TELEMETRY ENGINE...</div>
    </div>
  `;

  const fillEl = document.getElementById('splash-progress-fill');
  const statusEl = document.getElementById('splash-status-text');
  const overlayEl = document.getElementById('splash-overlay-el');

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 18) + 12;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (fillEl) fillEl.style.width = '100%';
      if (statusEl) statusEl.textContent = 'TELEMETRY READY';
      setTimeout(() => {
        if (overlayEl) {
          overlayEl.classList.add('fade-out');
          setTimeout(() => {
            sessionStorage.setItem('bitelens_splash_shown', 'true');
            splashContainer.style.display = 'none';
          }, 500);
        }
      }, 300);
    } else {
      if (fillEl) fillEl.style.width = progress + '%';
      if (statusEl) {
        if (progress > 30 && progress < 70) statusEl.textContent = 'LOADING FSSAI INS REPOSITORY...';
        else if (progress >= 70) statusEl.textContent = 'CALIBRATING NOVA SCORING ENGINE...';
      }
    }
  }, 70);
}

document.addEventListener('DOMContentLoaded', renderComponents);
