/* ==========================================================================
   BiteLens Web Application - User Authentication & Goal Persistence Engine
   Manages login, signup, Google OAuth simulation, and security validation.
   ========================================================================== */

import { sanitizeInput, sanitizeSQL, validateEmail, validatePassword, isRateLimited } from './security.js';

const STORAGE_KEY = 'bitelens_user_session';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveUserSession(user) {
  try {
    const cleanUser = {
      name: sanitizeInput(user.name),
      email: sanitizeInput(user.email),
      goal: sanitizeInput(user.goal),
      provider: sanitizeInput(user.provider || 'email'),
      avatar: user.avatar || '👤'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanUser));
    window.dispatchEvent(new Event('bitelens_auth_change'));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('bitelens_auth_change'));
  window.location.href = 'index.html';
}

export function initAuthForms() {
  const loginForm = document.getElementById('login-form');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (isRateLimited('login_submit', 1500)) {
        alert('Please wait a moment before trying to log in again.');
        return;
      }

      const rawEmail = document.getElementById('login-email').value;
      const rawPass = document.getElementById('login-password').value;
      const goal = document.getElementById('login-goal')?.value || 'Muscle Gain & Fitness';

      const email = sanitizeInput(sanitizeSQL(rawEmail));

      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      if (!validatePassword(rawPass)) {
        alert('Password must be at least 6 characters.');
        return;
      }

      const name = email.split('@')[0];

      saveUserSession({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        goal: goal,
        provider: 'email',
        avatar: '👤'
      });

      window.location.href = 'index.html';
    });
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      saveUserSession({
        name: 'Anuraag Sharma',
        email: 'anuraag.sharma@gmail.com',
        goal: 'Muscle Gain & Fitness',
        provider: 'google',
        avatar: '🌐'
      });

      alert('Successfully authenticated via Google Account as Anuraag Sharma!');
      window.location.href = 'index.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (isRateLimited('signup_submit', 1500)) {
        alert('Please wait a moment before submitting again.');
        return;
      }

      const rawName = document.getElementById('signup-name').value;
      const rawEmail = document.getElementById('signup-email').value;
      const rawPass = document.getElementById('signup-password').value;
      const goal = document.getElementById('signup-goal').value;

      const name = sanitizeInput(sanitizeSQL(rawName));
      const email = sanitizeInput(sanitizeSQL(rawEmail));

      if (!name || name.length < 2) {
        alert('Please enter your full name.');
        return;
      }

      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      if (!validatePassword(rawPass)) {
        alert('Password must be at least 6 characters.');
        return;
      }

      saveUserSession({
        name: name,
        email: email,
        goal: goal,
        provider: 'email',
        avatar: '👤'
      });

      window.location.href = 'index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', initAuthForms);
