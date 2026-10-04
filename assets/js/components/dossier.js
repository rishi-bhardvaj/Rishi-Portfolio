/**
 * Project Dossier Component
 * Parchment case dossier with cracked wax seal, focus trap, and full investigative disclosures.
 */

import { getProjectById } from '../data/projects.js';
import { playSfx } from '../core/audio.js';
import { showToast } from '../core/dom.js';

let lastActiveElement = null;
let cleanups = [];

export function initDossier() {
  const modal = document.getElementById('caseModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const bottomCloseBtn = document.getElementById('modalBottomCloseBtn');

  if (closeBtn) {
    const onClose = () => closeDossier();
    closeBtn.addEventListener('click', onClose);
    cleanups.push(() => closeBtn.removeEventListener('click', onClose));
  }

  if (bottomCloseBtn) {
    const onBottomClose = () => closeDossier();
    bottomCloseBtn.addEventListener('click', onBottomClose);
    cleanups.push(() => bottomCloseBtn.removeEventListener('click', onBottomClose));
  }

  if (modal) {
    const onBackdrop = (e) => {
      if (e.target === modal) closeDossier();
    };
    modal.addEventListener('click', onBackdrop);
    cleanups.push(() => modal.removeEventListener('click', onBackdrop));
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('caseModal');
      if (m && m.classList.contains('active')) {
        closeDossier();
      }
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  return destroyDossier;
}

export function destroyDossier() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  closeDossier();
}

function trapFocus(e) {
  const modal = document.getElementById('caseModal');
  if (!modal || !modal.classList.contains('active')) return;

  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

export function openDossier(caseId) {
  const project = getProjectById(caseId);
  if (!project) return;

  lastActiveElement = document.activeElement;

  const exhibitEl = document.getElementById('modalExhibit');
  const titleEl = document.getElementById('modalTitle');
  const domainEl = document.getElementById('modalDomain');
  const timelineEl = document.getElementById('modalTimeline');
  const descEl = document.getElementById('modalDescription');
  const techContainer = document.getElementById('modalTechStack');
  const metricsContainer = document.getElementById('modalMetrics');

  if (exhibitEl) {
    exhibitEl.textContent = `EXHIBIT // STATION ${project.number} &bull; ${project.category.toUpperCase()} ${project.isDemo ? '[DEMO]' : '[VERIFIED]'}`;
  }
  if (titleEl) titleEl.textContent = project.title;
  if (domainEl) domainEl.textContent = `TARGET: ${project.station}`;
  if (timelineEl) timelineEl.textContent = `STATUS: ${project.status.toUpperCase()} &bull; ORDER: ${project.order}`;
  if (descEl) descEl.textContent = project.description;

  if (techContainer) {
    techContainer.innerHTML = project.technologies.map(t => `<span class="stamp-badge">${t}</span>`).join('');
  }

  if (metricsContainer) {
    const metricLines = project.result.metrics.map(m => `<li><strong>${m.label}:</strong> ${m.value}</li>`).join('');
    metricsContainer.innerHTML = `
      <li class="font-bold text-[var(--stamp-red)] mb-1">${project.result.summary}</li>
      ${metricLines}
    `;
  }

  const modal = document.getElementById('caseModal');
  const main = document.querySelector('.broadsheet-wrapper');

  if (modal) {
    // Add wax seal element if not present
    let seal = modal.querySelector('.dossier-wax-seal');
    if (!seal) {
      seal = document.createElement('div');
      seal.className = 'dossier-wax-seal';
      seal.textContent = 'RB';
      const dossierBox = modal.querySelector('.modal-dossier');
      if (dossierBox) dossierBox.appendChild(seal);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (main) main.setAttribute('inert', '');

    playSfx('door');

    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.focus();
  }
}

export function closeDossier() {
  const modal = document.getElementById('caseModal');
  const main = document.querySelector('.broadsheet-wrapper');

  if (modal && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (main) main.removeAttribute('inert');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
      lastActiveElement = null;
    }
  }
}

// Global Aliases
if (typeof window !== 'undefined') {
  window.openCaseModal = openDossier;
  window.closeCaseModal = closeDossier;
  window.openDossier = openDossier;
  window.closeDossier = closeDossier;
}
