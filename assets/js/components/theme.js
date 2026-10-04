/**
 * Theme Engine & Lumos / Nox Wand Spell
 */

import { store } from '../core/store.js';
import { playSfx } from '../core/audio.js';
import { prefersReducedMotion } from '../core/motion.js';

const THEME_KEY = 'prophet_theme_edition';
let wandSpellTimeout = null;
let cleanups = [];

export function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');

  const savedTheme = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(THEME_KEY) : null;
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme === 'nox' || (!savedTheme && prefersDark) ? 'nox' : 'lumos';

  applyTheme(initialTheme);

  function handleToggle() {
    const current = store.get('theme') || (document.documentElement.classList.contains('theme-nox') ? 'nox' : 'lumos');
    const newTheme = current === 'nox' ? 'lumos' : 'nox';
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    triggerWandSpell(newTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', handleToggle);
    cleanups.push(() => themeToggleBtn.removeEventListener('click', handleToggle));
  }

  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', handleToggle);
    cleanups.push(() => mobileThemeToggleBtn.removeEventListener('click', handleToggle));
  }

  return destroyTheme;
}

export function destroyTheme() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  if (wandSpellTimeout) {
    clearTimeout(wandSpellTimeout);
    wandSpellTimeout = null;
  }
}

export function applyTheme(theme) {
  const isNox = theme === 'nox';
  store.set('theme', theme);

  if (isNox) {
    document.documentElement.classList.add('theme-nox');
  } else {
    document.documentElement.classList.remove('theme-nox');
  }

  [document.getElementById('themeToggleBtn'), document.getElementById('mobileThemeToggleBtn')].forEach(btn => {
    if (!btn) return;
    btn.setAttribute('aria-label', isNox ? 'Switch to Broadsheet Day Edition (Lumos)' : 'Switch to Nocturnal Edition (Nox)');
    btn.title = isNox ? 'Lumos (Day Edition)' : 'Nox (Night Edition)';
    btn.innerHTML = isNox
      ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  });
}

export function triggerWandSpell(spellType) {
  const isLumos = spellType === 'lumos';

  // Play synthesized acoustic chime
  playSfx('wand');

  if (prefersReducedMotion) return;

  let overlay = document.getElementById('wandSpellOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'wandSpellOverlay';
    overlay.className = 'wand-spell-overlay';
    document.body.appendChild(overlay);
  }

  if (wandSpellTimeout) clearTimeout(wandSpellTimeout);
  overlay.innerHTML = '';

  const wandWrapper = document.createElement('div');
  wandWrapper.className = 'magic-wand-wrapper';
  wandWrapper.innerHTML = `
    <svg class="magic-wand-svg" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="elderWoodGrad" x1="40" y1="280" x2="280" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#140b04"/>
          <stop offset="25%" stop-color="#2d160a"/>
          <stop offset="60%" stop-color="#4a2612"/>
          <stop offset="85%" stop-color="#6e391b"/>
          <stop offset="100%" stop-color="#8a4823"/>
        </linearGradient>
      </defs>
      <polygon points="44,284 56,296 284,56 274,44" fill="url(#elderWoodGrad)" stroke="#100803" stroke-width="2"/>
      <circle cx="70" cy="258" r="9" fill="#2d160a" stroke="#100803" stroke-width="1.5"/>
      <circle cx="106" cy="222" r="8.5" fill="#3b1d0d" stroke="#100803" stroke-width="1.5"/>
      <circle cx="148" cy="180" r="7.8" fill="#4a2612" stroke="#100803" stroke-width="1.5"/>
      <circle cx="192" cy="136" r="6.8" fill="#5c3017" stroke="#100803" stroke-width="1.5"/>
      <circle cx="236" cy="92" r="5.8" fill="#6e391b" stroke="#100803" stroke-width="1.5"/>
      <line x1="62" y1="266" x2="78" y2="250" stroke="#d4af37" stroke-width="2.5"/>
      <line x1="98" y1="230" x2="114" y2="214" stroke="#d4af37" stroke-width="2.5"/>
      <line x1="140" y1="188" x2="156" y2="172" stroke="#d4af37" stroke-width="2"/>
      <line x1="184" y1="144" x2="200" y2="128" stroke="#d4af37" stroke-width="2"/>
      <circle cx="280" cy="48" r="${isLumos ? '16' : '12'}" fill="${isLumos ? '#ffffff' : '#f3e8ff'}"/>
      <circle cx="280" cy="48" r="${isLumos ? '7' : '5'}" fill="${isLumos ? '#fef08a' : '#c084fc'}"/>
    </svg>
  `;

  const burst = document.createElement('div');
  burst.className = `spell-light-burst ${isLumos ? 'lumos-burst' : 'nox-burst'}`;
  burst.style.right = '18%';
  burst.style.bottom = '26%';

  overlay.appendChild(burst);
  overlay.appendChild(wandWrapper);

  const sparkleCount = 18;
  for (let i = 0; i < sparkleCount; i++) {
    const star = document.createElement('div');
    star.className = 'wand-sparkle-star';
    const angle = (i / sparkleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
    const distance = 50 + Math.random() * 120;
    const sx = Math.cos(angle) * distance;
    const sy = Math.sin(angle) * distance;
    star.style.setProperty('--sx', `${sx}px`);
    star.style.setProperty('--sy', `${sy}px`);
    star.style.right = 'calc(8% + 50px)';
    star.style.bottom = 'calc(12% + 260px)';
    star.style.backgroundColor = isLumos
      ? (i % 2 === 0 ? '#fef08a' : '#f59e0b')
      : (i % 2 === 0 ? '#e9d5ff' : '#9333ea');
    star.style.boxShadow = isLumos
      ? '0 0 12px #fde047, 0 0 22px #eab308'
      : '0 0 12px #c084fc, 0 0 22px #7e22ce';
    overlay.appendChild(star);
    setTimeout(() => star.remove(), 900);
  }

  wandSpellTimeout = setTimeout(() => {
    overlay.innerHTML = '';
  }, 1150);
}
