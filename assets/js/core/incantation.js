/**
 * Incantation Labels
 * A tiny pool of floating spell words ("LUMOS", "ALOHOMORA"...) that appear at the cursor / tap point.
 * Pool + Web Animations API: no DOM churn, works with reduced motion (fades in place) and on touch screens.
 */

import { prefersReducedMotion } from './motion.js';

const POOL = 4;
let nodes = [];
let cursor = 0;
let last = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let bound = false;

function ensurePool() {
  if (nodes.length) return;
  nodes = Array.from({ length: POOL }, () => {
    const el = document.createElement('div');
    el.className = 'spell-float';
    el.setAttribute('aria-hidden', 'true');
    el.style.opacity = '0';
    document.body.appendChild(el);
    return el;
  });
}

function bindPointer() {
  if (bound) return;
  bound = true;
  const track = (e) => { last = { x: e.clientX, y: e.clientY }; };
  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', track, { passive: true });
}

export function trackPointer() {
  bindPointer();
}

/**
 * @param {string} text spell word, e.g. "LUMOS"
 * @param {{x?: number, y?: number}} [at] defaults to the last pointer position
 */
export function castLabel(text, at) {
  ensurePool();
  bindPointer();
  const el = nodes[cursor++ % POOL];
  const x = Math.min(Math.max(at?.x ?? last.x, 70), window.innerWidth - 70);
  const y = Math.max(at?.y ?? last.y, 60);

  el.getAnimations().forEach((a) => a.cancel());
  el.textContent = `${text}!`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  const frames = prefersReducedMotion
    ? [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
    : [
        { opacity: 0, transform: 'translate(-50%, -10px) scale(0.7)', letterSpacing: '0.05em' },
        { opacity: 1, transform: 'translate(-50%, -34px) scale(1.08)', letterSpacing: '0.22em', offset: 0.22 },
        { opacity: 1, transform: 'translate(-50%, -46px) scale(1)', letterSpacing: '0.24em', offset: 0.7 },
        { opacity: 0, transform: 'translate(-50%, -66px) scale(0.96)', letterSpacing: '0.28em' },
      ];
  el.animate(frames, { duration: prefersReducedMotion ? 1100 : 1350, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'forwards' });
}
