/* ==========================================================================
   BiteLens Web Application - Shared Components & Mobile Navigation
   Features:
   - Modern accessible desktop navigation header
   - Mobile Bottom Tab Bar (Scan · Tools · Learn · Journal) replacing cumbersome drawers
   - Zero layout shift: hydration of pre-rendered build-time markup
   - Privacy-first: local profile chip, zero external telemetry
   - PWA Service Worker automatic lifecycle registration
   - Instant page prefetch for cross-document @view-transition
   - Accessible color contrast compliant with WCAG AA/AAA
   ========================================================================== */

import { CONFIG } from './config.js';
import { initCyberBackground } from './cyber-background.js';
import { getUserProfile } from './calculators.js';
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
  Smartphone, 
  Download, 
  X, 
  Scale,
  Lock,
  Code,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Zap,
  Plus,
  PlusCircle,
  WifiOff,
  Share2
} from 'lucide';

/**
 * Renders or hydrates global layout components (Header, Footer, Mobile Bottom Bar).
 */
export function renderComponents() {
  initCyberBackground();

  const headerContainer = document.getElementById('site-header-container');
  const footerContainer = document.getElementById('site-footer-container');

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const profile = getUserProfile();

  // 1. Header Rendering / Hydration
  if (headerContainer) {
    const existingHeader = headerContainer.querySelector('.site-header');
    if (!existingHeader) {
      headerContainer.innerHTML = `
        <header class="site-header">
          <div class="container header-inner" style="display: flex; align-items: center; justify-content: space-between; height: 68px;">
            <a href="index.html" class="brand-logo" style="text-decoration: none;">
              <div class="brand-logo-icon">
                <i data-lucide="eye"></i>
              </div>
              <span>${CONFIG.BRAND_NAME}</span>
            </a>

            <nav class="main-nav" id="main-nav" style="display: flex; align-items: center; gap: 0.4rem;">
              <a href="index.html" class="nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">Home</a>
              <a href="scan.html" class="nav-link ${currentPath === 'scan.html' ? 'active' : ''}">
                <i data-lucide="camera" style="width: 1rem; height: 1rem;"></i> Scan Label
              </a>
              <a href="additives.html" class="nav-link ${currentPath === 'additives.html' ? 'active' : ''}">Additives</a>
              <a href="compare.html" class="nav-link ${currentPath === 'compare.html' ? 'active' : ''}">Compare</a>
              <a href="health-calculator.html" class="nav-link ${currentPath === 'health-calculator.html' ? 'active' : ''}">Profile & Calculator</a>
              <a href="learn.html" class="nav-link ${currentPath === 'learn.html' ? 'active' : ''}">Learn & Science</a>
              <a href="dashboard.html" class="nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">Journal</a>
              <a href="about.html" class="nav-link ${currentPath === 'about.html' ? 'active' : ''}">About</a>
            </nav>

            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div id="header-user-action" style="display: flex; align-items: center; gap: 0.65rem;">
                <a href="download.html" class="btn btn-primary" style="height: 38px; padding: 0 1rem; font-size: 0.85rem; border-radius: var(--radius-pill); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
                  <i data-lucide="download" style="width: 0.95rem; height: 0.95rem;"></i> App APK
                </a>
              </div>
              <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Open navigation menu" style="cursor: pointer;">
                <i data-lucide="menu"></i>
              </button>
            </div>
          </div>
        </header>
      `;
    }

    // Hydrate dynamic user goal badge if profile exists in on-device storage
    const actionContainer = headerContainer.querySelector('#header-user-action');
    if (actionContainer && profile) {
      actionContainer.innerHTML = `
        <a href="health-calculator.html" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem; background: #FFFFFF; border: 1.5px solid rgba(59, 122, 87, 0.3); padding: 0.3rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">
          <span>👤</span>
          <span>${profile.targetCalories || 2000} kcal goal</span>
        </a>
      `;
    }
  }

  // 2. Mobile Drawer Hydration (if not present)
  if (!document.getElementById('mobile-drawer')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'mobile-drawer-backdrop';
    backdrop.className = 'mobile-drawer-backdrop';

    const drawer = document.createElement('aside');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-label', 'Mobile Navigation Menu');
    drawer.innerHTML = `
      <div class="mobile-drawer-header">
        <a href="index.html" class="brand-logo" style="text-decoration: none;">
          <div class="brand-logo-icon">
            <i data-lucide="eye"></i>
          </div>
          <span>${CONFIG.BRAND_NAME}</span>
        </a>
        <button class="mobile-drawer-close" id="mobile-drawer-close" aria-label="Close menu">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="mobile-drawer-content">
        <div class="mobile-nav-group">
          <span class="mobile-nav-group-title">Core Scanning</span>
          <a href="index.html" class="mobile-nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
            <i data-lucide="eye"></i> Home Overview
          </a>
          <a href="scan.html" class="mobile-nav-link ${currentPath === 'scan.html' ? 'active' : ''}">
            <i data-lucide="camera"></i> Optical Label Scanner
          </a>
          <a href="dashboard.html" class="mobile-nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">
            <i data-lucide="layout-dashboard"></i> Scan History & Journal
          </a>
        </div>

        <div class="mobile-nav-group">
          <span class="mobile-nav-group-title">Analysis & Research</span>
          <a href="additives.html" class="mobile-nav-link ${currentPath === 'additives.html' ? 'active' : ''}">
            <i data-lucide="flask-conical"></i> FSSAI Additives Directory
          </a>
          <a href="compare.html" class="mobile-nav-link ${currentPath === 'compare.html' ? 'active' : ''}">
            <i data-lucide="scale"></i> Product Matchup & Compare
          </a>
          <a href="health-calculator.html" class="mobile-nav-link ${currentPath === 'health-calculator.html' ? 'active' : ''}">
            <i data-lucide="activity"></i> BMI & Calorie Calculator
          </a>
          <a href="learn.html" class="mobile-nav-link ${currentPath === 'learn.html' ? 'active' : ''}">
            <i data-lucide="book-open"></i> NOVA Science & Guides
          </a>
        </div>

        <div class="mobile-nav-group">
          <span class="mobile-nav-group-title">Project & Download</span>
          <a href="download.html" class="mobile-nav-link ${currentPath === 'download.html' ? 'active' : ''}">
            <i data-lucide="download"></i> Download Android APK
          </a>
          <a href="about.html" class="mobile-nav-link ${currentPath === 'about.html' ? 'active' : ''}">
            <i data-lucide="info"></i> About & Mission
          </a>
          <a href="report.html" class="mobile-nav-link ${currentPath === 'report.html' ? 'active' : ''}">
            <i data-lucide="file-text"></i> Technical Report
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  // Bind Drawer Toggle handlers
  const drawerToggleBtn = document.getElementById('mobile-nav-toggle');
  const drawerCloseBtn = document.getElementById('mobile-drawer-close');
  const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobileDrawer = document.getElementById('mobile-drawer');

  const openDrawer = () => {
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('open');
    document.body.classList.add('mobile-drawer-open');
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('open');
    document.body.classList.remove('mobile-drawer-open');
  };

  drawerToggleBtn?.addEventListener('click', openDrawer);
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  mobileDrawer?.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 3. Mobile Bottom Tab Bar Hydration
  if (!document.getElementById('site-mobile-tab-bar')) {
    const mobileTabBar = document.createElement('nav');
    mobileTabBar.id = 'site-mobile-tab-bar';
    mobileTabBar.className = 'mobile-tab-bar';
    mobileTabBar.setAttribute('aria-label', 'Mobile Navigation Tabs');
    mobileTabBar.innerHTML = `
      <a href="index.html" class="mobile-tab-item ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
        <i data-lucide="eye"></i>
        <span>Home</span>
      </a>
      <a href="scan.html" class="mobile-tab-item ${currentPath === 'scan.html' ? 'active' : ''}">
        <i data-lucide="camera"></i>
        <span>Scan</span>
      </a>
      <a href="additives.html" class="mobile-tab-item ${currentPath === 'additives.html' ? 'active' : ''}">
        <i data-lucide="flask-conical"></i>
        <span>Additives</span>
      </a>
      <a href="compare.html" class="mobile-tab-item ${currentPath === 'compare.html' ? 'active' : ''}">
        <i data-lucide="scale"></i>
        <span>Compare</span>
      </a>
      <button type="button" class="mobile-tab-item" id="mobile-tab-menu-btn" style="background: none; border: none; cursor: pointer; padding: 0; font-family: inherit;">
        <i data-lucide="menu"></i>
        <span>Menu</span>
      </button>
    `;
    document.body.appendChild(mobileTabBar);
  }

  // Bind bottom bar menu button to open drawer
  const tabMenuBtn = document.getElementById('mobile-tab-menu-btn');
  tabMenuBtn?.addEventListener('click', openDrawer);

  // 3. Footer Hydration (if not present)
  if (footerContainer && !footerContainer.querySelector('.site-footer')) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2.5rem;">
            <div>
              <div class="brand-logo" style="margin-bottom: 0.75rem;">
                <div class="brand-logo-icon"><i data-lucide="eye"></i></div>
                <span>${CONFIG.BRAND_NAME}</span>
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
            <div>© 2026 ${CONFIG.BRAND_NAME}. Independent Food Literacy Project.</div>
            <div>Built with Vite, Vanilla JS, and Go.</div>
          </div>
        </div>
      </footer>
    `;
  }

  // 4. Initialize Lucide Icons
  createIcons({
    icons: {
      ScanLine, Sparkles, ShieldCheck, Target, Activity, Flame, FlaskConical,
      Database, User, Mail, ChevronDown, Menu, Info, CheckCircle2, Cpu,
      Search, PieChart, HelpCircle, ArrowRight, ShieldAlert,
      Eye, Columns, LayoutDashboard, Camera, View, UploadCloud,
      RefreshCw, Scan, History, Barcode, AlertTriangle, UserCheck, BookOpen,
      FileText, Smartphone, Download, X, Scale, Lock,
      Code, ChevronLeft, ChevronRight, Sliders, Zap, Plus, PlusCircle, WifiOff, Share2
    }
  });

  // 5. Initialize PWA Service Worker & Page Prefetching
  registerServiceWorker();
  initPagePrefetch();
}

/**
 * Registers PWA Service Worker for offline capabilities.
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          // Service worker registered
        })
        .catch(err => {
          // Graceful fallback for non-sw environments
        });
    });
  }
}

/**
 * Prefetches internal documents on link hover / touch to accelerate @view-transition navigation.
 */
export function initPagePrefetch() {
  const links = document.querySelectorAll('a[href$=".html"], a[href="./"], a[href="/"]');
  const prefetched = new Set();

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    const cleanHref = href.split('#')[0];

    const prefetch = () => {
      if (prefetched.has(cleanHref)) return;
      prefetched.add(cleanHref);
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = cleanHref;
      document.head.appendChild(prefetchLink);
    };

    link.addEventListener('mouseenter', prefetch, { passive: true, once: true });
    link.addEventListener('touchstart', prefetch, { passive: true, once: true });
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', renderComponents);
}
