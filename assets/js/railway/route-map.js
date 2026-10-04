/**
 * Parchment Route Map Component
 * Visual railway track with interactive station stops, gold seals, and progress line fill.
 */

import { projects } from '../data/projects.js';
import { store } from '../core/store.js';

let cleanups = [];

export function createRouteMapMarkup() {
  const visibleProjects = projects.filter(p => !p.hidden);

  return `
    <nav class="route-map-parchment" id="routeMap" aria-label="Railway Route Map">
      <div class="route-map-header">
        <span class="route-map-title">RISHI'S WIZARDING RAILWAY</span>
        <span class="route-map-tag">EXPRESS LINE &bull; 6 STATIONS</span>
      </div>

      <div class="route-track-wrap">
        <!-- Track Background & Fill Progress Line -->
        <div class="track-dashed-line"></div>
        <div class="track-fill-line" id="trackFillLine" style="transform: scaleX(0);"></div>

        <!-- Station Stop Nodes -->
        <div class="route-nodes-list" id="routeNodesList" role="list">
          ${visibleProjects.map((project, idx) => `
            <button 
              class="route-node-btn ${idx === 0 ? 'current' : 'upcoming'}" 
              data-station-index="${idx}"
              data-station-id="${project.id}"
              aria-label="Station ${project.number}: ${project.station}"
              ${idx === 0 ? 'aria-current="step"' : ''}
              role="listitem"
            >
              <div class="node-ring">
                <span class="node-number">${project.number}</span>
                <span class="node-seal" aria-hidden="true">★</span>
              </div>
              <div class="node-label-wrap">
                <span class="node-station-name">${project.station}</span>
                <span class="node-category">${project.categoryKey.toUpperCase()}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

export function initRouteMap(onStationSelect) {
  function bindNodes() {
    const nodeBtns = document.querySelectorAll('.route-node-btn');
    nodeBtns.forEach(btn => {
      const handler = () => {
        const idx = parseInt(btn.getAttribute('data-station-index'), 10);
        if (!isNaN(idx) && typeof onStationSelect === 'function') {
          onStationSelect(idx, { source: 'route-map' });
        }
      };
      btn.addEventListener('click', handler);
      cleanups.push(() => btn.removeEventListener('click', handler));
    });
  }

  bindNodes();

  const onSecretUnlocked = () => {
    const listEl = document.getElementById('routeNodesList');
    const tagEl = document.querySelector('.route-map-tag');
    const visibleProjects = projects.filter(p => !p.hidden);

    if (tagEl) {
      tagEl.innerHTML = `EXPRESS LINE &bull; ${visibleProjects.length} STATIONS <span style="color:var(--accent-crimson)">(VAULT OPEN)</span>`;
    }

    if (listEl) {
      listEl.innerHTML = visibleProjects.map((project, idx) => `
        <button 
          class="route-node-btn ${idx === store.get('activeStation') ? 'current' : 'upcoming'}" 
          data-station-index="${idx}"
          data-station-id="${project.id}"
          aria-label="Station ${project.number}: ${project.station}"
          ${idx === store.get('activeStation') ? 'aria-current="step"' : ''}
          role="listitem"
        >
          <div class="node-ring">
            <span class="node-number">${project.number}</span>
            <span class="node-seal" aria-hidden="true">${project.id === 'room-of-requirement' ? '⚡' : '★'}</span>
          </div>
          <div class="node-label-wrap">
            <span class="node-station-name">${project.station}</span>
            <span class="node-category">${project.categoryKey.toUpperCase()}</span>
          </div>
        </button>
      `).join('');
      bindNodes();
      updateRouteMapUI(store.get('activeStation'));
    }
  };

  window.addEventListener('chronicle:secret-unlocked', onSecretUnlocked);
  cleanups.push(() => window.removeEventListener('chronicle:secret-unlocked', onSecretUnlocked));

  return destroyRouteMap;
}

export function updateRouteMapUI(activeIndex) {
  const nodeBtns = document.querySelectorAll('.route-node-btn');
  const fillLine = document.getElementById('trackFillLine');

  const total = nodeBtns.length;
  if (total > 1 && fillLine) {
    const progress = Math.max(0, Math.min(1, activeIndex / (total - 1)));
    fillLine.style.transform = `scaleX(${progress})`;
  }

  nodeBtns.forEach((btn, idx) => {
    btn.classList.remove('visited', 'current', 'upcoming');
    btn.removeAttribute('aria-current');

    if (idx < activeIndex) {
      btn.classList.add('visited');
    } else if (idx === activeIndex) {
      btn.classList.add('current');
      btn.setAttribute('aria-current', 'step');
      // Scroll into view on mobile
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      btn.classList.add('upcoming');
    }
  });
}

export function destroyRouteMap() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}
