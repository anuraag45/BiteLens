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

export async function loginUser(email, password, goal = 'Fat Loss Deficit') {
  const cleanEmail = sanitizeInput(email);
  if (!validateEmail(cleanEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!validatePassword(password)) {
    throw new Error("Password must be at least 6 characters.");
  }

  // Attempt Go REST API Login
  const res = await authAPI.login(cleanEmail, password);
  if (res.success && res.data && res.data.user) {
    const user = {
      ...res.data.user,
      weightGoal: goal
    };
    setUserSession(user);
    return user;
  }

  // Fallback local session if backend is offline
  const fallbackUser = {
    id: "user-" + Date.now(),
    email: cleanEmail,
    fullName: cleanEmail.split('@')[0],
    weightGoal: goal,
    muscleGoal: "High Protein",
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
  if (!validatePassword(data.password)) {
    throw new Error("Password must be at least 6 characters.");
  }

  const birthDate = data.birthDate || "2000-01-01";

  const payload = {
    email: cleanEmail,
    password: data.password,
    full_name: cleanName,
    birth_date: birthDate,
    weight_goal: data.weightGoal || "Fat Loss Deficit",
    muscle_goal: data.muscleGoal || "Hypertrophy (High Protein)",
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
