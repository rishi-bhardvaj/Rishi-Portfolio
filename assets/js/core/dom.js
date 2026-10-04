/**
 * Core DOM Utilities & Notification Engine
 */

export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Register DOM event listener with auto-cleanup return
 */
export function on(target, event, handler, options) {
  if (!target) return () => {};
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
}

/**
 * Toast Notification System with proper accessibility aria-live
 */
export function showToast(message, duration = 3200) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-broadsheet';
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger entrance
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * Dev-time DOM validation helper
 * @param {string[]} ids
 */
export function assertDom(ids) {
  const missing = [];
  for (const id of ids) {
    if (!document.getElementById(id)) {
      missing.push(id);
    }
  }
  if (missing.length > 0) {
    console.warn('[assertDom] Missing expected DOM mount points / elements:', missing);
  }
}

/**
 * WCAG-compliant Focus Trap for modals & dialogs
 * Traps Tab / Shift+Tab cycling within container.
 * Returns an unbind cleanup function.
 * @param {HTMLElement} container
 * @returns {() => void} cleanup function
 */
export function trapFocus(container) {
  if (!container || typeof document === 'undefined') return () => {};

  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    const focusables = Array.from(container.querySelectorAll(focusableSelector))
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', onKeyDown);
  return () => container.removeEventListener('keydown', onKeyDown);
}
