/**
 * Easter Eggs Component
 * Keyboard incantations, 7-click crest seal break, nocturnal owl hooting, and atmospheric apparitions.
 */

import { playSfx } from '../core/audio.js';
import { showToast } from '../core/dom.js';
import { store } from '../core/store.js';
import { unlockSecretStation, isSecretStationUnlocked } from '../data/projects.js';
import { openMarauderMap } from './marauder.js';

let cleanups = [];
let keyBuffer = '';
let keyTimer = null;
let crestClickCount = 0;
let crestTimer = null;

export function initEasterEggs() {
  if (typeof window === 'undefined') return () => {};

  // 1. Keyboard Incantation Buffer
  const onKeyDown = (e) => {
    const activeEl = document.activeElement;
    if (activeEl) {
      const tag = activeEl.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || activeEl.isContentEditable) {
        return;
      }
    }

    if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > 20) {
        keyBuffer = keyBuffer.slice(-20);
      }

      clearTimeout(keyTimer);
      keyTimer = setTimeout(() => {
        keyBuffer = '';
      }, 2000);

      checkIncantations(keyBuffer);
    }
  };

  window.addEventListener('keydown', onKeyDown);
  cleanups.push(() => {
    window.removeEventListener('keydown', onKeyDown);
    clearTimeout(keyTimer);
  });

  // 2. Seven Clicks on Masthead Crest Emblem
  const crestElements = document.querySelectorAll('.nav-brand-crest, .masthead-monogram');
  crestElements.forEach(crest => {
    const onCrestClick = (e) => {
      e.preventDefault();
      crestClickCount++;
      clearTimeout(crestTimer);

      crestTimer = setTimeout(() => {
        crestClickCount = 0;
      }, 3500);

      if (crestClickCount < 7) {
        playSfx('click');
        crest.style.transform = `scale(${1 + crestClickCount * 0.03})`;
        setTimeout(() => {
          crest.style.transform = '';
        }, 150);
      } else {
        // 7th Strike: Break the Seal!
        crestClickCount = 0;
        playSfx('seal');
        crest.classList.add('seal-breaking');
        setTimeout(() => crest.classList.remove('seal-breaking'), 850);

        unlockSecretStation();
        showToast('⚡ TAMPER SEAL BROKEN: The Room of Requirement (Station 07) has unlocked along the Wizarding Railway!');

        // Scroll to railway to view the unlocked chamber
        const workSec = document.getElementById('work');
        if (workSec) {
          workSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    crest.addEventListener('click', onCrestClick);
    cleanups.push(() => crest.removeEventListener('click', onCrestClick));
  });

  // 3. Clickable Footer Owl Messenger
  const owlBtn = document.getElementById('footerOwlBtn');
  if (owlBtn) {
    const onOwlClick = (e) => {
      e.preventDefault();
      playSfx('hoot');
      owlBtn.classList.add('hooting');
      setTimeout(() => owlBtn.classList.remove('hooting'), 500);
      showToast('🦉 Hoo! The nocturnal dispatch owl stands ready. Send an owl in the post section below!');
    };
    owlBtn.addEventListener('click', onOwlClick);
    cleanups.push(() => owlBtn.removeEventListener('click', onOwlClick));
  }

  return destroyEasterEggs;
}

function checkIncantations(buffer) {
  if (buffer.endsWith('mischief')) {
    keyBuffer = '';
    openMarauderMap();
  } else if (buffer.endsWith('morsmordre')) {
    keyBuffer = '';
    triggerDarkMark();
  } else if (buffer.endsWith('patronus')) {
    keyBuffer = '';
    triggerPatronus();
  } else if (buffer.endsWith('lumos')) {
    keyBuffer = '';
    playSfx('wand');
    const isDark = document.documentElement.classList.contains('theme-nox');
    if (isDark) {
      document.documentElement.classList.remove('theme-nox');
      store.set('theme', 'lumos');
      localStorage.setItem('prophet_theme_edition', 'lumos');
    }
    showToast('✨ Lumos! Radiant broadsheet illumination cast.');
  } else if (buffer.endsWith('nox')) {
    keyBuffer = '';
    playSfx('wand');
    const isDark = document.documentElement.classList.contains('theme-nox');
    if (!isDark) {
      document.documentElement.classList.add('theme-nox');
      store.set('theme', 'nox');
      localStorage.setItem('prophet_theme_edition', 'nox');
    }
    showToast('🌑 Nox! Shadows veil the broadsheet.');
  } else if (buffer.endsWith('finite')) {
    keyBuffer = '';
    playSfx('paper');
    dismissAllOverlays();
    showToast('✨ Finite Incantatem! All active charms dispelled.');
  }
}

function triggerDarkMark() {
  playSfx('dark-mark');
  dismissAllOverlays();

  const overlay = document.createElement('div');
  overlay.className = 'dark-mark-overlay';
  overlay.id = 'activeDarkMark';
  overlay.innerHTML = `
    <svg class="dark-mark-graphic" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="The Dark Mark">
      <!-- Emerald Glow Aura -->
      <circle cx="100" cy="90" r="70" fill="rgba(16, 185, 129, 0.25)" filter="blur(20px)" />
      <!-- Stylized Skull Silhouette -->
      <path d="M60 80 C60 45, 140 45, 140 80 C140 105, 130 120, 115 130 L115 145 C115 150, 85 150, 85 145 L85 130 C70 120, 60 105, 60 80 Z" fill="#10b981" fill-opacity="0.9" stroke="#6ee7b7" stroke-width="2" />
      <!-- Eye Sockets & Nasal Aperture -->
      <ellipse cx="80" cy="80" rx="9" ry="12" fill="#064e3b" />
      <ellipse cx="120" cy="80" rx="9" ry="12" fill="#064e3b" />
      <polygon points="100,95 95,110 105,110" fill="#064e3b" />
      <!-- Teeth Grid -->
      <rect x="90" y="132" width="4" height="8" fill="#064e3b" />
      <rect x="98" y="132" width="4" height="8" fill="#064e3b" />
      <rect x="106" y="132" width="4" height="8" fill="#064e3b" />
      <!-- Emergent Coiling Serpent -->
      <path d="M100 148 C95 180, 50 190, 70 220 C90 250, 140 230, 130 260 C120 280, 100 290, 85 295" stroke="#34d399" stroke-width="8" stroke-linecap="round" fill="none" />
      <circle cx="85" cy="295" r="4" fill="#a7f3d0" />
    </svg>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('active'));

  showToast('⚡ Morsmordre! The emerald serpent mark ascents into the clouds.');

  setTimeout(() => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 600);
  }, 2600);
}

function triggerPatronus() {
  playSfx('patronus');
  dismissAllOverlays();

  const overlay = document.createElement('div');
  overlay.className = 'patronus-overlay';
  overlay.id = 'activePatronus';
  overlay.innerHTML = `
    <svg class="patronus-stag-silhouette" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Silver Stag Patronus">
      <!-- Luminous Celestial Glow -->
      <circle cx="150" cy="150" r="100" fill="rgba(255, 255, 255, 0.4)" filter="blur(30px)" />
      <!-- Ethereal Stag Head & Antlers -->
      <path d="M150 170 C140 150, 135 125, 145 105 C150 95, 160 95, 165 105 C175 125, 170 150, 160 170 Z" fill="#ffffff" fill-opacity="0.95" />
      <!-- Left Antler Branches -->
      <path d="M142 105 C130 90, 110 80, 95 85 C90 75, 100 65, 115 70 C125 75, 135 60, 125 45 C135 50, 140 65, 140 85" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Right Antler Branches -->
      <path d="M168 105 C180 90, 200 80, 215 85 C220 75, 210 65, 195 70 C185 75, 175 60, 185 45 C175 50, 170 65, 170 85" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Muzzle & Gentle Eye -->
      <circle cx="150" cy="172" r="3" fill="#38bdf8" />
      <circle cx="147" cy="130" r="2" fill="#38bdf8" />
      <circle cx="163" cy="130" r="2" fill="#38bdf8" />
    </svg>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('active'));

  showToast('🦌 Expecto Patronum! Silver guardian mist dispels the darkness.');

  setTimeout(() => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 700);
  }, 4500);
}

function dismissAllOverlays() {
  const dm = document.getElementById('activeDarkMark');
  if (dm) dm.remove();
  const pat = document.getElementById('activePatronus');
  if (pat) pat.remove();
  window.dispatchEvent(new CustomEvent('chronicle:spell:finite'));
}

export function destroyEasterEggs() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  dismissAllOverlays();
}
