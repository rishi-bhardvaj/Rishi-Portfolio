/**
 * Marauder's Map Component
 * Interactive architectural floorplan of the portfolio.
 * "I solemnly swear that I am up to no good." -> "Mischief managed."
 */

import { navSections } from '../data/navigation.js';
import { playSfx } from '../core/audio.js';
import { showToast, trapFocus } from '../core/dom.js';

let modalEl = null;
let cleanups = [];
let previousActiveElement = null;
let untrapFocus = null;

const CHAMBER_ICONS = {
  home: '✒️',
  work: '🚂',
  stack: '⚗️',
  ledger: '📜',
  contact: '🦉'
};

function createMarauderModalMarkup() {
  return `
    <div id="marauderModal" class="marauder-modal" role="dialog" aria-modal="true" aria-labelledby="marauderHeading" aria-hidden="true">
      <div class="marauder-parchment-sheet" onclick="event.stopPropagation()">
        
        <!-- Header Crest & Inscription -->
        <header class="marauder-header">
          <div class="marauder-creators">Messrs Moony, Wormtail, Padfoot &amp; Prongs</div>
          <div class="marauder-motto">Purveyors of Aids to Magical Mischief-Makers &bull; Anno 2026</div>
          <h2 id="marauderHeading" class="marauder-title">The Marauder's Map</h2>
          <div class="marauder-subtitle">Spatial Floorplan &amp; Waypoints of Rishi Bhardvaj</div>
        </header>

        <!-- Floorplan Blueprint Stage -->
        <div class="marauder-floorplan" id="marauderFloorplan">
          
          <!-- SVG Connecting Corridors & Labyrinth -->
          <svg class="marauder-svg-blueprint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <!-- Architectural Wall Outlines -->
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#7c5c3b" stroke-width="0.8" opacity="0.4" />
            <rect x="8" y="8" width="84" height="84" fill="none" stroke="#7c5c3b" stroke-width="0.4" stroke-dasharray="1 1" opacity="0.3" />
            
            <!-- Dynamic Corridor Paths -->
            <path class="marauder-corridor-path" d="M 50 15 L 26 38" />
            <path class="marauder-corridor-path" d="M 50 15 L 74 48" />
            <path class="marauder-corridor-path" d="M 26 38 L 74 48" />
            <path class="marauder-corridor-path" d="M 26 38 L 28 72" />
            <path class="marauder-corridor-path" d="M 74 48 L 72 84" />
            <path class="marauder-corridor-path" d="M 28 72 L 72 84" />
          </svg>

          <!-- Animated Footstep Track Dots -->
          <div class="marauder-footprints-track" aria-hidden="true">
            <span class="marauder-footstep" style="top: 24%; left: 37%; transform: rotate(45deg); animation-delay: 0s;"></span>
            <span class="marauder-footstep" style="top: 28%; left: 41%; transform: rotate(45deg); animation-delay: 0.6s;"></span>
            <span class="marauder-footstep" style="top: 32%; left: 45%; transform: rotate(45deg); animation-delay: 1.2s;"></span>
            
            <span class="marauder-footstep" style="top: 42%; left: 46%; transform: rotate(90deg); animation-delay: 1.8s;"></span>
            <span class="marauder-footstep" style="top: 43%; left: 54%; transform: rotate(90deg); animation-delay: 2.4s;"></span>
            
            <span class="marauder-footstep" style="top: 55%; left: 27%; transform: rotate(0deg); animation-delay: 0.8s;"></span>
            <span class="marauder-footstep" style="top: 61%; left: 28%; transform: rotate(0deg); animation-delay: 1.4s;"></span>

            <span class="marauder-footstep" style="top: 62%; left: 73%; transform: rotate(0deg); animation-delay: 2.1s;"></span>
            <span class="marauder-footstep" style="top: 72%; left: 72%; transform: rotate(0deg); animation-delay: 2.7s;"></span>
          </div>

          <!-- Wandering Persona Ribbon -->
          <div class="marauder-person-ribbon" title="Engineer on site">
            <span>Rishi Bhardvaj</span>
          </div>

          <!-- Destination Chambers Rendered Dynamically from navSections -->
          ${navSections.map(sec => `
            <button 
              type="button"
              class="marauder-chamber"
              style="left: ${sec.mapPos.x}%; top: ${sec.mapPos.y}%;"
              data-target-id="${sec.id}"
              aria-label="Travel to ${sec.fullName}: ${sec.sub}"
            >
              <span class="marauder-chamber-icon" aria-hidden="true">${CHAMBER_ICONS[sec.id] || '📍'}</span>
              <span class="marauder-chamber-name">${sec.label}</span>
              <span class="marauder-chamber-sub">${sec.sub}</span>
            </button>
          `).join('')}

        </div>

        <!-- Footer Control Strip -->
        <footer class="marauder-footer">
          <div class="marauder-hint">
            &ldquo;I solemnly swear that I am up to no good.&rdquo;
          </div>
          <button type="button" class="marauder-close-btn" id="btnMischiefManaged">
            <span>&times;</span>
            <span>Mischief Managed</span>
          </button>
        </footer>

      </div>
    </div>
  `;
}

