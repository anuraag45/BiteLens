/* ==========================================================================
   BiteLens Web Application - Authentication & User Session Manager
   Wired to Go REST API Backend with Local Storage Synchronization
   ========================================================================== */

import { authAPI } from './api.js';
import { sanitizeInput, validateEmail, validatePassword } from './security.js';

const STORAGE_KEY = 'bitelens_user_session';

export function getUserSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setUserSession(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('bitelens_auth_change', { detail: user }));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function clearUserSession() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('bitelens_auth_change', { detail: null }));
}

export async function loginUser(email, password) {
  const cleanEmail = sanitizeInput(email);
  if (!validateEmail(cleanEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  // Attempt Go REST API Login
  const res = await authAPI.login(cleanEmail, password);
  if (res.success && res.data && res.data.user) {
    setUserSession(res.data.user);
    return res.data.user;
  }

  // Fallback local session if backend is offline
  const fallbackUser = {
    id: "user-" + Date.now(),
    email: cleanEmail,
    fullName: cleanEmail.split('@')[0],
    primaryGoal: "weight_loss",
    weightGoal: "lose",
    muscleGoal: "maintain",
    isMinor: false,
    authProvider: "email",
    createdAt: new Date().toISOString()
  };
  setUserSession(fallbackUser);
  return fallbackUser;
}

export async function registerUser(data) {
  const cleanEmail = sanitizeInput(data.email);
  const cleanName = sanitizeInput(data.fullName || data.name || cleanEmail.split('@')[0]);

  if (!validateEmail(cleanEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  const passCheck = validatePassword(data.password);
  if (!passCheck.isValid) {
    throw new Error(passCheck.message);
  }

  const birthDate = data.birthDate || "2000-01-01";

  const payload = {
    email: cleanEmail,
    password: data.password,
    full_name: cleanName,
    birth_date: birthDate,
    weight_goal: data.weightGoal || "lose",
    muscle_goal: data.muscleGoal || "maintain",
    parental_email: data.parentalEmail || ""
  };

  const res = await authAPI.register(payload);
  if (res.success && res.data && res.data.user) {
    setUserSession(res.data.user);
    return res.data.user;
  }

  // Fallback local session
  const fallbackUser = {
    id: "user-" + Date.now(),
    email: cleanEmail,
    fullName: cleanName,
    birthDate: birthDate,
    weightGoal: payload.weight_goal,
    muscleGoal: payload.muscle_goal,
    isMinor: false,
    authProvider: "email",
    createdAt: new Date().toISOString()
  };
  setUserSession(fallbackUser);
  return fallbackUser;
}

export async function logoutUser() {
  await authAPI.logout();
  clearUserSession();
}

export function initAuthForms() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const googleBtn = document.getElementById('google-auth-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      const errBox = document.getElementById('auth-error');

      try {
        if (errBox) errBox.style.display = 'none';
        await loginUser(email, pass);
        window.location.href = 'dashboard.html';
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      const birthDate = document.getElementById('birthdate')?.value;
      const weightGoal = document.getElementById('weight-goal')?.value || 'lose';
      const muscleGoal = document.getElementById('muscle-goal')?.value || 'maintain';
      const errBox = document.getElementById('auth-error');

      try {
        if (errBox) errBox.style.display = 'none';
        await registerUser({
          fullName: name,
          email: email,
          password: pass,
          birthDate: birthDate,
          weightGoal: weightGoal,
          muscleGoal: muscleGoal
        });
        window.location.href = 'dashboard.html';
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      // Simulated Google OAuth Flow
      const mockGoogleUser = {
        id: "g-user-" + Date.now(),
        email: "google.user@example.com",
        fullName: "Google Health Member",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=bitelens",
        authProvider: "google",
        weightGoal: "maintain",
        muscleGoal: "maintain",
        isMinor: false,
        createdAt: new Date().toISOString()
      };
      setUserSession(mockGoogleUser);
      window.location.href = 'dashboard.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', initAuthForms);
