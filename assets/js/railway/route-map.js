/**
 * Parchment Route Map
 * Station list is generated from project data. Progress is a single CSS variable, so scrubbing costs one style write.
 */

import { escapeHtml as esc } from '../core/dom.js';

export function routeMapMarkup(stations) {
  const n = stations.length;
  return `
    <nav class="route-map${n > 7 ? ' many' : ''}" id="routeMap" aria-label="Railway route map" style="--n:${n}">
      <div class="rm-head">
        <span class="rm-title">RISHI'S WIZARDING RAILWAY</span>
        <span class="rm-tag" id="routeTag">EXPRESS LINE &bull; ${String(n).padStart(2, '0')} STATIONS</span>
      </div>
      <div class="rm-track">
        <span class="rm-line" aria-hidden="true"></span>
        <span class="rm-fill" aria-hidden="true"></span>
        <ol class="rm-nodes">
          ${stations.map((p, i) => `
            <li>
              <button type="button" class="rm-node upcoming" data-station="${i}" aria-label="Station ${esc(p.number)}: ${esc(p.station)}">
                <span class="rm-ring"><b>${esc(p.number)}</b><i aria-hidden="true">&#10022;</i></span>
                <span class="rm-label">${esc(p.station)}</span>
              </button>
            </li>`).join('')}
        </ol>
      </div>
      <div class="rm-current" id="routeCurrent" aria-hidden="true"></div>
    </nav>`;
}

/** Continuous progress (0..1) from the scrubbed journey. */
export function setRouteProgress(map, p) {
  if (map) map.style.setProperty('--progress', p.toFixed(4));
}

/** Discrete state: visited / current / upcoming. */
export function updateRouteMap(map, idx, stations) {
  if (!map) return;
  map.querySelectorAll('.rm-node').forEach((btn, i) => {
    btn.classList.toggle('visited', i < idx);
    btn.classList.toggle('current', i === idx);
    btn.classList.toggle('upcoming', i > idx);
    if (i === idx) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
  });
  const cur = map.querySelector('#routeCurrent');
  if (cur && stations[idx]) cur.textContent = `${stations[idx].number} · ${stations[idx].station}`;
}
