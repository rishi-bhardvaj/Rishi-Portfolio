/**
 * Interactive Wand Cursor Component
 * Adds subtle luminous wand-tip dot following pointer and spark particles on click.
 * Strictly respects prefers-reduced-motion and pointer: fine.
 */

import { prefersReducedMotion } from '../core/motion.js';

let cursorDot = null;
let rafId = null;
let isRunning = false;
let cleanups = [];

let targetX = -100;
let targetY = -100;
let currentX = -100;
let currentY = -100;
let isFiniteSuppressed = false;

export function initCursor() {
  // Guard: Touch devices or reduced motion
  if (typeof window === 'undefined') return () => {};
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasFinePointer || prefersReducedMotion) {
    return () => {};
  }

  // Create dot element
  cursorDot = document.createElement('div');
  cursorDot.className = 'wand-cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorDot);

  // Mouse move handler
  const onPointerMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!cursorDot.classList.contains('active')) {
      cursorDot.classList.add('active');
    }
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  cleanups.push(() => window.removeEventListener('pointermove', onPointerMove));

  // Pointer leave / enter
  const onPointerLeave = () => {
    if (cursorDot) cursorDot.classList.remove('active');
  };
  const onPointerEnter = () => {
    if (cursorDot) cursorDot.classList.add('active');
  };
  document.addEventListener('mouseleave', onPointerLeave);
  document.addEventListener('mouseenter', onPointerEnter);
  cleanups.push(() => document.removeEventListener('mouseleave', onPointerLeave));
  cleanups.push(() => document.removeEventListener('mouseenter', onPointerEnter));

  // Interactive Hover Detection
  const onMouseOver = (e) => {
    const target = e.target;
    if (!target || !cursorDot) return;
    const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], summary, .btn-ink, .route-node-btn, .marauder-chamber');
    if (isInteractive) {
      cursorDot.classList.add('hovering');
    } else {
      cursorDot.classList.remove('hovering');
    }
  };
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  cleanups.push(() => document.removeEventListener('mouseover', onMouseOver));

  // Click Sparks Generation
  const onPointerDown = (e) => {
    if (isFiniteSuppressed || prefersReducedMotion) return;
    spawnSparks(e.clientX, e.clientY);
  };
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  cleanups.push(() => window.removeEventListener('pointerdown', onPointerDown));

  // Listen for FINITE spell
  const onSpellFinite = () => {
    isFiniteSuppressed = true;
    if (cursorDot) cursorDot.classList.remove('active');
    setTimeout(() => {
      isFiniteSuppressed = false;
    }, 4000);
  };
  window.addEventListener('chronicle:spell:finite', onSpellFinite);
  cleanups.push(() => window.removeEventListener('chronicle:spell:finite', onSpellFinite));

  // rAF Render Loop
  isRunning = true;
  function loop() {
    if (!isRunning) return;

    if (!isFiniteSuppressed) {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.22;
      currentY += dy * 0.22;

      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    }

    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  // Tab visibility management
  const onVisibilityChange = () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      if (isRunning) rafId = requestAnimationFrame(loop);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

  return destroyCursor;
}

function spawnSparks(x, y) {
  const sparkCount = 6;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement('div');
    spark.className = 'wand-spark';
    spark.setAttribute('aria-hidden', 'true');

    const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 14 + Math.random() * 22;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 3 + Math.random() * 3;

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);

    frag.appendChild(spark);
    setTimeout(() => spark.remove(), 450);
  }

  document.body.appendChild(frag);
}

export function destroyCursor() {
  isRunning = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (cursorDot && cursorDot.parentNode) {
    cursorDot.parentNode.removeChild(cursorDot);
    cursorDot = null;
  }
  cleanups.forEach(fn => fn());
  cleanups = [];
}
