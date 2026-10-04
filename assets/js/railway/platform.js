/**
 * Platform 10¾ & Track Bed Component
 * Architectural platform edge, flickering Victorian brass lanterns, and wrought-iron split gates.
 */

export function createPlatformMarkup() {
  return `
    <div class="railway-platform-container" id="platformContainer">
      <!-- Wrought Iron Entrance Arch Sign -->
      <div class="platform-arch" id="platformArch">
        <div class="arch-brass-sign">
          <span class="arch-stars">★ ★ ★</span>
          <span class="arch-title">PLATFORM 10¾</span>
          <span class="arch-sub">THE WIZARDING RAILWAY &bull; EXPRESS LINE</span>
          <span class="arch-stars">★ ★ ★</span>
        </div>
      </div>

      <!-- 3 Flickering Gas Lanterns (Desynced animation) -->
      <div class="lantern lantern-1" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <div class="lantern lantern-2" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <div class="lantern lantern-3" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <!-- Platform Edge Flagstones -->
      <div class="platform-flagstones">
        <div class="stone-edge-line"></div>
        <div class="safety-yellow-stripe"></div>
      </div>

      <!-- Track Bed, Cross-Ties (Sleepers) & Steel Rails -->
      <div class="track-bed">
        <div class="track-ties"></div>
        <div class="rail rail-top"></div>
        <div class="rail rail-bottom"></div>
      </div>

      <!-- Dust Motes (12 ambient DOM motes) -->
      <div class="dust-motes-wrap" aria-hidden="true">
        <span class="dust-mote mote-1"></span>
        <span class="dust-mote mote-2"></span>
        <span class="dust-mote mote-3"></span>
        <span class="dust-mote mote-4"></span>
        <span class="dust-mote mote-5"></span>
        <span class="dust-mote mote-6"></span>
        <span class="dust-mote mote-7"></span>
        <span class="dust-mote mote-8"></span>
        <span class="dust-mote mote-9"></span>
        <span class="dust-mote mote-10"></span>
        <span class="dust-mote mote-11"></span>
        <span class="dust-mote mote-12"></span>
      </div>
    </div>
  `;
}

export function createCurtainGatesMarkup() {
  return `
    <div class="railway-curtain" id="railwayCurtain">
      <div class="curtain-gate curtain-gate-left" id="curtainGateLeft">
        <div class="gate-filigree">
          <div class="gate-crest-half">RB</div>
          <div class="gate-bars"></div>
        </div>
      </div>
      <div class="curtain-gate curtain-gate-right" id="curtainGateRight">
        <div class="gate-filigree">
          <div class="gate-crest-half">RB</div>
          <div class="gate-bars"></div>
        </div>
      </div>
    </div>
  `;
}
