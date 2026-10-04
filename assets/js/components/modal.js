/**
 * Case Dossier Modal Component
 * Accessible dialog with focus trap, focus restoration, inert background, and Esc key handling.
 */

import { getProjectById } from '../data/projects.js';
import { playSfx } from '../core/audio.js';

let lastActiveElement = null;
let cleanups = [];

export function initModal() {
  const modal = document.getElementById('caseModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const bottomCloseBtn = document.getElementById('modalBottomCloseBtn');

  if (closeBtn) {
    const onClose = () => closeCaseModal();
    closeBtn.addEventListener('click', onClose);
    cleanups.push(() => closeBtn.removeEventListener('click', onClose));
  }

  if (bottomCloseBtn) {
    const onBottomClose = () => closeCaseModal();
    bottomCloseBtn.addEventListener('click', onBottomClose);
    cleanups.push(() => bottomCloseBtn.removeEventListener('click', onBottomClose));
  }

  if (modal) {
    const onBackdrop = (e) => {
      if (e.target === modal) closeCaseModal();
    };
    modal.addEventListener('click', onBackdrop);
    cleanups.push(() => modal.removeEventListener('click', onBackdrop));
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('caseModal');
      if (m && m.classList.contains('active')) {
        closeCaseModal();
      }
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  return destroyModal;
}

export function destroyModal() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  closeCaseModal();
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

export function openCaseModal(caseId) {
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
    exhibitEl.textContent = `STATION ${project.number} // ${project.category.toUpperCase()} ${project.isDemo ? '[DEMO]' : '[VERIFIED]'}`;
  }
  if (titleEl) titleEl.textContent = project.title;
  if (domainEl) domainEl.textContent = `TARGET: ${project.station}`;
  if (timelineEl) timelineEl.textContent = `STATUS: ${project.status.toUpperCase()}`;
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
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (main) main.setAttribute('inert', '');

    playSfx('door');

    // Move focus to close button or first interactive element
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.focus();
  }
}

export function closeCaseModal() {
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

if (typeof window !== 'undefined') {
  window.openCaseModal = openCaseModal;
  window.closeCaseModal = closeCaseModal;
}
