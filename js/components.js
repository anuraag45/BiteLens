/* ==========================================================================
   BiteLens Web Application - Shared Components & Mobile Navigation Drawer
   Features:
   - Streamlined, clean navbar for desktop & tablet
   - Full Mobile Slide-in Drawer with Backdrop Overlay & Close Button
   - Escape Key & Tap-outside Dismissal
   - Universal "← Back" and Breadcrumb navigation on all subpages
   - Touch targets >= 44x44px per WCAG / Apple guidelines
   - Landing-page-only BiteLens splash loading screen
   ========================================================================== */

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
  UserCheck,
  BookOpen,
  FileText,
  ArrowLeft,
  ChevronLeft,
  Home,
  Smartphone,
  Download,
  X
} from 'lucide';

const PAGE_TITLES = {
  'download.html': 'Download Android App',
  'app.html': 'Blinkit-Style Mobile App',
  'features.html': 'App Features',
  'how-it-works.html': 'How BiteLens Works',
  'bmi-calculator.html': 'BMI Calculator',
  'calorie-calculator.html': 'Calorie & TDEE Calculator',
  'snack-budget.html': 'Snack Budget Simulator',
  'scanner-demo.html': 'Live Camera Scanner',
  'additive-decoder.html': 'INS Additive Decoder',
  'compare.html': 'Food Comparison Tool',
  'dashboard.html': 'Member Dashboard',
  'science.html': 'NOVA & FSSAI Science',
  'faq.html': 'Food Labeling FAQ',
  'about.html': 'About Team',
  'contact.html': 'Contact Us',
  'sgp_report.html': 'Indus SGP Project Report'
};

