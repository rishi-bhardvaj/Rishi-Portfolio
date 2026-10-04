/**
 * The Laboratory Report & Potion Cabinet Component
 * Renders the 7-shelf Potion Cabinet alongside an accessible tabular forensics disclosure.
 */

import { skills } from '../data/skills.js';
import { playSfx } from '../core/audio.js';

let cleanups = [];
let currentCategory = 'all';
let searchQuery = '';

export function initLabReport() {
  const searchInput = document.getElementById('skillSearchInput');
  const pillBtns = document.querySelectorAll('.lab-pill-btn');

  renderLabReport();

  if (searchInput) {
    const onSearch = (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderLabReport();
    };
    searchInput.addEventListener('input', onSearch);
    cleanups.push(() => searchInput.removeEventListener('input', onSearch));
  }

  pillBtns.forEach(btn => {
    const onPill = () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'all';
      renderLabReport();
    };
    btn.addEventListener('click', onPill);
    cleanups.push(() => btn.removeEventListener('click', onPill));
  });

  return destroyLabReport;
}

export function destroyLabReport() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}

export function renderLabReport() {
  const tableBody = document.getElementById('forensicsTableBody');
  const mobileCardsContainer = document.getElementById('forensicsMobileCards');
  const countBadge = document.getElementById('skillCountBadge');
  const stackSection = document.getElementById('stack');

  const filtered = skills.filter(skill => {
    const matchesCat = currentCategory === 'all' || 
      skill.category === currentCategory || 
      (currentCategory === 'devops' && skill.category === 'cloud') ||
      (currentCategory === 'ui' && skill.category === 'frontend');

    const matchesSearch = !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery) ||
      skill.code.toLowerCase().includes(searchQuery) ||
      skill.description.toLowerCase().includes(searchQuery) ||
      skill.potionLabel.toLowerCase().includes(searchQuery);

    return matchesCat && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} SUBSTANCES DETECTED`;
  }

  // 1. Render Potion Cabinet (Inject before or wrap forensics table)
  renderPotionCabinet(stackSection, filtered);

  // 2. Render Forensics Table Fallback
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8 font-mono text-xs text-[#766953]">
            NO SUBSTANCES DETECTED MATCHING QUERY &bull; 
            <button id="obliviateClearBtn" class="underline text-[var(--stamp-red)] font-bold ml-1">CAST OBLIVIATE TO CLEAR</button>
          </td>
        </tr>
      `;
      const obliviateBtn = document.getElementById('obliviateClearBtn');
      if (obliviateBtn) {
        obliviateBtn.addEventListener('click', () => {
          const input = document.getElementById('skillSearchInput');
          if (input) {
            input.value = '';
            searchQuery = '';
            renderLabReport();
          }
        });
      }
    } else {
      tableBody.innerHTML = filtered.map(skill => {
        const badgeClass = skill.levelType === 'primary' ? 'stamp-red-box' : 'stamp-black-box';
        return `
          <tr>
            <td class="font-serif text-base sm:text-lg text-[var(--text-ink)] font-bold">
              ${skill.name}
              <div class="font-sans text-xs text-[var(--text-muted)] font-normal mt-0.5">
                ${skill.description}
                <span class="font-mono text-[10px] text-[var(--stamp-red)] ml-1.5 italic font-bold">(${skill.potionLabel})</span>
              </div>
            </td>
            <td class="font-mono text-xs text-[var(--text-muted)]">${skill.code}</td>
            <td class="font-mono text-xs text-[var(--text-muted)]">${skill.detected}</td>
            <td class="text-right"><span class="${badgeClass}">${skill.finding}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. Render Forensics Mobile Cards
  if (mobileCardsContainer) {
    if (filtered.length === 0) {
      mobileCardsContainer.innerHTML = `
        <div class="text-center py-6 font-mono text-xs text-[#766953] border border-dashed border-[#b09e75]">
          NO SUBSTANCES DETECTED MATCHING QUERY
        </div>
      `;
    } else {
      mobileCardsContainer.innerHTML = filtered.map(skill => {
        const badgeClass = skill.levelType === 'primary' ? 'stamp-red-box' : 'stamp-black-box';
        return `
          <div class="forensics-mobile-card">
            <div class="forensics-card-top">
              <span class="font-mono text-xs font-bold text-[var(--text-muted)]">${skill.code} // ${skill.categoryLabel}</span>
              <span class="${badgeClass}">${skill.finding}</span>
            </div>
            <h4 class="font-serif text-lg font-bold text-[var(--text-ink)]">${skill.name}</h4>
            <p class="font-sans text-xs text-[var(--text-muted)]">${skill.description}</p>
            <div class="flex items-center justify-between pt-1 font-mono text-[10px] text-[#766953]">
              <span>Detected: <strong>${skill.detected}</strong></span>
              <span class="italic text-[var(--stamp-red)]">${skill.potionLabel}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderPotionCabinet(stackSection, filteredSkills) {
  if (!stackSection) return;

  let cabinet = document.getElementById('potionCabinet');
  if (!cabinet) {
    cabinet = document.createElement('div');
    cabinet.id = 'potionCabinet';
    cabinet.className = 'potion-cabinet mb-8';

    // Insert cabinet right above the forensics table
    const tableContainer = stackSection.querySelector('.forensics-table-container');
    if (tableContainer) {
      tableContainer.parentNode.insertBefore(cabinet, tableContainer);
    } else {
      stackSection.appendChild(cabinet);
    }
  }

  // 7 shelves definition
  const shelfCategories = [
    { id: 'backend', label: 'Backend Core' },
    { id: 'frontend', label: 'Frontend UI' },
    { id: 'database', label: 'Databases & Relational' },
    { id: 'security', label: 'Security & Auth' },
    { id: 'devops', label: 'DevOps & Infrastructure' },
    { id: 'cloud', label: 'Cloud Systems' },
    { id: 'aiml', label: 'AI & Research' }
  ];

  const populatedShelves = shelfCategories.map(shelf => {
    const shelfItems = filteredSkills.filter(s => s.category === shelf.id);
    if (shelfItems.length === 0) return '';

    return `
      <div class="potion-shelf">
        <span class="shelf-label">${shelf.label}</span>
        <div class="shelf-bottles-row">
          ${shelfItems.map(skill => renderPotionBottle(skill)).join('')}
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  cabinet.innerHTML = `
    <div class="cabinet-header">
      <div>
        <span class="font-mono text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">THE APOTHECARY</span>
        <h3 class="cabinet-title">Potion Cabinet of Technical Mastery</h3>
      </div>
      <div class="font-mono text-xs text-[#b09e75]">Hover or tap phials for Revelio disclosure</div>
    </div>
    <div class="cabinet-shelves-grid">
      ${populatedShelves || '<div class="text-center py-6 font-mono text-xs text-[#b09e75]">No potions currently brewed for this query.</div>'}
    </div>
  `;

  // Attach acoustic clicks to potion bottles
  cabinet.querySelectorAll('.potion-bottle').forEach(bottle => {
    bottle.addEventListener('click', () => playSfx('wand'));
  });
}

function renderPotionBottle(skill) {
  const liquidFillY = 80 - (skill.level * 0.55); // Fill height calculation
  return `
    <div class="potion-bottle" tabindex="0" role="button" aria-label="${skill.name}: ${skill.potionLabel}">
      <!-- Floating Revelio Card -->
      <div class="potion-revelio-card">
        <div class="revelio-card-title">${skill.name}</div>
        <div class="font-mono text-[9px] text-[var(--stamp-red)] font-bold mb-1">${skill.potionLabel}</div>
        <p class="revelio-card-desc">${skill.description}</p>
        <div class="revelio-card-footer">
          <span>Potency: <strong>${skill.level}%</strong></span>
          <span class="text-[var(--stamp-red)] font-bold">${skill.finding}</span>
        </div>
      </div>

      <!-- SVG Phial with Dynamic Liquid Level -->
      <svg class="potion-phial-svg" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="liquidGrad-${skill.id}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${skill.color}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${skill.color}" stop-opacity="0.6"/>
          </linearGradient>
          <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
            <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/>
          </linearGradient>
        </defs>

        <!-- Wooden Cork Stopper -->
        <polygon points="24,4 36,4 34,14 26,14" fill="#8c5828" stroke="#4a280c" stroke-width="1"/>
        <line x1="25" y1="8" x2="35" y2="8" stroke="#4a280c" stroke-width="0.75"/>

        <!-- Glass Bottle Body Outline & Liquid Fill -->
        <g>
          <!-- Bottle Neck & Shoulder -->
          <path d="M25,14 L35,14 L35,26 C48,32 52,48 52,65 C52,78 44,84 30,84 C16,84 8,78 8,65 C8,48 12,32 25,26 Z" 
                fill="#14100c" 
                stroke="#d4af37" 
                stroke-width="1.5"/>

          <!-- Dynamic Colored Liquid Level -->
          <clipPath id="bottleClip-${skill.id}">
            <path d="M25,14 L35,14 L35,26 C48,32 52,48 52,65 C52,78 44,84 30,84 C16,84 8,78 8,65 C8,48 12,32 25,26 Z"/>
          </clipPath>
          <rect x="0" y="${liquidFillY.toFixed(1)}" width="60" height="90" fill="url(#liquidGrad-${skill.id})" clip-path="url(#bottleClip-${skill.id})"/>

          <!-- Glass Sheen Overlay -->
          <path d="M12,45 C12,35 18,28 26,26 L26,16" stroke="url(#glassReflection)" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>

      <span class="potion-bottle-name">${skill.code}</span>
      <span class="potion-bottle-label">${skill.level}%</span>
    </div>
  `;
}
