// ==========================================================================
// FLYING OWL COMPONENT
// Animated Snowy Owl (Hedwig) Dispatch Animation carrying a sealed letter
// ==========================================================================

import { playWandChime } from './audio.js';

export function initOwl() {
  let overlay = document.getElementById('owlFlightOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'owlFlightOverlay';
    overlay.className = 'owl-flight-overlay';
    document.body.appendChild(overlay);
  }
}

export function triggerFlyingOwl(onComplete) {
  const overlay = document.getElementById('owlFlightOverlay') || document.body;
  overlay.classList.add('active');
  overlay.innerHTML = '';

  const owlWrapper = document.createElement('div');
  owlWrapper.className = 'flying-owl-wrapper';

  owlWrapper.innerHTML = `
    <!-- Animated Snowy Owl SVG -->
    <svg class="owl-body-svg" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Flapping Wing -->
      <g class="owl-left-wing">
        <path d="M65 45 C45 20, 10 15, 2 30 C0 45, 20 65, 55 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
        <!-- Feather Marks -->
        <path d="M25 32 Q35 40 45 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M15 40 Q30 50 40 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      </g>

      <!-- Right Flapping Wing -->
      <g class="owl-right-wing">
        <path d="M105 45 C125 20, 160 15, 168 30 C170 45, 150 65, 115 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
        <!-- Feather Marks -->
        <path d="M145 32 Q135 40 125 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M155 40 Q140 50 130 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      </g>

      <!-- Owl Torso & Tail -->
      <path d="M85 95 L78 115 L85 110 L92 115 Z" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
      <ellipse cx="85" cy="65" rx="26" ry="32" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
      
      <!-- Torso Feather Speckles -->
      <path d="M75 60 Q85 64 95 60" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M72 72 Q85 76 98 72" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M76 84 Q85 88 94 84" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Owl Head -->
      <circle cx="85" cy="38" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
      
      <!-- Eyes & Beak -->
      <circle cx="77" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="77" cy="36" r="3" fill="#0f172a"/>
      <circle cx="76" cy="34" r="1" fill="#ffffff"/>

      <circle cx="93" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="93" cy="36" r="3" fill="#0f172a"/>
      <circle cx="92" cy="34" r="1" fill="#ffffff"/>

      <!-- Golden Beak -->
      <polygon points="85,38 81,46 89,46" fill="#d97706" stroke="#1e293b" stroke-width="1"/>

      <!-- Talons Holding Envelope -->
      <path d="M78 95 Q76 102 80 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M92 95 Q94 102 90 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
    </svg>

    <!-- Parchment Letter with Red Wax Seal RB -->
    <div class="owl-letter-envelope">
      <div class="owl-wax-seal">RB</div>
    </div>
  `;

  overlay.appendChild(owlWrapper);

  // Play magical chime
  playWandChime();

  // Generate magical sparkle trail
  const sparkleInterval = setInterval(() => {
    const rect = owlWrapper.getBoundingClientRect();
    if (rect.right > 0 && rect.left < window.innerWidth) {
      createOwlSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
    }
  }, 75);

  setTimeout(() => {
    clearInterval(sparkleInterval);
    overlay.classList.remove('active');
    overlay.innerHTML = '';
    if (onComplete) onComplete();
  }, 3300);
}

function createOwlSparkle(x, y, parent) {
  const sparkle = document.createElement('div');
  sparkle.className = 'owl-sparkle-trail';
  const ox = (Math.random() - 0.5) * 40 - 20;
  const oy = (Math.random() - 0.5) * 40 + 20;
  sparkle.style.setProperty('--ox', `${ox}px`);
  sparkle.style.setProperty('--oy', `${oy}px`);
  sparkle.style.left = `${x + (Math.random() - 0.5) * 20}px`;
  sparkle.style.top = `${y + (Math.random() - 0.5) * 20}px`;

  parent.appendChild(sparkle);
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
}
