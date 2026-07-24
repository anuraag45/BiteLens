/* ==========================================================================
   BiteLens Web Application - Security Hardening & Input Sanitization Engine
   Prevents XSS (Cross-Site Scripting), SQL Injection, Form Spamming,
   and validates input integrity across all form fields.
   ========================================================================== */

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS) attacks.
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Neutralizes common SQL Injection keywords and syntax patterns.
 */
export function sanitizeSQL(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|UNION|EXEC|DECLARE)\b)/gi, '')
    .replace(/(--|;|\/\*|\*\/)/g, '')
    .replace(/'\s*(OR|AND)\s*'\s*=\s*'/gi, '')
    .replace(/1\s*=\s*1/gi, '');
}

/**
 * Validates email syntax using standard RFC 5322 regex pattern.
 */
export function validateEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(String(email).toLowerCase().trim());
}

/**
 * Validates password strength (minimum 6 characters).
 */
export function validatePassword(password) {
  return typeof password === 'string' && password.trim().length >= 6;
}

/**
 * Form submission rate-limiting cooldown tracker to block automated form spamming.
 */
const submissionCooldowns = new Map();

export function isRateLimited(actionKey, cooldownMs = 2000) {
  const now = Date.now();
  const lastTime = submissionCooldowns.get(actionKey) || 0;
  if (now - lastTime < cooldownMs) {
    return true; // Too fast, rate-limited
  }
  submissionCooldowns.set(actionKey, now);
  return false;
}
