/**
 * Flying Owl Component
 * Cinematic letter delivery. Cost model: one wrapper animated with transform only, two wing groups with CSS
 * keyframes, and a fixed set of CSS-only sparkles. No timers, no per-frame DOM work.
 */

import { playSfx } from '../core/audio.js';
import { prefersReducedMotion } from '../core/motion.js';
import { flyingOwl, perchedOwl } from './owl-art.js';

const FLIGHT_MS = 3400;
const SPARKLES = 9;

let overlay = null;
let flightTimer = 0;
let finish = null;
let cachedMarkup = '';

export function initOwl() {
  overlay = document.getElementById('owlFlightOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'owlFlightOverlay';
    overlay.className = 'owl-flight-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  // Replace the footer emoji with the perched owl artwork
  const footerOwl = document.getElementById('footerOwlBtn');
  if (footerOwl) footerOwl.innerHTML = perchedOwl();

  return destroyOwl;
}

export function destroyOwl() {
  clearTimeout(flightTimer);
  finish = null;
  if (overlay) {
    overlay.classList.remove('active');
    overlay.textContent = '';
  }
}

function markup() {
  if (!cachedMarkup) {
    const sparks = Array.from({ length: SPARKLES }, (_, i) => `<i style="--i:${i};--y:${(i % 3 - 1) * 14}px"></i>`).join('');
    cachedMarkup = `<div class="owl-rig"><div class="owl-trail">${sparks}</div>${flyingOwl()}</div>`;
  }
  return cachedMarkup;
}

export function triggerFlyingOwl(onComplete) {
  if (!overlay) initOwl();
  clearTimeout(flightTimer);
  overlay.innerHTML = markup();
  overlay.classList.add('active');
  playSfx('hoot');
  playSfx('wand');

  finish = () => {
    overlay.classList.remove('active');
    overlay.textContent = '';
    finish = null;
    if (onComplete) onComplete();
  };
  flightTimer = setTimeout(finish, prefersReducedMotion ? 600 : FLIGHT_MS);
}
