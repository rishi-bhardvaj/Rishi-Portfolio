/**
 * Incantation rules: which spell is spoken when a visitor does something.
 * First matching rule wins. `text` may be a string or a function of (matchedElement) evaluated AFTER the click's
 * own handlers ran, so it can read the new state (theme, sound, drawer...). Add `data-incant="WORD"` on any
 * element to override these rules without touching this file.
 */

import { store } from '../core/store.js';

const txt = (el) => (el.textContent || '').replace(/[→←↗↓↑]/g, '').trim().toUpperCase();

export const incantationRules = [
  { match: '#themeToggleBtn, #mobileThemeToggleBtn', text: () => (document.documentElement.classList.contains('theme-nox') ? 'NOX' : 'LUMOS') },
  { match: '#soundToggleBtn, #mobileSoundToggleBtn', text: () => (store.get('sound') ? 'SONORUS' : 'SILENCIO') },
  { match: '#musicToggleBtn, #mobileMusicToggleBtn', text: () => (store.get('music') ? 'CANTIS' : 'SILENCIO') },
  { match: '#mobileMenuToggle', text: () => 'ALOHOMORA' },
  { match: '#mobileNavClose, #mobileNavBackdrop, [data-act="close-drawer"], #modalCloseBtn, #modalBottomCloseBtn', text: () => 'COLLOPORTUS' },
  { match: '#btnBoardRailway', text: () => 'ALOHOMORA' },
  { match: '[data-act="next"]', text: () => 'LOCOMOTOR' },
  { match: '[data-act="open-drawer"]', text: () => 'ALOHOMORA' },
  { match: '.rm-node', text: () => 'APPARATE' },
  { match: '.hud-chip[href]', text: () => 'ACCIO' },
  { match: '.btn-stamp-link[data-dossier-id]', text: () => 'ALOHOMORA' },
  { match: '.filter-tab-btn, .lab-pill-btn', text: (el) => (/all/i.test(el.dataset.category || '') ? 'REPARO' : 'REVELIO') },
  { match: '.photo-filter-btn', text: () => 'TRANSFIGURO' },
  { match: '.potion-bottle, .ledger-expand-btn, .svc-card', text: () => 'REVELIO' },
  { match: '.copy-pill-btn', text: () => 'DUPLICARE' },
  { match: '#contactForm [type="submit"]', text: () => 'ACCIO OWL' },
  { match: '.btn-ink[href], .cta-work', text: () => 'ACCIO WORK' },
  { match: '.nav-link, .mobile-nav-link, .footer-links-list a', text: (el) => `ACCIO ${txt(el).replace(/^\d+\s*/, '').split(/\s+/).slice(0, 2).join(' ')}` },
  { match: '#footerOwlBtn', text: () => 'ACCIO OWL' },
];
