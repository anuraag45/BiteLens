/* ==========================================================================
   BiteLens Web Application - User Telemetry Dashboard Logic
   ========================================================================== */

import { getUserSession } from './auth.js';
import { scanAPI } from './api.js';

const MOCK_SCAN_HISTORY = [
  { id: 1, name: "Roasted Masala Makhana", cat: "Indian Snack", nova: 2, healthScore: 92, goalScore: 90, date: "Today, 11:30 AM", hash: "a7b3...f912" },
  { id: 2, name: "Multigrain Oats Crisp", cat: "Breakfast Cereal", nova: 3, healthScore: 72, goalScore: 88, date: "Yesterday, 4:15 PM", hash: "98c1...e455" },
  { id: 3, name: "Berry Flavored Yogurt", cat: "Dairy Dessert", nova: 4, healthScore: 54, goalScore: 62, date: "15 Aug, 8:40 AM", hash: "41d2...b881" },
  { id: 4, name: "Masala Instant Noodles", cat: "Instant Food", nova: 4, healthScore: 32, goalScore: 40, date: "14 Aug, 10:20 PM", hash: "52a6...7109" },
  { id: 5, name: "Whole Grain Sourdough", cat: "Bakery", nova: 1, healthScore: 96, goalScore: 94, date: "12 Aug, 2:05 PM", hash: "c301...aa44" },
  { id: 6, name: "Almond Milk Unsweetened", cat: "Plant Beverage", nova: 1, healthScore: 94, goalScore: 92, date: "10 Aug, 9:10 AM", hash: "89e4...66d2" }
];

export function initDashboard() {
  const user = getUserSession() || {
    fullName: "Health Explorer",
    email: "explorer@bitelens.app",
    weightGoal: "Fat Loss (Deficit)",
    muscleGoal: "High Protein",
    isMinor: false
  };

  // Populate User Info
  const nameHeader = document.getElementById('dash-user-name');
  const profileName = document.getElementById('hud-profile-name');
  const profileEmail = document.getElementById('hud-profile-email');
  const profileAge = document.getElementById('hud-profile-age');
  const profileWeightGoal = document.getElementById('hud-profile-weight-goal');
  const profileMuscleGoal = document.getElementById('hud-profile-muscle-goal');

  if (nameHeader) nameHeader.textContent = user.fullName || "Member";
  if (profileName) profileName.textContent = user.fullName || "Member";
  if (profileEmail) profileEmail.textContent = user.email || "member@bitelens.app";
  if (profileAge) profileAge.textContent = user.isMinor ? "Minor (Parental Consent Recorded)" : "Adult (Verified)";
  if (profileWeightGoal) profileWeightGoal.textContent = user.weightGoal || "Fat Loss (Deficit)";
  if (profileMuscleGoal) profileMuscleGoal.textContent = user.muscleGoal || "Maintain Muscle";

  // Render History Table
  renderHistoryTable(MOCK_SCAN_HISTORY);

  // Bind Filter
  const filterSelect = document.getElementById('history-filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'all') {
        renderHistoryTable(MOCK_SCAN_HISTORY);
      } else {
        const filtered = MOCK_SCAN_HISTORY.filter(item => item.nova === parseInt(val, 10));
        renderHistoryTable(filtered);
      }
    });
  }
}

function renderHistoryTable(items) {
  const tbody = document.getElementById('scan-history-tbody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
          No scans found for the selected filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(item => {
    let novaBadgeClass = 'badge-primary';
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

    return `
      <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.15s ease;" onmouseover="this.style.background='#FAF8F5'" onmouseout="this.style.background='transparent'">
        <td style="padding: 0.85rem 0.5rem; font-weight: 700; color: var(--color-text-main);">
          ${item.name}
        </td>
        <td style="padding: 0.85rem 0.5rem; color: var(--color-text-muted); font-size: 0.85rem;">
          ${item.cat}
        </td>
        <td style="padding: 0.85rem 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 700; background: ${novaBg}; color: ${novaColor}; padding: 0.2rem 0.55rem; border-radius: 6px;">
            NOVA Group ${item.nova}
          </span>
        </td>
        <td style="padding: 0.85rem 0.5rem; font-weight: 800; font-family: var(--font-family-display); color: ${item.healthScore >= 70 ? '#3B7A57' : (item.healthScore >= 50 ? '#D97706' : '#E11D48')};">
          ${item.healthScore}/100
        </td>
        <td style="padding: 0.85rem 0.5rem; font-weight: 800; font-family: var(--font-family-display); color: #0284C7;">
          ${item.goalScore}/100
        </td>
        <td style="padding: 0.85rem 0.5rem; color: var(--color-text-muted); font-size: 0.78rem; text-align: right;">
          ${item.date}
        </td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);
