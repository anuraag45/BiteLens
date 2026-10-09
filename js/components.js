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
  'scan.html': 'Live Camera OCR',
  'additives.html': '150+ INS Trie Search',
  'compare.html': 'Food Comparison Matchup',
  'snack-budget.html': 'UPF Daily Allowance Planner',
  'health-calculator.html': 'BMI & Calorie Calculators (Tabs)',
  'learn.html': 'How It Works & Science',
  'faq.html': 'Food Labeling Clarifications',
  'download.html': 'Download Android App (.APK)',
  'app.html': 'Blinkit-Style Grocery UI',
  'dashboard.html': 'Personal Audit & History',
  'about.html': 'Mission, Team & Contact',
  'report.html': 'Indus Academic Report',
  // Backwards-compatible aliases
  'scanner-demo.html': 'Live Camera OCR',
  'additive-decoder.html': '150+ INS Trie Search',
  'bmi-calculator.html': 'BMI Calculator',
  'calorie-calculator.html': 'Calorie & TDEE Calculator',
  'how-it-works.html': 'How BiteLens Works',
  'science.html': 'NOVA & FSSAI Science',
  'contact.html': 'Contact Us',
  'sgp_report.html': 'Indus Academic Report'
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

            <!-- Column 1: Scan & Analyze -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath.includes('scan') || currentPath.includes('additive') || currentPath.includes('compare') || currentPath.includes('budget') || currentPath.includes('calculator') ? 'active' : ''}">
                <i data-lucide="scan" style="width: 0.95rem; height: 0.95rem;"></i> Scan & Analyze <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="scan.html" class="dropdown-item ${currentPath === 'scan.html' || currentPath === 'scanner-demo.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="camera"></i></div>
                  <div>
                    <div class="dropdown-title">Live Camera OCR</div>
                    <div class="dropdown-desc">Real-time optical label scanning & instant score</div>
                  </div>
                </a>
                <a href="additives.html" class="dropdown-item ${currentPath === 'additives.html' || currentPath === 'additive-decoder.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="search"></i></div>
                  <div>
                    <div class="dropdown-title">150+ INS Trie Search</div>
                    <div class="dropdown-desc">Instant FSSAI additive & chemical dictionary</div>
                  </div>
                </a>
                <a href="compare.html" class="dropdown-item ${currentPath === 'compare.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="columns"></i></div>
                  <div>
                    <div class="dropdown-title">Side-by-Side Matchup</div>
                    <div class="dropdown-desc">Compare processing & goal fit across two items</div>
                  </div>
                </a>
                <a href="snack-budget.html" class="dropdown-item ${currentPath === 'snack-budget.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="pie-chart"></i></div>
                  <div>
                    <div class="dropdown-title">UPF Daily Allowance</div>
                    <div class="dropdown-desc">Plan daily calories & ultra-processing thresholds</div>
                  </div>
                </a>
                <a href="health-calculator.html" class="dropdown-item ${currentPath === 'health-calculator.html' || currentPath.includes('calculator') ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="activity"></i></div>
                  <div>
                    <div class="dropdown-title">Health Calculators</div>
                    <div class="dropdown-desc">BMI (Asian cutoffs) + Calorie TDEE tabs</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Column 2: Learn -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath === 'learn.html' || currentPath === 'faq.html' || currentPath === 'how-it-works.html' || currentPath === 'science.html' ? 'active' : ''}">
                <i data-lucide="book-open" style="width: 0.95rem; height: 0.95rem;"></i> Learn <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="learn.html" class="dropdown-item ${currentPath === 'learn.html' || currentPath === 'how-it-works.html' || currentPath === 'science.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="sparkles"></i></div>
                  <div>
                    <div class="dropdown-title">How It Works + Science</div>
                    <div class="dropdown-desc">4-step telemetry lab & NOVA methodology</div>
                  </div>
                </a>
                <a href="faq.html" class="dropdown-item ${currentPath === 'faq.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="help-circle"></i></div>
                  <div>
                    <div class="dropdown-title">Food Labeling FAQ</div>
                    <div class="dropdown-desc">Consumer clarifications & additive safety</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Column 3: Get the App -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath === 'download.html' || currentPath === 'app.html' || currentPath === 'dashboard.html' ? 'active' : ''}" style="color: #059669; font-weight: 800;">
                <i data-lucide="smartphone" style="width: 0.95rem; height: 0.95rem;"></i> Get the App <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="download.html" class="dropdown-item ${currentPath === 'download.html' ? 'active' : ''}" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px;">
                  <div class="dropdown-icon-box" style="background: #10B981; color: #FFFFFF;"><i data-lucide="download"></i></div>
                  <div>
                    <div class="dropdown-title" style="color: #065F46; font-weight: 800;">Direct 1.29 MB APK <span style="font-size: 0.7rem; background: #10B981; color: #fff; padding: 1px 5px; border-radius: 4px; margin-left: 4px;">Android</span></div>
                    <div class="dropdown-desc">Offline scanner container with local assets</div>
                  </div>
                </a>
                <a href="app.html" class="dropdown-item ${currentPath === 'app.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="shopping-bag"></i></div>
                  <div>
                    <div class="dropdown-title">Blinkit-Style Grocery UI</div>
                    <div class="dropdown-desc">Fast browser-based quick commerce scanner</div>
                  </div>
                </a>
                <a href="dashboard.html" class="dropdown-item ${currentPath === 'dashboard.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="layout-dashboard"></i></div>
                  <div>
                    <div class="dropdown-title">Personal Audit & History</div>
                    <div class="dropdown-desc">Scan telemetry records & clean swaps</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Column 4: About -->
            <div class="nav-dropdown-wrapper">
              <span class="nav-link dropdown-trigger ${currentPath === 'about.html' || currentPath === 'contact.html' || currentPath === 'report.html' || currentPath === 'sgp_report.html' ? 'active' : ''}">
                <i data-lucide="info" style="width: 0.95rem; height: 0.95rem;"></i> About <i data-lucide="chevron-down" style="width: 0.85rem; height: 0.85rem;"></i>
              </span>
              <div class="dropdown-menu">
                <a href="about.html" class="dropdown-item ${currentPath === 'about.html' || currentPath === 'contact.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="users"></i></div>
                  <div>
                    <div class="dropdown-title">Mission, Team & Contact</div>
                    <div class="dropdown-desc">Student researchers, guide & inquiries</div>
                  </div>
                </a>
                <a href="report.html" target="_blank" class="dropdown-item ${currentPath === 'report.html' || currentPath === 'sgp_report.html' ? 'active' : ''}">
                  <div class="dropdown-icon-box"><i data-lucide="file-text"></i></div>
                  <div>
                    <div class="dropdown-title">Indus Academic Report</div>
                    <div class="dropdown-desc">Print-ready Software Group Project thesis</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Direct CTA: Download APK (Green Highlight) -->
            <a href="download.html" class="btn btn-primary" style="height: 38px; padding: 0 1.1rem; font-size: 0.85rem; background: linear-gradient(135deg, #10B981, #059669); border-color: #059669; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);" title="Download Android APK (1.29 MB)">
              <i data-lucide="download" style="width: 0.95rem; height: 0.95rem;"></i> Download APK
            </a>

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
          
          <a href="scan.html" class="btn btn-primary mobile-drawer-cta" style="height: 46px; width: 100%; margin-bottom: 1.25rem; font-size: 0.95rem; background: linear-gradient(135deg, #10B981, #059669); border-color: #059669;">
            <i data-lucide="camera"></i> Launch Live Scanner (/scan)
          </a>

          <!-- Group 1: Scan & Analyze -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Scan & Analyze</div>
            <a href="scan.html" class="mobile-nav-link ${currentPath === 'scan.html' || currentPath === 'scanner-demo.html' ? 'active' : ''}">
              <i data-lucide="camera"></i> /scan &bull; Live Camera OCR
            </a>
            <a href="additives.html" class="mobile-nav-link ${currentPath === 'additives.html' || currentPath === 'additive-decoder.html' ? 'active' : ''}">
              <i data-lucide="search"></i> /additives &bull; 150+ INS Trie Search
            </a>
            <a href="compare.html" class="mobile-nav-link ${currentPath === 'compare.html' ? 'active' : ''}">
              <i data-lucide="columns"></i> /compare &bull; Side-by-Side Matchup
            </a>
            <a href="snack-budget.html" class="mobile-nav-link ${currentPath === 'snack-budget.html' ? 'active' : ''}">
              <i data-lucide="pie-chart"></i> /snack-budget &bull; UPF Daily Allowance
            </a>
            <a href="health-calculator.html" class="mobile-nav-link ${currentPath === 'health-calculator.html' || currentPath.includes('calculator') ? 'active' : ''}">
              <i data-lucide="activity"></i> /health-calculator &bull; BMI + Calorie (Tabs)
            </a>
          </div>

          <!-- Group 2: Learn -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Learn</div>
            <a href="learn.html" class="mobile-nav-link ${currentPath === 'learn.html' || currentPath === 'how-it-works.html' || currentPath === 'science.html' ? 'active' : ''}">
              <i data-lucide="sparkles"></i> /learn &bull; How It Works + Science
            </a>
            <a href="faq.html" class="mobile-nav-link ${currentPath === 'faq.html' ? 'active' : ''}">
              <i data-lucide="help-circle"></i> /faq &bull; Food Labeling Clarifications
            </a>
          </div>

          <!-- Group 3: Get the App -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">Get the App</div>
            <a href="download.html" class="mobile-nav-link ${currentPath === 'download.html' ? 'active' : ''}" style="color: #059669; font-weight: 800; background: rgba(16, 185, 129, 0.08); border-radius: 8px;">
              <i data-lucide="download"></i> /download &bull; Direct 1.29 MB APK
            </a>
            <a href="app.html" class="mobile-nav-link ${currentPath === 'app.html' ? 'active' : ''}" style="color: var(--color-primary); font-weight: 700;">
              <i data-lucide="shopping-bag"></i> /app &bull; Blinkit-Style Grocery UI
            </a>
            <a href="dashboard.html" class="mobile-nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">
              <i data-lucide="layout-dashboard"></i> /dashboard &bull; Personal Audit & History
            </a>
          </div>

          <!-- Group 4: About -->
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-title">About</div>
            <a href="about.html" class="mobile-nav-link ${currentPath === 'about.html' || currentPath === 'contact.html' ? 'active' : ''}">
              <i data-lucide="users"></i> /about &bull; Mission, Team & Contact
            </a>
            <a href="report.html" target="_blank" class="mobile-nav-link ${currentPath === 'report.html' || currentPath === 'sgp_report.html' ? 'active' : ''}">
              <i data-lucide="file-text"></i> /report &bull; Indus Academic Report
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
              <div class="footer-col-title">Scan & Analyze</div>
              <ul class="footer-link-list">
                <li><a href="scan.html">/scan &bull; Live Camera OCR</a></li>
                <li><a href="additives.html">/additives &bull; 150+ INS Search</a></li>
                <li><a href="compare.html">/compare &bull; Side-by-Side Matchup</a></li>
                <li><a href="snack-budget.html">/snack-budget &bull; UPF Allowance</a></li>
                <li><a href="health-calculator.html">/health-calculator &bull; BMI + Calorie</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Learn</div>
              <ul class="footer-link-list">
                <li><a href="learn.html">/learn &bull; How It Works + Science</a></li>
                <li><a href="faq.html">/faq &bull; Labeling Clarifications</a></li>
                <li><a href="learn.html#fssai">FSSAI Regulation Guidance</a></li>
                <li><a href="learn.html#citations">Academic Research Citations</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Get the App</div>
              <ul class="footer-link-list">
                <li><a href="download.html" style="color: #34D399; font-weight: 700;">/download &bull; Android APK (1.29 MB)</a></li>
                <li><a href="app.html">/app &bull; Blinkit-Style Grocery UI</a></li>
                <li><a href="dashboard.html">/dashboard &bull; Personal Audit & History</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">About</div>
              <ul class="footer-link-list">
                <li><a href="about.html">/about &bull; Mission, Team & Contact</a></li>
                <li><a href="report.html" target="_blank">/report &bull; Indus Academic Report</a></li>
                <li><a href="about.html#contact">Send Feedback</a></li>
                <li><span style="color: #64748B;">Version 2.4.0 (Go Gin Backend)</span></li>
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
              <a href="report.html" target="_blank" style="color: #94A3B8; font-size: 0.85rem;">Indus University SGP Report</a>
              <a href="about.html" style="color: #94A3B8; font-size: 0.85rem;">Project Credits & Team</a>
              <a href="about.html#contact" style="color: #94A3B8; font-size: 0.85rem;">Contact & Feedback</a>
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