export function openMarauderMap() {
  if (!modalEl) return;
  previousActiveElement = document.activeElement;

  playSfx('paper');
  modalEl.classList.add('active');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  untrapFocus = trapFocus(modalEl);

  const closeBtn = document.getElementById('btnMischiefManaged');
  if (closeBtn) {
    closeBtn.focus();
  }
}

export function closeMarauderMap(reason = 'close') {
  if (!modalEl || !modalEl.classList.contains('active')) return;

  playSfx('paper');
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (typeof untrapFocus === 'function') {
    untrapFocus();
    untrapFocus = null;
  }

  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
}

export function initMarauder() {
  // Inject modal into DOM if not existing
  let existingModal = document.getElementById('marauderModal');
  if (!existingModal) {
    document.body.insertAdjacentHTML('beforeend', createMarauderModalMarkup());
    modalEl = document.getElementById('marauderModal');
  } else {
    modalEl = existingModal;
  }

  // Handle Chamber Navigation Clicks
  const chamberBtns = modalEl.querySelectorAll('.marauder-chamber');
  chamberBtns.forEach(btn => {
    const onChamberClick = () => {
      const targetId = btn.getAttribute('data-target-id');
      const targetEl = document.getElementById(targetId);
      
      closeMarauderMap('navigate');
      playSfx('click');

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        showToast('Mischief managed.');
      }
    };
    btn.addEventListener('click', onChamberClick);
    cleanups.push(() => btn.removeEventListener('click', onChamberClick));
  });

  // Handle "Mischief Managed" Close Button
  const closeBtn = document.getElementById('btnMischiefManaged');
  if (closeBtn) {
    const onCloseClick = () => {
      closeMarauderMap('button');
      showToast('Mischief managed.');
    };
    closeBtn.addEventListener('click', onCloseClick);
    cleanups.push(() => closeBtn.removeEventListener('click', onCloseClick));
  }

  // Handle Backdrop click
  const onBackdropClick = (e) => {
    if (e.target === modalEl) {
      closeMarauderMap('backdrop');
      showToast('Mischief managed.');
    }
  };
  modalEl.addEventListener('click', onBackdropClick);
  cleanups.push(() => modalEl.removeEventListener('click', onBackdropClick));

  // Handle Escape key
  const onKey = (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('active')) {
      e.preventDefault();
      closeMarauderMap('escape');
      showToast('Mischief managed.');
    }
  };
  window.addEventListener('keydown', onKey);
  cleanups.push(() => window.removeEventListener('keydown', onKey));

  // Attach to all elements that have [data-open-marauder] or .marauder-entry-link
  const triggerLinks = document.querySelectorAll('[data-open-marauder], .marauder-entry-link');
  triggerLinks.forEach(link => {
    const onTrigger = (e) => {
      e.preventDefault();
      openMarauderMap();
    };
    link.addEventListener('click', onTrigger);
    cleanups.push(() => link.removeEventListener('click', onTrigger));
  });

  return destroyMarauder;
}

export function destroyMarauder() {
  if (modalEl && modalEl.classList.contains('active')) {
    closeMarauderMap('destroy');
  }
  cleanups.forEach(fn => fn());
  cleanups = [];
}
