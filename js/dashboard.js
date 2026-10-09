/* ==========================================================================
   BiteLens Web Application - User Telemetry Dashboard & Journal Engine
   Features:
   1. 100% On-Device LocalStorage Telemetry (zero server auth or tracking)
   2. Real-time Scan History Log with NOVA Tier filtering
   3. Packaged Snack Budget Journal (Calorie, FSSAI Sodium 2000mg, WHO Sugar 25g)
   4. Health Profile synchronization with calculators.js
   5. Dynamic Swap Recommendations
   ========================================================================== */

import { getUserProfile } from './calculators.js';

const SCAN_HISTORY_KEY = 'bitelens_scan_history';

const INITIAL_SAMPLE_SCANS = [
  { id: 1, name: "Roasted Masala Makhana", cat: "Indian Snack", nova: 2, healthScore: 92, goalScore: 90, date: "Today, 11:30 AM", hash: "a7b3...f912" },
  { id: 2, name: "Multigrain Rolled Oats", cat: "Breakfast Cereal", nova: 1, healthScore: 95, goalScore: 92, date: "Yesterday, 4:15 PM", hash: "98c1...e455" },
  { id: 3, name: "Strawberry Flavored Yogurt", cat: "Dairy Dessert", nova: 4, healthScore: 54, goalScore: 62, date: "15 Aug, 8:40 AM", hash: "41d2...b881" },
  { id: 4, name: "Masala Instant Noodles", cat: "Instant Food", nova: 4, healthScore: 32, goalScore: 40, date: "14 Aug, 10:20 PM", hash: "52a6...7109" },
  { id: 5, name: "Whole Grain Sourdough", cat: "Bakery", nova: 1, healthScore: 96, goalScore: 94, date: "12 Aug, 2:05 PM", hash: "c301...aa44" },
  { id: 6, name: "Almond Milk Unsweetened", cat: "Plant Beverage", nova: 1, healthScore: 94, goalScore: 92, date: "10 Aug, 9:10 AM", hash: "89e4...66d2" }
];

const SNACK_JOURNAL_ITEMS = [
  { id: 's1', name: "Instant Noodles (1 Pack)", calories: 380, sodium: 890, sugar: 3 },
  { id: 's2', name: "Carbonated Soft Drink (300ml)", calories: 140, sodium: 35, sugar: 33 },
  { id: 's3', name: "Spiced Potato Chips (50g)", calories: 275, sodium: 420, sugar: 2 },
  { id: 's4', name: "Chocolate Cream Biscuits (4 pcs)", calories: 220, sodium: 140, sugar: 18 },
  { id: 's5', name: "Packaged Mango Drink (250ml)", calories: 150, sodium: 40, sugar: 28 },
  { id: 's6', name: "High Protein Chocolate Bar (60g)", calories: 240, sodium: 180, sugar: 2 },
  { id: 's7', name: "Roasted Masala Makhana (30g)", calories: 110, sodium: 120, sugar: 0 },
  { id: 's8', name: "Sweetened Flavored Yogurt (100g)", calories: 105, sodium: 60, sugar: 14 }
];

export function initDashboard() {
  const profile = getUserProfile() || {
    fullName: "Health Explorer",
    email: "100% On-Device Local Profile",
    age: 25,
    weightGoal: "maintenance",
    targetCalories: 2000,
    tdee: 2000,
    isMinor: false
  };

  populateProfileHUD(profile);
  initScanHistory();
  initSnackJournal(profile);
  bindTabNavigation();

  // Listen for hash changes to activate #journal view
  if (window.location.hash === '#journal') {
    switchDashboardTab('journal');
  }
}

/**
 * Populates User Health Identity Card & Metric Summaries
 */
function populateProfileHUD(profile) {
  const nameHeader = document.getElementById('dash-user-name');
  const profileName = document.getElementById('hud-profile-name');
  const profileEmail = document.getElementById('hud-profile-email');
  const profileAge = document.getElementById('hud-profile-age');
  const profileWeightGoal = document.getElementById('hud-profile-weight-goal');
  const profileTDEE = document.getElementById('hud-profile-tdee');
  const hudPediatric = document.getElementById('hud-pediatric-gate');
  const statCalorieBudget = document.getElementById('stat-user-goal');
  const statGoalName = document.getElementById('stat-goal-name');

  const displayName = profile.fullName || "Health Explorer";
  if (nameHeader) nameHeader.textContent = displayName;
  if (profileName) profileName.textContent = displayName;
  if (profileEmail) profileEmail.textContent = profile.email || "100% On-Device Profile";

  if (profileAge) {
    profileAge.textContent = profile.isMinor ? `Minor (${profile.age || '<18'} yrs - Gated)` : `Adult (${profile.age || '25+'} yrs - Verified)`;
    profileAge.style.color = profile.isMinor ? '#0284C7' : '#166534';
  }

  if (profileWeightGoal) {
    const goalLabels = {
      deficit: "Fat Loss Deficit",
      mild_deficit: "Mild Deficit",
      maintain: "Weight Maintenance",
      maintenance: "Weight Maintenance",
      mild_surplus: "Lean Bulk Surplus",
      surplus: "Muscle Hypertrophy"
    };
    profileWeightGoal.textContent = goalLabels[profile.weightGoal] || "Weight Maintenance";
  }

  if (profileTDEE) {
    profileTDEE.textContent = profile.targetCalories ? `${profile.targetCalories} kcal / day` : '2,000 kcal / day';
  }

  if (hudPediatric) {
    hudPediatric.textContent = profile.isMinor ? 'Active (Deficit Blocked)' : 'Inactive (Adult Mode)';
    hudPediatric.style.color = profile.isMinor ? '#D97706' : '#166534';
  }

  if (statCalorieBudget) {
    statCalorieBudget.textContent = profile.targetCalories ? `${profile.targetCalories.toLocaleString()} kcal / day` : '2,000 kcal / day';
  }

  if (statGoalName) {
    statGoalName.textContent = profile.weightGoal ? `Goal: ${profile.weightGoal}` : "Target Daily Intake";
  }
}