export function renderComponents() {
  initCyberBackground();
  renderBiteLensSplashScreen();

  const headerContainer = document.getElementById('site-header-container');
  const footerContainer = document.getElementById('site-footer-container');

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = getUserSession();

  if (headerContainer) {
    const authNavHTML = currentUser ? `
      <!-- Logged-In User Profile Chip (Desktop) -->
      <div style="display: inline-flex; align-items: center; gap: 0.55rem; background: #FFFFFF; border: 1.5px solid rgba(59, 122, 87, 0.35); padding: 0.3rem 0.85rem; border-radius: var(--radius-pill); height: 40px; box-shadow: var(--shadow-sm);">
        <span style="font-size: 1.05rem;">👤</span>
        <a href="dashboard.html" style="display: flex; flex-direction: column; text-decoration: none;">
          <span style="font-size: 0.82rem; font-weight: 800; color: var(--color-primary); line-height: 1.1;">
            ${currentUser.fullName || currentUser.email?.split('@')[0]}
          </span>
          <span style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 600;">
            ${currentUser.weightGoal || 'Dashboard'}
          </span>
        </a>
        <button id="logout-btn" style="background: none; border: none; color: #E11D48; cursor: pointer; padding: 0 0.2rem; margin-left: 0.25rem; display: flex; align-items: center; min-width: 32px; min-height: 32px; justify-content: center;" title="Logout">
          <i data-lucide="log-out" style="width: 1rem; height: 1rem;"></i>
        </button>
      </div>
    ` : `
      <!-- App CTAs (Desktop) -->
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <a href="download.html" class="btn btn-primary" style="height: 38px; padding: 0 1.1rem; font-size: 0.88rem; background: linear-gradient(135deg, #10B981, #059669); border-color: #059669;">
          <i data-lucide="download" style="width: 0.95rem; height: 0.95rem;"></i> Download APK
        </a>
      </div>
    `;

    const mobileAuthHTML = currentUser ? `
      <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="font-size: 1.5rem; width: 44px; height: 44px; background: rgba(59, 122, 87, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">👤</div>
            <div>
              <div style="font-weight: 800; font-family: var(--font-family-display); font-size: 0.95rem; color: var(--color-text-main);">
                ${currentUser.fullName || currentUser.email?.split('@')[0]}
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);">
                ${currentUser.email}
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <a href="dashboard.html" class="btn btn-outline" style="flex: 1; height: 44px; font-size: 0.88rem;">
            <i data-lucide="layout-dashboard"></i> Dashboard
          </a>
          <button id="mobile-logout-btn" class="btn btn-outline" style="height: 44px; color: #E11D48; border-color: #FCA5A5; padding: 0 1rem;">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
        <a href="download.html" class="btn btn-primary" style="height: 46px; font-size: 0.95rem; width: 100%; background: linear-gradient(135deg, #10B981, #059669); border-color: #059669;">
          <i data-lucide="download"></i> Download Android App (.APK)
        </a>
        <a href="app.html" class="btn btn-outline" style="height: 46px; font-size: 0.95rem; width: 100%;">
          <i data-lucide="smartphone"></i> Launch Web App
        </a>
      </div>
    `;

    headerContainer.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          
          <!-- Brand Logo -->
          <a href="index.html" class="brand-logo">
            <div class="brand-logo-icon">
              <i data-lucide="eye"></i>
            </div>
            <span>${CONFIG.BRAND_NAME}</span>
          </a>

          <!-- Mobile Hamburger Toggle Button (Minimum 44x44px touch target) -->
          <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Open navigation menu" aria-expanded="false">
            <i data-lucide="menu"></i>
          </button>

          <!-- Main Desktop Navigation Bar -->
          <nav class="main-nav" id="main-nav">
            
            <a href="index.html" class="nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
              Home
            </a>

            <!-- Dropdown 1: Scan & Analysis Studio -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath.includes('scanner') || currentPath.includes('decoder') || currentPath.includes('compare') || currentPath.includes('budget') ? 'active' : ''}">
                <i data-lucide="scan" style="width: 0.95rem; height: 0.95rem;"></i> Scan & Tools <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="scanner-demo.html" class="dropdown-item ${currentPath === 'scanner-demo.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="camera"></i></div>
                  <div>
                    <div class="dropdown-title">Live Camera Scanner</div>
                    <div class="dropdown-desc">Optical label OCR & instant scoring</div>
                  </div>
                </a>
                <a href="additive-decoder.html" class="dropdown-item ${currentPath === 'additive-decoder.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="search"></i></div>
                  <div>
                    <div class="dropdown-title">INS Additive Decoder</div>
                    <div class="dropdown-desc">Trie-indexed FSSAI chemical dictionary</div>
                  </div>
                </a>
                <a href="compare.html" class="dropdown-item ${currentPath === 'compare.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="columns"></i></div>
                  <div>
                    <div class="dropdown-title">Food Comparison</div>
                    <div class="dropdown-desc">Side-by-side processing & goal breakdown</div>
                  </div>
                </a>
                <a href="snack-budget.html" class="dropdown-item ${currentPath === 'snack-budget.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="pie-chart"></i></div>
                  <div>
                    <div class="dropdown-title">Snack Budget Simulator</div>
                    <div class="dropdown-desc">Plan daily calories & UPF limits</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Dropdown 2: Calculators -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath.includes('calculator') ? 'active' : ''}">
                <i data-lucide="activity" style="width: 0.95rem; height: 0.95rem;"></i> Calculators <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="bmi-calculator.html" class="dropdown-item ${currentPath === 'bmi-calculator.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="activity"></i></div>
                  <div>
                    <div class="dropdown-title">BMI Calculator</div>
                    <div class="dropdown-desc">Standard WHO & Asian-specific criteria</div>
                  </div>
                </a>
                <a href="calorie-calculator.html" class="dropdown-item ${currentPath === 'calorie-calculator.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="flame"></i></div>
                  <div>
                    <div class="dropdown-title">Calorie & TDEE Calculator</div>
                    <div class="dropdown-desc">Mifflin-St Jeor metabolic expenditure</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Dropdown 3: Learn & Science -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath === 'how-it-works.html' || currentPath === 'science.html' || currentPath === 'faq.html' || currentPath === 'about.html' ? 'active' : ''}">
                <i data-lucide="book-open" style="width: 0.95rem; height: 0.95rem;"></i> Explore <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="how-it-works.html" class="dropdown-item ${currentPath === 'how-it-works.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="sparkles"></i></div>
                  <div>
                    <div class="dropdown-title">How BiteLens Works</div>
                    <div class="dropdown-desc">Interactive 4-step telemetry laboratory</div>
                  </div>
                </a>
                <a href="science.html" class="dropdown-item ${currentPath === 'science.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="flask-conical"></i></div>
                  <div>
                    <div class="dropdown-title">NOVA & FSSAI Science</div>
                    <div class="dropdown-desc">Scientific thresholds & nutrient matrix</div>
                  </div>
                </a>
                <a href="faq.html" class="dropdown-item ${currentPath === 'faq.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="help-circle"></i></div>
                  <div>
                    <div class="dropdown-title">Food Labeling FAQ</div>
                    <div class="dropdown-desc">Consumer myth busting & additive safety</div>
                  </div>
                </a>
                <a href="about.html" class="dropdown-item ${currentPath === 'about.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="user"></i></div>
                  <div>
                    <div class="dropdown-title">About Team</div>
                    <div class="dropdown-desc">Student researchers & project mission</div>
                  </div>
                </a>
                <a href="sgp_report.html" target="_blank" class="dropdown-item">
                  <div class="dropdown-icon-box"><i data-lucide="file-text"></i></div>
                  <div>
                    <div class="dropdown-title">Indus SGP Report</div>
                    <div class="dropdown-desc">Academic report & printable PDF format</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Direct Link: Blinkit-Style Mobile App -->
            <a href="app.html" class="nav-link ${currentPath === 'app.html' ? 'active' : ''}" style="color: var(--color-primary); font-weight: 800; background: rgba(59, 122, 87, 0.08); border-radius: var(--radius-pill); padding: 0.35rem 0.85rem; border: 1px solid rgba(59, 122, 87, 0.25);">
              <i data-lucide="smartphone" style="width: 0.95rem; height: 0.95rem;"></i> Web App
            </a>

            <!-- Direct Link: Download APK -->
            <a href="download.html" class="nav-link ${currentPath === 'download.html' ? 'active' : ''}" style="color: #059669; font-weight: 800; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-pill); padding: 0.35rem 0.85rem; border: 1px solid rgba(16, 185, 129, 0.35);" title="Download Android APK">
              <i data-lucide="download" style="width: 0.95rem; height: 0.95rem;"></i> Android APK
            </a>

            <!-- Direct Link: Dashboard -->
            <a href="dashboard.html" class="nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">
              <i data-lucide="layout-dashboard" style="width: 0.95rem; height: 0.95rem;"></i> Dashboard
            </a>

            <!-- Authentication Controls (Desktop) -->
            ${authNavHTML}

          </nav>
        </div>
      </header>

      <!-- Slide-In Mobile Navigation Drawer & Backdrop -->
      <div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop"></div>
      <aside class="mobile-drawer" id="mobile-drawer" aria-label="Mobile Navigation Drawer" aria-hidden="true">
        <div class="mobile-drawer-header">
          <a href="index.html" class="brand-logo" style="font-size: 1.35rem;">
            <div class="brand-logo-icon" style="width: 34px; height: 34px;">
              <i data-lucide="eye" style="width: 1.1rem; height: 1.1rem;"></i>
            </div>
            <span>${CONFIG.BRAND_NAME}</span>
          </a>
          <button class="mobile-drawer-close" id="mobile-drawer-close" aria-label="Close navigation menu">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="mobile-drawer-content">
          
          <a href="scanner-demo.html" class="btn btn-primary mobile-drawer-cta" style="height: 46px; width: 100%; margin-bottom: 1.25rem; font-size: 0.95rem;">
            <i data-lucide="camera"></i> Launch Live Scanner
          </a>

          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Navigation</div>
            <a href="index.html" class="mobile-nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
              <i data-lucide="home"></i> Home Overview
            </a>
            <a href="download.html" class="mobile-nav-link ${currentPath === 'download.html' ? 'active' : ''}" style="color: #059669; font-weight: 800;">
              <i data-lucide="download"></i> Download Android App (.APK)
            </a>
            <a href="app.html" class="mobile-nav-link ${currentPath === 'app.html' ? 'active' : ''}" style="color: var(--color-primary); font-weight: 700;">
              <i data-lucide="smartphone"></i> Blinkit Web App
            </a>
            <a href="dashboard.html" class="mobile-nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">
              <i data-lucide="layout-dashboard"></i> Member Dashboard
            </a>
          </div>

          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Scan & Telemetry Tools</div>
            <a href="scanner-demo.html" class="mobile-nav-link ${currentPath === 'scanner-demo.html' ? 'active' : ''}">
              <i data-lucide="camera"></i> Live Camera Scanner
            </a>
            <a href="additive-decoder.html" class="mobile-nav-link ${currentPath === 'additive-decoder.html' ? 'active' : ''}">
              <i data-lucide="search"></i> INS Additive Decoder
            </a>
            <a href="compare.html" class="mobile-nav-link ${currentPath === 'compare.html' ? 'active' : ''}">
              <i data-lucide="columns"></i> Food Comparison Tool
            </a>
            <a href="snack-budget.html" class="mobile-nav-link ${currentPath === 'snack-budget.html' ? 'active' : ''}">
              <i data-lucide="pie-chart"></i> Snack Budget Simulator
            </a>
          </div>

          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Health Calculators</div>
            <a href="bmi-calculator.html" class="mobile-nav-link ${currentPath === 'bmi-calculator.html' ? 'active' : ''}">
              <i data-lucide="activity"></i> BMI Calculator (Asian Cutoffs)
            </a>
            <a href="calorie-calculator.html" class="mobile-nav-link ${currentPath === 'calorie-calculator.html' ? 'active' : ''}">
              <i data-lucide="flame"></i> Calorie & TDEE Calculator
            </a>
          </div>

          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Learn & Science</div>
            <a href="how-it-works.html" class="mobile-nav-link ${currentPath === 'how-it-works.html' ? 'active' : ''}">
              <i data-lucide="sparkles"></i> How BiteLens Works
            </a>
            <a href="features.html" class="mobile-nav-link ${currentPath === 'features.html' ? 'active' : ''}">
              <i data-lucide="scan-line"></i> Features Overview
            </a>
            <a href="science.html" class="mobile-nav-link ${currentPath === 'science.html' ? 'active' : ''}">
              <i data-lucide="flask-conical"></i> NOVA & FSSAI Science
            </a>
            <a href="faq.html" class="mobile-nav-link ${currentPath === 'faq.html' ? 'active' : ''}">
              <i data-lucide="help-circle"></i> Food Labeling FAQ
            </a>
            <a href="about.html" class="mobile-nav-link ${currentPath === 'about.html' ? 'active' : ''}">
              <i data-lucide="user"></i> About Team & Mission
            </a>
            <a href="contact.html" class="mobile-nav-link ${currentPath === 'contact.html' ? 'active' : ''}">
              <i data-lucide="mail"></i> Contact Us
            </a>
            <a href="sgp_report.html" target="_blank" class="mobile-nav-link">
              <i data-lucide="file-text"></i> Indus SGP Project Report
            </a>
          </div>

          ${mobileAuthHTML}

        </div>
      </aside>
    `;
  }

  // Inject Breadcrumb & Back navigation on all sub-pages
  if (currentPath !== 'index.html' && currentPath !== '' && currentPath !== 'sgp_report.html') {
    const mainEl = document.querySelector('main');
    if (mainEl && !document.getElementById('subpage-nav-bar')) {
      const pageTitle = PAGE_TITLES[currentPath] || 'Page';
      const navBar = document.createElement('div');
      navBar.id = 'subpage-nav-bar';
      navBar.className = 'container';
      navBar.innerHTML = `
        <div class="subpage-back-nav">
          <button type="button" class="back-nav-btn" id="subpage-back-btn" aria-label="Go back to previous page">
            <i data-lucide="arrow-left" style="width: 0.95rem; height: 0.95rem;"></i> Back
          </button>
          <div class="breadcrumb-trail">
            <a href="index.html"><i data-lucide="home" style="width: 0.85rem; height: 0.85rem; vertical-align: middle;"></i> Home</a>
            <span>/</span>
            <span class="breadcrumb-current">${pageTitle}</span>
          </div>
        </div>
      `;
      mainEl.insertBefore(navBar, mainEl.firstChild);

      const backBtn = document.getElementById('subpage-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = 'index.html';
          }
        });
      }
    }
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
                <li><a href="download.html" style="color: #34D399; font-weight: 700;">📲 Download Android (.APK)</a></li>
                <li><a href="app.html">Blinkit Mobile Web App</a></li>
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
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
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
      Search, PieChart, HelpCircle, ArrowRight, ShieldAlert, LogOut,
      Eye, Columns, LayoutDashboard, Camera, View, UploadCloud,
      RefreshCw, Scan, History, Barcode, AlertTriangle, UserCheck, BookOpen,
      FileText, ArrowLeft, ChevronLeft, Home, Smartphone, Download, X
    }
  });

  // Mobile Drawer Toggle Logic (Open, Close, Backdrop Click, Escape Key)
  const mobileToggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const drawerClose = document.getElementById('mobile-drawer-close');

  function openMobileDrawer() {
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-drawer-open');
    }
  }

  function closeMobileDrawer() {
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-drawer-open');
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileDrawer);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeMobileDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileDrawer);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeMobileDrawer();
    }
  });

  // Close drawer automatically when any mobile nav link is tapped
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // Logout listeners
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = 'index.html';
  };

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

function renderBiteLensSplashScreen() {
  const splashContainer = document.getElementById('bitelens-splash-screen');
  if (!splashContainer) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  // ONLY render splash on the landing page!
  if (currentPath !== 'index.html' && currentPath !== '') {
    splashContainer.style.display = 'none';
    return;
  }

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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', renderComponents);
}
