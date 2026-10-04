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
