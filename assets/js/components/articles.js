/**
 * Case Files & Articles Grid Component
 * Dynamically renders articles from data/projects.js with category filters and empty states.
 */

import { projects } from '../data/projects.js';
import { openCaseModal } from './modal.js';

let cleanups = [];
let currentCategory = 'all';

export function initArticles() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');

  renderArticles('all');

  filterBtns.forEach(btn => {
    const handler = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category') || 'all';
      currentCategory = cat;
      renderArticles(cat);
    };
    btn.addEventListener('click', handler);
    cleanups.push(() => btn.removeEventListener('click', handler));
  });

  return destroyArticles;
}

export function destroyArticles() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}

export function renderArticles(categoryKey = 'all') {
  const container = document.getElementById('articlesGrid');
  if (!container) return;

  const visibleProjects = projects.filter(p => !p.hidden);
  const filtered = categoryKey === 'all'
    ? visibleProjects
    : visibleProjects.filter(p => p.categoryKey === categoryKey || (categoryKey === 'cloud' && p.categoryKey === 'fullstack'));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 px-6 text-center border-2 border-dashed border-[var(--border-divider)] bg-[var(--bg-parchment-light)]">
        <div class="stamp-distressed text-xs inline-block mb-3">ARCHIVE EMPTY</div>
        <h4 class="font-serif text-xl font-bold text-[var(--text-ink)] mb-2">No Case Files Detected in this Sector</h4>
        <p class="font-sans text-xs text-[var(--text-muted)] max-w-md mx-auto mb-4">
          The records for this sector appear vanished or occluded. Cast <strong>REPARO</strong> to restore all dispatch records.
        </p>
        <button id="reparoResetBtn" class="btn-ink text-xs">CAST REPARO &crarr;</button>
      </div>
    `;

    const resetBtn = document.getElementById('reparoResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const allBtn = document.querySelector('.filter-tab-btn[data-category="all"]');
        if (allBtn) allBtn.click();
      });
    }
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isChart = item.id === 'devops-forge';
    const demoBadge = item.isDemo 
      ? `<span class="stamp-distressed text-[9px] px-1.5 py-0.5 ml-2">DEMO CASE FILE</span>` 
      : '';
    const dropCap = item.title.charAt(0);

    return `
      <article class="sub-article-card" data-category="${item.categoryKey}">
        <div>
          <div class="flex items-center justify-between flex-wrap gap-1 mb-1">
            <span class="article-category-tag">STN ${item.number} &bull; ${item.category.toUpperCase()}</span>
            ${demoBadge}
          </div>
          <h3 class="article-headline">${item.title}</h3>

          ${isChart ? `
            <div class="prophet-chart-box">
              <div class="chart-header-row">
                <span>JENKINS CI/CD SHARDING</span>
                <span class="text-[#9e1d1d] font-bold">-75% TIME</span>
              </div>
              <svg viewBox="0 0 200 70" class="chart-svg">
                <line x1="10" y1="10" x2="190" y2="10" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                <line x1="10" y1="35" x2="190" y2="35" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                <line x1="10" y1="60" x2="190" y2="60" stroke="var(--border-ink)" stroke-width="1"/>
                <polyline points="15,12 50,18 90,28 130,52 185,55" fill="none" stroke="var(--stamp-red)" stroke-width="2.5"/>
                <circle cx="15" cy="12" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Legacy: 120 Minutes"/>
                <circle cx="185" cy="55" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Optimized: 30 Minutes (-75%)"/>
                <text x="15" y="24" font-family="Space Mono" font-size="7" fill="var(--text-ink)">120m</text>
                <text x="155" y="50" font-family="Space Mono" font-size="7" fill="var(--stamp-red)" font-weight="bold">30m</text>
              </svg>
            </div>
          ` : ''}

          <div class="linotype-column mb-4">
            <span class="ornate-drop-box">${dropCap}</span>
            ${item.summary}
          </div>
        </div>

        <div>
          <div class="article-tags-wrap">
            ${item.technologies.slice(0, 4).map(tech => `<span class="stamp-badge">${tech}</span>`).join('')}
          </div>
          <div class="article-footer-row">
            <span class="font-mono text-xs text-[#766953]">STATION ${item.number}</span>
            <button class="btn-stamp-link" data-dossier-id="${item.id}" aria-label="Open case file for ${item.title}">OPEN CASE FILE &rarr;</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('.btn-stamp-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-dossier-id');
      if (caseId) openCaseModal(caseId);
    });
  });

  initChartTooltips();
}

function initChartTooltips() {
  const points = document.querySelectorAll('.chart-point');
  let tooltip = document.querySelector('.chart-tooltip');
  if (!tooltip && points.length > 0) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    document.body.appendChild(tooltip);
  }

  points.forEach(point => {
    point.addEventListener('mouseenter', () => {
      const text = point.getAttribute('data-tooltip');
      if (!text || !tooltip) return;
      tooltip.textContent = text;
      tooltip.style.opacity = '1';
      const rect = point.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX - 20}px`;
      tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
    });
    point.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.opacity = '0';
    });
  });
}
