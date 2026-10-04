/**
 * The Great Spell Engine & Spellbook Popover
 * Dispatches all 14 incantations, binds keybindings, and manages spell effects.
 */

import { spells, getSpellById } from '../data/spells.js';
import { playSfx } from '../core/audio.js';
import { showToast } from '../core/dom.js';
import { store } from '../core/store.js';
import { applyTheme } from './theme.js';
import { openCaseModal, closeCaseModal } from './modal.js';
import { goToStation, stepStation, toggleProtego, toggleRevelio, featuredIndex, closeDrawer, isDrawerOpen } from '../railway/journey.js';
import { prefersReducedMotion } from '../core/motion.js';

let cleanups = [];
let spellbookOpen = false;

export function initSpellBar() {
  createSpellbookMarkup();

  // Global Click Delegation for [data-spell]
  const onDocClick = (e) => {
    const trigger = e.target.closest('[data-spell]');
    if (trigger) {
      const spellId = trigger.getAttribute('data-spell');
      if (spellId) {
        castSpell(spellId, { trigger, url: trigger.dataset.url, projectId: trigger.dataset.project });
      }
    }
  };
  document.addEventListener('click', onDocClick);
  cleanups.push(() => document.removeEventListener('click', onDocClick));

  // Global Keyboard Shortcuts
  const onKeyDown = (e) => {
    // Ignore keypresses while typing in inputs
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      toggleSpellbook();
    } else if (e.key === 'Escape') {
      if (spellbookOpen) {
        toggleSpellbook(false);
      } else if (closeDrawer()) {
        playSfx('paper');
      } else {
        castSpell('finite');
      }
    } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
      castSpell('revelio');
    } else if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey) {
      castSpell('expectoPatronum');
    } else if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey) {
      castSpell('reparo');
    }
  };
  window.addEventListener('keydown', onKeyDown);
  cleanups.push(() => window.removeEventListener('keydown', onKeyDown));

  return destroySpellBar;
}

export function destroySpellBar() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  const sb = document.getElementById('spellbookModal');
  if (sb) sb.remove();
}

/**
 * Master Spell Dispatcher
 * @param {string} spellId
 * @param {Object} ctx
 */
export function castSpell(spellId, ctx = {}) {
  const spell = getSpellById(spellId);
  const incantation = spell ? spell.incantation : spellId;
  const sfxType = spell ? spell.sfx : 'wand';

  playSfx(sfxType);
  showToast(`⚡ ${incantation}!`);

  switch (spellId) {
    case 'lumos':
      applyTheme('lumos');
      break;

    case 'nox':
      applyTheme('nox');
      break;

    case 'revelio':
      // Reveal the hidden detail in the open station walkthrough; otherwise toggle the potion cabinet cards
      if (isDrawerOpen() || ctx.trigger?.closest('.station-drawer')) {
        toggleRevelio();
      } else {
        document.querySelectorAll('.potion-revelio-card').forEach(c => c.classList.toggle('active'));
      }
      break;

    case 'alohomora':
      openCaseModal(ctx.projectId || 'finacle');
      break;

    case 'accio':
      // Anchors with an href already open their own source link; only fall back to the profile otherwise
      if (!ctx.trigger?.href) window.open('https://github.com/rishi-bhardvaj', '_blank', 'noopener');
      break;

    case 'protego':
      toggleProtego();
      break;

    case 'reparo':
      // Reset filter tabs and restore all articles
      const allFilterBtn = document.querySelector('.filter-tab-btn[data-category="all"]');
      if (allFilterBtn) allFilterBtn.click();
      const allPillBtn = document.querySelector('.lab-pill-btn[data-category="all"]');
      if (allPillBtn) allPillBtn.click();
      break;

    case 'obliviate':
      const searchInput = document.getElementById('skillSearchInput');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
      break;

    case 'priorIncantato':
      stepStation(-1);
      break;

    case 'expectoPatronum':
      // Travel to the featured station and release the patronus mist
      goToStation(featuredIndex());
      triggerPatronusMist();
      break;

    case 'portkey':
      if (ctx.url) {
        setTimeout(() => window.open(ctx.url, '_blank', 'noopener'), 400);
      }
      break;

    case 'finite':
      // Halts all active animations, effects, sound
      document.querySelectorAll('.patronus-mist, .morsmordre-overlay').forEach(el => el.remove());
      closeCaseModal();
      showToast('✦ Finite Incantatem: Active magical effects ceased.');
      break;

    case 'morsmordre':
      triggerMorsmordre();
      break;
  }
}

