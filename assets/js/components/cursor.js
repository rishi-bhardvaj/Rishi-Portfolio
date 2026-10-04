/**
 * Wand Cursor
 * A small, cute wand replaces the pointer on fine-pointer devices. The glowing tip is the hotspot.
 * Hovering interactive things makes the tip flare; clicking releases sparks. Sparks come from a fixed pool
 * (Web Animations API), and the wand moves with a single transform write per frame.
 * Disabled on touch screens. Falls back to the native cursor over text fields and when JS is off.
 */

import { prefersReducedMotion } from '../core/motion.js';

const SPARKS = 14;
const TRAIL_STEP = 22; // px of travel between trail sparks
const INTERACTIVE = 'a, button, [role="button"], summary, label, select, .rm-node, .potion-bottle, .svc-card, [data-spell], [tabindex="0"]';
const TEXTUAL = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea, [contenteditable="true"]';

const WAND_SVG = `
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <defs>
      <linearGradient id="wdWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9824a"/><stop offset=".55" stop-color="#7a4a22"/><stop offset="1" stop-color="#4a2a12"/></linearGradient>
      <radialGradient id="wdTip"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffb703" stop-opacity="0"/></radialGradient>
    </defs>
    <line x1="9" y1="9" x2="34" y2="34" stroke="#2a1608" stroke-width="5.4" stroke-linecap="round"/>
    <line x1="9" y1="9" x2="34" y2="34" stroke="url(#wdWood)" stroke-width="3.6" stroke-linecap="round"/>
    <line x1="9.8" y1="8.2" x2="31" y2="29.4" stroke="#e8b97e" stroke-width=".9" stroke-linecap="round" opacity=".7"/>
    <g stroke="#e8c76a" stroke-width="1.6" stroke-linecap="round"><line x1="22.2" y1="20.2" x2="24.2" y2="22.2" transform="translate(-1.3 1.3)"/><line x1="27.4" y1="25.4" x2="29.4" y2="27.4" transform="translate(-1.3 1.3)"/></g>
    <circle cx="33.4" cy="33.4" r="2.4" fill="#e8c76a" stroke="#6b4a10" stroke-width=".6"/>
    <circle cx="6" cy="6" r="9" fill="url(#wdTip)" class="wd-glow"/>
    <path d="M6,0.6 L7.5,4.5 L11.4,6 L7.5,7.5 L6,11.4 L4.5,7.5 L0.6,6 L4.5,4.5Z" fill="#fffbe0" stroke="#ffc533" stroke-width=".5" class="wd-star"/>
  </svg>`;

let wand = null;
let sparks = [];
let sparkIdx = 0;
let cleanups = [];
let raf = 0;
let x = -100;
let y = -100;
let lastTrail = { x: 0, y: 0 };
let suppressed = false;

export function initCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return () => {};

  wand = document.createElement('div');
  wand.className = 'wand-cursor';
  wand.setAttribute('aria-hidden', 'true');
  wand.innerHTML = WAND_SVG;
  document.body.appendChild(wand);
  sparks = Array.from({ length: SPARKS }, () => {
    const s = document.createElement('i');
    s.className = 'wand-spark';
    s.setAttribute('aria-hidden', 'true');
    document.body.appendChild(s);
    return s;
  });
  document.documentElement.classList.add('wand-on');

  const frame = () => {
    raf = 0;
    wand.style.transform = `translate3d(${x}px,${y}px,0)`;
  };
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  on(window, 'pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(frame);
    wand.classList.add('is-visible');
    if (!prefersReducedMotion && !suppressed && Math.hypot(x - lastTrail.x, y - lastTrail.y) > TRAIL_STEP) {
      lastTrail = { x, y };
      emit(x, y, 1, 10);
    }
  }, { passive: true });

  on(document, 'mouseleave', () => wand.classList.remove('is-visible'));
  on(document, 'mouseenter', () => wand.classList.add('is-visible'));

  on(document, 'mouseover', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    wand.classList.toggle('is-hover', !!t?.closest(INTERACTIVE));
    wand.classList.toggle('is-text', !!t?.closest(TEXTUAL)); // native I-beam shows over text fields
  }, { passive: true });

  on(window, 'pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    wand.classList.add('is-down');
    if (!prefersReducedMotion && !suppressed) emit(e.clientX, e.clientY, 7, 34);
  }, { passive: true });
  on(window, 'pointerup', () => wand.classList.remove('is-down'), { passive: true });

  on(window, 'chronicle:spell:finite', () => {
    suppressed = true;
    setTimeout(() => { suppressed = false; }, 4000);
  });

  return destroyCursor;
}

/** Releases `count` pooled sparks from (px,py), each travelling up to `reach` px. */
function emit(px, py, count, reach) {
  for (let i = 0; i < count; i++) {
    const s = sparks[sparkIdx++ % SPARKS];
    const a = Math.random() * Math.PI * 2;
    const d = reach * (0.4 + Math.random() * 0.6);
    const size = 2 + Math.random() * 3;
    s.style.cssText = `left:${px}px;top:${py}px;width:${size}px;height:${size}px`;
    s.getAnimations().forEach((an) => an.cancel());
    s.animate(
      [
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
        { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 8}px)) scale(0.2)` },
      ],
      { duration: 420 + Math.random() * 260, easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)', fill: 'both' },
    );
  }
}

export function destroyCursor() {
  cancelAnimationFrame(raf);
  raf = 0;
  cleanups.forEach((fn) => fn());
  cleanups = [];
  wand?.remove();
  sparks.forEach((s) => s.remove());
  wand = null;
  sparks = [];
  document.documentElement.classList.remove('wand-on');
}
