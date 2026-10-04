/**
 * Career Ledger Component
 * Renders career movements from data/experience.js with expandable forensics details.
 */

import { experience } from '../data/experience.js';

let cleanups = [];

export function initLedger() {
  const container = document.querySelector('.ledger-timeline');
  if (!container) return () => {};

  container.innerHTML = experience.map((item, idx) => `
    <article class="ledger-row" data-ledger-id="${item.id}">
      <div class="ledger-period">
        <span>${item.period}</span>
      </div>
      <div class="ledger-role-box">
        <h3 class="ledger-role-title">${item.role}</h3>
        <div class="ledger-company">${item.company}</div>
        <div class="font-mono text-[10px] text-[var(--text-muted)]">${item.location}</div>
      </div>
      <div>
        <p class="ledger-desc">
          ${item.description}
        </p>
        <div class="ledger-badge-list">
          ${item.badges.map(b => `<span class="stamp-badge">${b}</span>`).join('')}
        </div>
        <button class="ledger-expand-btn mt-3 text-xs font-mono font-bold text-[var(--stamp-red)] hover:underline flex items-center gap-1.5" aria-expanded="false" aria-controls="ledger-detail-${item.id}">
          <span>[+] EXPAND FORENSIC DOSSIER</span>
        </button>
        <div id="ledger-detail-${item.id}" class="ledger-expandable-content hidden mt-3 pt-3 border-t border-dashed border-[var(--border-divider)]">
          <ul class="space-y-1.5 text-xs font-sans text-[var(--text-ink)] list-disc list-inside">
            ${item.details.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      </div>
    </article>
  `).join('');

  const expandBtns = container.querySelectorAll('.ledger-expand-btn');
  expandBtns.forEach(btn => {
    const handler = () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const detailId = btn.getAttribute('aria-controls');
      const detailEl = document.getElementById(detailId);
      const span = btn.querySelector('span');

      if (!detailEl) return;

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        detailEl.classList.add('hidden');
        if (span) span.textContent = '[+] EXPAND FORENSIC DOSSIER';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        detailEl.classList.remove('hidden');
        if (span) span.textContent = '[-] COLLAPSE FORENSIC DOSSIER';
      }
    };
    btn.addEventListener('click', handler);
    cleanups.push(() => btn.removeEventListener('click', handler));
  });

  return destroyLedger;
}

export function destroyLedger() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}