/**
 * Scan Telemetry History Table & Statistics
 */
function initScanHistory() {
  let history = getScanHistory();

  // If completely empty on first visit, seed demo history
  if (!history || history.length === 0) {
    history = INITIAL_DEMO_SCANS;
    saveScanHistory(history);
  }

  updateSummaryStats(history);
  renderHistoryTable(history);

  // Filter select
  const filterSelect = document.getElementById('history-filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const allItems = getScanHistory();
      if (val === 'all') {
        renderHistoryTable(allItems);
      } else {
        const filtered = allItems.filter(item => item.nova === parseInt(val, 10));
        renderHistoryTable(filtered);
      }
    });
  }

  // Clear history button
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear your local scan history?")) {
        localStorage.removeItem(SCAN_HISTORY_KEY);
        updateSummaryStats([]);
        renderHistoryTable([]);
      }
    });
  }
}

function getScanHistory() {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScanHistory(items) {
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to save scan history:", e);
  }
}

function updateSummaryStats(items) {
  const avgEl = document.getElementById('stat-avg-score');
  const countEl = document.getElementById('stat-total-scans');
  const upfEl = document.getElementById('stat-upf-ratio');
  const upfSubEl = document.getElementById('stat-upf-subtext');

  if (!items || items.length === 0) {
    if (avgEl) avgEl.textContent = "--/100";
    if (countEl) countEl.textContent = "0 Scans";
    if (upfEl) upfEl.textContent = "0% UPF";
    if (upfSubEl) upfSubEl.textContent = "No scans recorded yet";
    return;
  }

  const totalScore = items.reduce((acc, curr) => acc + (curr.healthScore || 0), 0);
  const avg = Math.round(totalScore / items.length);

  const upfCount = items.filter(i => i.nova === 4).length;
  const upfPct = Math.round((upfCount / items.length) * 100);

  if (avgEl) avgEl.textContent = `${avg}/100`;
  if (countEl) countEl.textContent = `${items.length} Scans`;
  if (upfEl) upfEl.textContent = `${upfPct}% UPF`;
  if (upfSubEl) upfSubEl.textContent = `${upfCount} of ${items.length} in NOVA Group 4`;
}

