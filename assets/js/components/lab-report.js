/**
 * The Laboratory Report & Forensics Inventory Component
 * Renders categorized technical inventory from data/skills.js with search and filter matrix.
 */

import { skills } from '../data/skills.js';

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