function triggerPatronusMist() {
  if (prefersReducedMotion) return;

  const target = document.getElementById('railwayStage') || document.body;
  const mistWrap = document.createElement('div');
  mistWrap.className = 'patronus-mist';
  target.appendChild(mistWrap);

  const particleCount = 28;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'patronus-particle';
    const angle = (i / particleCount) * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    p.style.setProperty('--px', `${px}px`);
    p.style.setProperty('--py', `${py}px`);
    mistWrap.appendChild(p);
  }

  setTimeout(() => mistWrap.remove(), 2400);
}

function triggerMorsmordre() {
  playSfx('thunder');
  const overlay = document.createElement('div');
  overlay.className = 'morsmordre-overlay';
  overlay.innerHTML = `
    <div class="morsmordre-content">
      <svg class="morsmordre-skull-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15 C30 15 20 30 20 50 C20 65 30 75 40 75 L40 85 L60 85 L60 75 C70 75 80 65 80 50 C80 30 70 15 50 15 Z" fill="#10b981" opacity="0.85"/>
        <circle cx="38" cy="45" r="7" fill="#064e3b"/>
        <circle cx="62" cy="45" r="7" fill="#064e3b"/>
        <path d="M48 60 L50 56 L52 60 Z" fill="#064e3b"/>
      </svg>
      <div class="morsmordre-title">MORSMORDRE</div>
      <p class="morsmordre-sub">Just kidding. Hire him instead.</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 500);
  }, 2200);
}

function createSpellbookMarkup() {
  let spellbook = document.getElementById('spellbookModal');
  if (!spellbook) {
    spellbook = document.createElement('aside');
    spellbook.id = 'spellbookModal';
    spellbook.className = 'spellbook-modal';
    spellbook.setAttribute('role', 'dialog');
    spellbook.setAttribute('aria-modal', 'true');
    spellbook.setAttribute('aria-label', 'The Great Spellbook & Lexicon');

    spellbook.innerHTML = `
      <div class="spellbook-dossier" onclick="event.stopPropagation()">
        <div class="spellbook-header">
          <div>
            <div class="font-mono text-[10px] text-[var(--stamp-red)] font-bold tracking-widest uppercase">LEXICON OF SPELLS</div>
            <h3 class="font-headline text-2xl font-bold text-[var(--text-ink)]">The Standard Book of Spells</h3>
          </div>
          <button id="spellbookCloseBtn" class="btn-panel-return" aria-label="Close Spellbook">&times;</button>
        </div>

        <div class="spellbook-body">
          <p class="font-sans text-xs text-[var(--text-muted)] mb-4">
            Click any incantation or press its assigned shortcut key to trigger its corresponding system effect.
          </p>

          <div class="spells-registry-grid">
            ${spells.map(spell => `
              <div class="spell-registry-card" data-spell="${spell.id}">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-headline font-bold text-sm text-[var(--text-ink)]">${spell.incantation}</span>
                  ${spell.keys.length > 0 ? `<kbd class="spell-kbd">${spell.keys[0]}</kbd>` : ''}
                </div>
                <div class="font-mono text-[9px] text-[var(--stamp-red)] font-bold uppercase mb-1">${spell.label}</div>
                <p class="font-sans text-xs text-[var(--text-muted)] leading-relaxed m-0">${spell.description}</p>
                <div class="text-right mt-2">
                  <span class="text-[10px] font-mono text-[var(--accent-gold)] underline">CAST &rarr;</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="spellbook-footer">
          <span class="font-mono text-[10px] text-[#766953]">Press [?] anywhere to open &bull; [Esc] to dismiss</span>
          <button id="spellbookDismissBtn" class="btn-ink text-xs">CLOSE SPELLBOOK</button>
        </div>
      </div>
    `;

    document.body.appendChild(spellbook);

    const closeBtn = document.getElementById('spellbookCloseBtn');
    const dismissBtn = document.getElementById('spellbookDismissBtn');

    if (closeBtn) closeBtn.addEventListener('click', () => toggleSpellbook(false));
    if (dismissBtn) dismissBtn.addEventListener('click', () => toggleSpellbook(false));
    spellbook.addEventListener('click', (e) => {
      if (e.target === spellbook) toggleSpellbook(false);
    });
  }
}

export function toggleSpellbook(forceState) {
  const spellbook = document.getElementById('spellbookModal');
  if (!spellbook) return;

  spellbookOpen = typeof forceState === 'boolean' ? forceState : !spellbookOpen;

  if (spellbookOpen) {
    spellbook.classList.add('active');
    document.body.style.overflow = 'hidden';
    playSfx('paper');
  } else {
    spellbook.classList.remove('active');
    document.body.style.overflow = '';
  }
}