function renderHistoryTable(items) {
  const tbody = document.getElementById('scan-history-tbody');
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: var(--color-text-muted);">
          No scans found. Use the camera or barcode scanner in <a href="scan.html" style="color: var(--color-primary); font-weight: 700; text-decoration: underline;">Scan Studio</a> to audit packaged food labels.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(item => {
    let novaBg = '#F0FDF4';
    let novaColor = '#166534';

    if (item.nova === 4) {
      novaBg = '#FEE2E2';
      novaColor = '#991B1B';
    } else if (item.nova === 3) {
      novaBg = '#FFEDD5';
      novaColor = '#9A3412';
    } else if (item.nova === 2) {
      novaBg = '#FEF3C7';
      novaColor = '#92400E';
    }

    const scoreColor = item.healthScore >= 70 ? '#3B7A57' : (item.healthScore >= 50 ? '#D97706' : '#E11D48');

    return `
      <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.15s ease;" onmouseover="this.style.background='#FAF8F5'" onmouseout="this.style.background='transparent'">
        <td style="padding: 0.85rem 0.5rem; font-weight: 700; color: var(--color-text-main);">
          ${item.name}
        </td>
        <td style="padding: 0.85rem 0.5rem; color: var(--color-text-muted); font-size: 0.82rem;">
          ${item.cat}
        </td>
        <td style="padding: 0.85rem 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 700; background: ${novaBg}; color: ${novaColor}; padding: 0.2rem 0.5rem; border-radius: 6px;">
            NOVA Group ${item.nova}
          </span>
        </td>
        <td style="padding: 0.85rem 0.5rem; font-weight: 800; font-family: var(--font-family-display); color: ${scoreColor};">
          ${item.healthScore}/100
        </td>
        <td style="padding: 0.85rem 0.5rem; font-weight: 800; font-family: var(--font-family-display); color: #0284C7;">
          ${item.goalScore || Math.round(item.healthScore * 0.9)}/100
        </td>
        <td style="padding: 0.85rem 0.5rem; color: var(--color-text-muted); font-size: 0.78rem; text-align: right;">
          ${item.date}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Tab Navigation (History vs Journal)
 */
function bindTabNavigation() {
  const btnHistory = document.getElementById('tab-btn-history');
  const btnJournal = document.getElementById('tab-btn-journal');

  if (btnHistory) {
    btnHistory.addEventListener('click', () => {
      switchDashboardTab('history');
      window.history.replaceState(null, '', 'dashboard.html');
    });
  }

  if (btnJournal) {
    btnJournal.addEventListener('click', () => {
      switchDashboardTab('journal');
      window.history.replaceState(null, '', 'dashboard.html#journal');
    });
  }
}

function switchDashboardTab(tab) {
  const btnHistory = document.getElementById('tab-btn-history');
  const btnJournal = document.getElementById('tab-btn-journal');
  const viewHistory = document.getElementById('view-scan-history');
  const viewJournal = document.getElementById('view-snack-journal');

  if (tab === 'journal') {
    btnHistory?.classList.remove('active');
    btnJournal?.classList.add('active');
    if (viewHistory) viewHistory.style.display = 'none';
    if (viewJournal) viewJournal.style.display = 'block';
  } else {
    btnJournal?.classList.remove('active');
    btnHistory?.classList.add('active');
    if (viewJournal) viewJournal.style.display = 'none';
    if (viewHistory) viewHistory.style.display = 'block';
  }
}

/**
 * Packaged Snack Budget Journal Simulator (Merged from snack-budget.js)
 */
function initSnackJournal(profile) {
  const container = document.getElementById('journal-snack-list');
  const calLimitInput = document.getElementById('daily-cal-limit');
  if (!container || !calLimitInput) return;

  if (profile.targetCalories) {
    calLimitInput.value = profile.targetCalories;
  }

  // Render snack checkboxes
  container.innerHTML = SNACK_JOURNAL_ITEMS.map((item, idx) => `
    <label class="journal-snack-item">
      <input type="checkbox" class="journal-item-chk" data-index="${idx}" style="accent-color: var(--color-primary); width: 1.1rem; height: 1.1rem; cursor: pointer;">
      <div style="flex: 1;">
        <div style="font-size: 0.86rem; font-weight: 700; color: var(--color-text-main);">${item.name}</div>
        <div style="font-size: 0.74rem; color: var(--color-text-muted);">
          ${item.calories} kcal • ${item.sodium}mg Na • ${item.sugar}g Sugar
        </div>
      </div>
    </label>
  `).join('');

  const checkboxes = container.querySelectorAll('.journal-item-chk');

  function calculateJournalImpact() {
    const calLimit = parseFloat(calLimitInput.value) || 2000;
    const sodLimit = 2000; // FSSAI 2000mg limit
    const sugLimit = 25;   // WHO 25g guideline

    let totCal = 0;
    let totSod = 0;
    let totSug = 0;

    checkboxes.forEach(chk => {
      if (chk.checked) {
        const item = SNACK_JOURNAL_ITEMS[chk.dataset.index];
        totCal += item.calories;
        totSod += item.sodium;
        totSug += item.sugar;
      }
    });

    const calPct = Math.min(Math.round((totCal / calLimit) * 100), 100);
    const sodPct = Math.min(Math.round((totSod / sodLimit) * 100), 100);
    const sugPct = Math.min(Math.round((totSug / sugLimit) * 100), 100);

    // Calorie Fill
    const calText = document.getElementById('journal-cal-text');
    const calFill = document.getElementById('journal-cal-fill');
    if (calText) calText.textContent = `${totCal.toLocaleString()} / ${calLimit.toLocaleString()} kcal (${Math.round((totCal / calLimit) * 100)}%)`;
    if (calFill) {
      calFill.style.width = `${calPct}%`;
      calFill.style.background = totCal > calLimit ? '#E11D48' : '#166534';
    }

    // Sodium Fill
    const sodText = document.getElementById('journal-sod-text');
    const sodFill = document.getElementById('journal-sod-fill');
    if (sodText) sodText.textContent = `${totSod.toLocaleString()} / 2,000 mg (${Math.round((totSod / sodLimit) * 100)}%)`;
    if (sodFill) {
      sodFill.style.width = `${sodPct}%`;
      sodFill.style.background = totSod > 2000 ? '#E11D48' : (totSod > 1400 ? '#D97706' : '#0284C7');
    }

    // Sugar Fill
    const sugText = document.getElementById('journal-sug-text');
    const sugFill = document.getElementById('journal-sug-fill');
    if (sugText) sugText.textContent = `${totSug} / 25 g (${Math.round((totSug / sugLimit) * 100)}%)`;
    if (sugFill) {
      sugFill.style.width = `${sugPct}%`;
      sugFill.style.background = totSug > 25 ? '#E11D48' : '#D97706';
    }
  }

  calLimitInput.addEventListener('input', calculateJournalImpact);
  checkboxes.forEach(c => c.addEventListener('change', calculateJournalImpact));
}

document.addEventListener('DOMContentLoaded', initDashboard);
