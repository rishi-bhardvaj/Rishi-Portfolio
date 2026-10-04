/**
 * Railway Scene & Parallax World Component
 * Multi-layer gothic landscape parallax, atmospheric fog, and entrance portal overlay.
 */

import { createPlatformMarkup, createCurtainGatesMarkup } from './platform.js';
import { createTrainMarkup } from './train.js';
import { createRouteMapMarkup } from './route-map.js';

export function createSceneMarkup() {
  return `
    <div class="railway-stage" id="railwayStage">
      <!-- 1. Multi-Layer Parallax Landscape -->
      <div class="railway-world" id="railwayWorld">
        <!-- Far Layer: Sky, Starfield & Castle Spire Silhouette -->
        <div class="world-layer layer-sky" id="layerSky">
          <div class="gothic-spires-silhouette"></div>
          <div class="distant-moon"></div>
        </div>

        <!-- Mid-Far Layer: Misty Highland Hills -->
        <div class="world-layer layer-hills" id="layerHills">
          <div class="hills-silhouette"></div>
        </div>

        <!-- Mid Layer: Forest & Ancient Viaduct -->
        <div class="world-layer layer-trees" id="layerTrees">
          <div class="viaduct-arches"></div>
          <div class="forest-silhouette"></div>
        </div>

        <!-- Near Layer: Telegraph Lines & Platform Lamps -->
        <div class="world-layer layer-foreground" id="layerForeground">
          <div class="telegraph-poles"></div>
        </div>

        <!-- Ambient Ground Fog Drift Layer -->
        <div class="world-fog-layer" aria-hidden="true">
          <div class="fog-drift fog-1"></div>
          <div class="fog-drift fog-2"></div>
        </div>
      </div>

      <!-- 2. Platform Architecture & Track Bed -->
      ${createPlatformMarkup()}

      <!-- 3. Steam Train Assembly -->
      ${createTrainMarkup()}

      <!-- 4. Parchment Route Map Strip -->
      ${createRouteMapMarkup()}

      <!-- 5. Railway HUD (Station Indicator & Controls) -->
      <div class="railway-hud" id="railwayHud">
        <div class="hud-controls-left">
          <button id="hudPrevBtn" class="hud-nav-btn" aria-label="Prior Station" title="Prior Incantato (←)">
            &larr; PRIOR
          </button>
          <div class="hud-counter" id="hudCounter">01 / 06</div>
          <button id="hudNextBtn" class="hud-nav-btn" aria-label="Next Station" title="Next Station (→)">
            NEXT &rarr;
          </button>
        </div>

        <div class="hud-controls-right">
          <button id="hudProtegoBtn" class="hud-chip" aria-pressed="false" title="Protego (Pin Current Station)">
            <span class="hud-chip-dot"></span>
            <span>PROTEGO</span>
          </button>
          <button id="hudReboardBtn" class="hud-chip hidden sm:inline-flex" title="Return to Platform 10¾">
            REBOARD
          </button>
        </div>
      </div>

      <!-- 6. Wrought Iron Split Gates -->
      ${createCurtainGatesMarkup()}

      <!-- 7. Platform Entrance Overlay -->
      <div class="railway-intro" id="railwayIntro">
        <div class="intro-parchment-card">
          <div class="intro-eyebrow">THE WIZARDING RAILWAY</div>
          <h2 class="intro-headline">YOUR PORTFOLIO AWAITS</h2>
          <p class="intro-description">
            Step beyond the linotype columns. An expedition across mission-critical banking platforms, high-throughput marketplaces, and distributed systems.
          </p>
          <div class="intro-cta-wrap">
            <button id="btnBoardRailway" class="btn-platform-board">
              <span>BOARD PLATFORM 10¾</span>
              <span class="font-mono ml-2">&rarr;</span>
            </button>
          </div>
          <div class="intro-sub-note">
            Press <kbd>Space</kbd> or click to board &bull; Use <kbd>&larr;</kbd> <kbd>&rarr;</kbd> or swipe to travel
          </div>
        </div>
      </div>
    </div>

    <!-- 8. Interactive Station Dossier Panel (Slides over stage) -->
    <aside class="station-panel" id="stationPanel" aria-label="Station Case Study Panel" aria-live="polite">
      <!-- Injected dynamically via railway/station-panel.js -->
    </aside>
  `;
}
