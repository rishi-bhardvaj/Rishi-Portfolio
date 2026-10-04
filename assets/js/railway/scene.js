/**
 * Railway Scene Markup
 * Assembles the stage: world, track, train, foreground, route map, station card, HUD, walkthrough drawer and the platform gate.
 */

import { worldMarkup, foregroundMarkup, trainMarkup, tilesFor } from './art.js';
import { routeMapMarkup } from './route-map.js';
import { escapeHtml as esc } from '../core/dom.js';

const PUFFS = 5;
const EMBERS = 6;
const MOTES = 6;

/** Deterministic spread so ambient particles never bunch up. */
const spread = (i, min, max) => (min + ((i * 0.618034 + 0.13) % 1) * (max - min)).toFixed(1);

export function signsMarkup(stations) {
  const sign = (cls, i, num, name, cat) => `
    <div class="station-sign ${cls}" style="--i:${i}">
      <span class="ss-post" aria-hidden="true"></span>
      <div class="ss-board">
        <span class="ss-lamp ss-lamp-l" aria-hidden="true"></span><span class="ss-lamp ss-lamp-r" aria-hidden="true"></span>
        <div class="ss-num">${num}</div>
        <div class="ss-name">${esc(name)}</div>
        <div class="ss-cat">${esc(cat)}</div>
      </div>
    </div>`;
  return sign('is-platform', -0.55, '10&frac34;', 'PLATFORM', 'THE WIZARDING RAILWAY')
    + stations.map((p, i) => sign('', i, esc(p.number), p.station, p.category)).join('');
}

export function createSceneMarkup(stations) {
  const width = window.innerWidth || 1440;
  const tiles = tilesFor(width);
  const small = width < 720;
  return `
    <div class="railway-stage" id="railwayStage" data-state="idle">
      <div class="world" id="railwayWorld">
        ${worldMarkup(tiles, small)}
        <div class="signs-strip" id="signsStrip">${signsMarkup(stations)}</div>
      </div>

      <div class="track" aria-hidden="true">
        <div class="track-ballast"></div>
        <div class="track-sleepers" id="trackSleepers"></div>
        <div class="track-rail"></div>
      </div>

      <div class="train-rig" id="trainRig">
        ${trainMarkup()}
        <div class="steam" aria-hidden="true">${Array.from({ length: PUFFS }, (_, i) => `<i style="--k:${i}"></i>`).join('')}</div>
      </div>

      ${foregroundMarkup(tiles)}

      <div class="apron" aria-hidden="true"><div class="apron-seams" id="apronSeams"></div></div>

      <div class="ambient" aria-hidden="true">
        ${Array.from({ length: EMBERS }, (_, i) => `<i class="ember" style="left:${spread(i, 6, 94)}%;--dly:${(i * 0.9).toFixed(1)}s;--dur:${(5 + (i % 4)).toFixed(1)}s"></i>`).join('')}
        ${Array.from({ length: MOTES }, (_, i) => `<i class="mote" style="left:${spread(i + 3, 4, 96)}%;top:${spread(i, 12, 60)}%;--dly:${(i * 0.7).toFixed(1)}s"></i>`).join('')}
      </div>
      <div class="stage-vignette" aria-hidden="true"></div>

      ${routeMapMarkup(stations)}

      <article class="station-card" id="stationCard" aria-live="polite" aria-label="Current station"></article>

      <div class="hud" id="railwayHud">
        <div class="hud-group">
          <button type="button" class="hud-btn" data-spell="priorIncantato" aria-label="Previous station" title="Prior Incantato (&larr;)">&larr; <span>PRIOR</span></button>
          <span class="hud-count" id="hudCounter" aria-hidden="true">01 / 06</span>
          <button type="button" class="hud-btn" data-act="next" aria-label="Next station" title="Next station (&rarr;)"><span>NEXT</span> &rarr;</button>
        </div>
        <p class="hud-hint" aria-hidden="true"><span class="hud-wheel"></span>Scroll to travel &middot; &larr; &rarr; keys &middot; swipe</p>
        <div class="hud-group">
          <button type="button" class="hud-chip" id="hudProtegoBtn" data-spell="protego" aria-pressed="false" title="Protego: hold this station">
            <span class="hud-dot"></span>PROTEGO
          </button>
          <a class="hud-chip" href="#archives" title="Skip to the case files">SKIP &darr;</a>
        </div>
      </div>

      <div class="drawer-scrim" id="drawerScrim" data-act="close-drawer"></div>
      <aside class="station-drawer" id="stationDrawer" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="dwTitle" tabindex="-1"></aside>

      <div class="platform-gate" id="platformGate">
        <div class="gate-leaf gate-left" aria-hidden="true"><span class="gate-crest">RB</span></div>
        <div class="gate-leaf gate-right" aria-hidden="true"><span class="gate-crest">RB</span></div>
        <div class="gate-ticket" role="group" aria-labelledby="gateTitle">
          <div class="gt-eyebrow">THE WIZARDING RAILWAY</div>
          <h2 class="gt-title" id="gateTitle">YOUR PORTFOLIO AWAITS</h2>
          <p class="gt-copy">The express leaves in moments. ${stations.length} stations, one engineering career &mdash; from mission-critical banking cores to the laboratory.</p>
          <button type="button" class="gt-btn" id="btnBoardRailway"><span>PLATFORM 10&frac34;</span><i aria-hidden="true">&rarr;</i></button>
          <div class="gt-note">Press <kbd>Space</kbd> to board &middot; <a href="#archives">skip to case files</a></div>
        </div>
      </div>
    </div>`;
}
