/**
 * Vintage Audio Component Controller
 * Connects UI sound toggles to the core synthesized audio engine.
 * Hedwig's copyrighted theme has been removed per specification.
 */

import { toggleSound, isSoundActive, playSfx } from '../core/audio.js';
import { store } from '../core/store.js';

let cleanups = [];

export function initAudio() {
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const mobileSoundToggleBtn = document.getElementById('mobileSoundToggleBtn');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const mobileMusicToggleBtn = document.getElementById('mobileMusicToggleBtn');

  function updateButtons(active) {
    [soundToggleBtn, mobileSoundToggleBtn].forEach(btn => {
      if (!btn) return;
      btn.title = active ? 'Sound FX: Active' : 'Sound FX: Muted';
      btn.setAttribute('aria-label', active ? 'Mute Sound FX' : 'Enable Sound FX');
      btn.innerHTML = active
        ? `<svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
    });

    // If music button exists, sync it to ambient acoustic bell or toggle
    [musicToggleBtn, mobileMusicToggleBtn].forEach(btn => {
      if (!btn) return;
      btn.style.display = 'none'; // Hedwig theme removed per specification
    });
  }

  const unsubscribe = store.subscribe('sound', (active) => {
    updateButtons(active);
  });
  cleanups.push(unsubscribe);

  function handleToggle() {
    const active = toggleSound();
    updateButtons(active);
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', handleToggle);
    cleanups.push(() => soundToggleBtn.removeEventListener('click', handleToggle));
  }
  if (mobileSoundToggleBtn) {
    mobileSoundToggleBtn.addEventListener('click', handleToggle);
    cleanups.push(() => mobileSoundToggleBtn.removeEventListener('click', handleToggle));
  }

  // Interactive subtle click audio
  const onDocClick = (e) => {
    if (!isSoundActive()) return;
    const target = e.target.closest('button, a, input, select, textarea, .nav-link, .filter-tab-btn');
    if (target && !target.closest('#soundToggleBtn') && !target.closest('#mobileSoundToggleBtn')) {
      playSfx('click');
    }
  };
  document.addEventListener('click', onDocClick, { passive: true });
  cleanups.push(() => document.removeEventListener('click', onDocClick));

  updateButtons(isSoundActive());

  return destroyAudio;
}

export function destroyAudio() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}
