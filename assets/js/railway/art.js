/**
 * Railway Art
 * Procedural SVG artwork for the wizarding railway: parallax world tiles and the steam train.
 * Everything here is original vector art generated from code (no external or film assets).
 */

export const TILE = 1600;
const TAU = Math.PI * 2;

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seamless ridge line: integer harmonics over the tile width guarantee y(0) === y(TILE). */
function ridge(base, harmonics) {
  const pts = [];
  for (let x = 0; x <= TILE; x += 20) {
    let y = base;
    for (const [amp, freq, phase] of harmonics) y += amp * Math.sin((x / TILE) * TAU * freq + phase);
    pts.push([x, y]);
  }
  return pts;
}

const toPath = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

/* ---------- WORLD TILES ---------- */

function farTile() {
  const pts = ridge(330, [[34, 3, 1.2], [20, 7, 2.1], [9, 13, 0.4]]);
  const mountains = `${toPath(pts)}L${TILE},520L0,520Z`;

  // Castle perched on a crag, fully inside the tile so it repeats cleanly.
  const cx = 1040;
  const gy = 318;
  const towers = [
    { dx: -150, w: 34, h: 120, roof: 62 }, { dx: -104, w: 44, h: 86, roof: 0 },
    { dx: -48, w: 58, h: 178, roof: 96 }, { dx: 24, w: 40, h: 124, roof: 66 },
    { dx: 74, w: 52, h: 92, roof: 0 }, { dx: 128, w: 32, h: 146, roof: 74 },
  ];
  let castle = `<path d="M${cx - 230},${gy + 40} Q${cx - 150},${gy - 4} ${cx - 40},${gy + 4} T${cx + 220},${gy + 42}Z"/>`;
  castle += `<rect x="${cx - 150}" y="${gy - 56}" width="300" height="60"/>`;
  let windows = '';
  const r = rng(11);
  for (const t of towers) {
    const x = cx + t.dx;
    castle += `<rect x="${x}" y="${gy - t.h}" width="${t.w}" height="${t.h + 4}"/>`;
    if (t.roof) {
      castle += `<polygon points="${x - 4},${gy - t.h} ${x + t.w / 2},${gy - t.h - t.roof} ${x + t.w + 4},${gy - t.h}"/>`;
    } else {
      for (let c = 0; c < t.w; c += 10) castle += `<rect x="${x + c}" y="${gy - t.h - 7}" width="6" height="8"/>`;
    }
    const rows = Math.floor(t.h / 34);
    for (let i = 0; i < rows; i++) {
      if (r() > 0.45) windows += `<rect x="${x + t.w / 2 - 2}" y="${gy - t.h + 18 + i * 30}" width="4" height="8" rx="2"/>`;
    }
  }
  return `
    <svg viewBox="0 0 ${TILE} 520" preserveAspectRatio="none" aria-hidden="true">
      <path d="${mountains}" fill="url(#gFar)"/>
      <g fill="url(#gCastle)">${castle}</g>
      <g fill="#ffcf7a" opacity=".85">${windows}</g>
    </svg>`;
}

function hillsTile() {
  const pts = ridge(150, [[34, 2, 0.4], [16, 5, 2.4], [8, 11, 1.1]]);
  const r = rng(29);
  let lights = '';
  for (let i = 0; i < 7; i++) {
    const x = 90 + r() * (TILE - 180);
    const idx = Math.round(x / 20);
    lights += `<circle cx="${x.toFixed(0)}" cy="${(pts[idx][1] + 22 + r() * 40).toFixed(0)}" r="1.7"/>`;
  }
  return `
    <svg viewBox="0 0 ${TILE} 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="${toPath(pts)}L${TILE},300L0,300Z" fill="url(#gHill)"/>
      <g fill="#ffd98a" opacity=".8">${lights}</g>
    </svg>`;
}

function forestTile() {
  const r = rng(7);
  const row = (min, max, step, base, fill, opacity) => {
    let out = `<g fill="${fill}" opacity="${opacity}">`;
    for (let x = 14; x < TILE - 30; x += step * (0.7 + r() * 0.6)) {
      const h = min + r() * (max - min);
      const w = h * 0.34;
      // Three stacked tiers read as a pine silhouette
      out += `<path d="M${x},${base} L${x - w},${base - h * 0.42} L${x - w * 0.6},${base - h * 0.42} L${x - w * 0.82},${base - h * 0.7} L${x - w * 0.42},${base - h * 0.7} L${x},${base - h} L${x + w * 0.42},${base - h * 0.7} L${x + w * 0.82},${base - h * 0.7} L${x + w * 0.6},${base - h * 0.42} L${x + w},${base - h * 0.42}Z"/>`;
    }
    return `${out}</g>`;
  };
  return `
    <svg viewBox="0 0 ${TILE} 260" preserveAspectRatio="none" aria-hidden="true">
      ${row(70, 150, 38, 260, '#150a17', 1)}
      ${row(90, 190, 52, 260, '#0b060d', 1)}
    </svg>`;
}

function sagWire(x1, x2, y, sag, clipMin, clipMax) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const x = x1 + ((x2 - x1) * i) / 24;
    if (x < clipMin || x > clipMax) continue;
    const t = i / 24;
    pts.push([x, y + sag * 4 * t * (1 - t)]);
  }
  return pts.length > 1 ? `<path d="${toPath(pts)}" stroke="#0a0609" stroke-width="1.6" fill="none"/>` : '';
}

function polesTile() {
  const poles = [300, 1100];
  const y = 70;
  let svg = '';
  for (const px of poles) {
    svg += `<g fill="#0a0609"><rect x="${px - 5}" y="${y - 18}" width="10" height="260"/>
      <rect x="${px - 38}" y="${y}" width="76" height="6"/><rect x="${px - 28}" y="${y + 36}" width="56" height="5"/></g>
      <g fill="#6b5a3f"><circle cx="${px - 34}" cy="${y - 4}" r="3"/><circle cx="${px + 34}" cy="${y - 4}" r="3"/>
      <circle cx="${px - 24}" cy="${y + 32}" r="2.6"/><circle cx="${px + 24}" cy="${y + 32}" r="2.6"/></g>`;
  }
  // Wires run pole to pole including across tile seams (clipped, so tiles join seamlessly)
  for (const off of [-1, 0]) {
    poles.forEach((p, i) => {
      const x1 = p + off * TILE;
      const x2 = (i + 1 < poles.length ? poles[i + 1] + off * TILE : poles[0] + (off + 1) * TILE);
      for (const dy of [0, 38]) svg += sagWire(x1, x2, y + dy, 22, 0, TILE);
    });
  }
  return `<svg viewBox="0 0 ${TILE} 260" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`;
}

function lamp(x, cls) {
  const top = 70;
  return `
    <g class="lamp ${cls}">
      <circle cx="${x}" cy="${top + 20}" r="150" fill="url(#gHalo)" class="lamp-halo"/>
      <g fill="#0a0609">
        <rect x="${x - 4}" y="${top + 40}" width="8" height="${360 - top}"/>
        <path d="M${x - 14},400 L${x - 5},340 L${x + 5},340 L${x + 14},400Z"/>
        <rect x="${x - 9}" y="${top + 34}" width="18" height="8"/>
        <path d="M${x - 12},${top + 18} L${x - 8},${top - 4} L${x + 8},${top - 4} L${x + 12},${top + 18}Z" fill="#0a0609"/>
        <polygon points="${x - 16},${top - 4} ${x},${top - 20} ${x + 16},${top - 4}"/>
      </g>
      <path d="M${x - 9},${top + 18} L${x - 6},${top - 2} L${x + 6},${top - 2} L${x + 9},${top + 18}Z" fill="url(#gLampGlass)"/>
      <g stroke="#c9a24a" stroke-width="1.3" fill="none">
        <path d="M${x - 12},${top + 18} L${x - 8},${top - 4} L${x + 8},${top - 4} L${x + 12},${top + 18}Z"/><line x1="${x}" y1="${top - 4}" x2="${x}" y2="${top + 18}"/>
      </g>
    </g>`;
}

function luggage(x) {
  return `
    <g class="luggage" fill="#0a0609" transform="translate(${x},0)">
      <rect x="0" y="336" width="150" height="10" rx="2"/>
      <circle cx="22" cy="356" r="14"/><circle cx="128" cy="356" r="14"/>
      <rect x="10" y="290" width="86" height="46" rx="4"/>
      <rect x="22" y="262" width="62" height="30" rx="4"/>
      <path d="M104,336 L104,244 L112,244 L112,336Z"/>
      <ellipse cx="124" cy="300" rx="20" ry="3" />
      <path d="M108,328 Q124,262 140,328Z" fill="#150a17" stroke="#c9a24a" stroke-width="1.2" opacity=".95"/>
      <ellipse cx="124" cy="316" rx="7" ry="9" fill="#3a2a22"/>
      <path d="M118,308 l-3,-8 l6,3z M130,308 l3,-8 l-6,3z" fill="#3a2a22"/>
      <circle cx="121" cy="313" r="1.4" fill="#ffd98a"/><circle cx="127" cy="313" r="1.4" fill="#ffd98a"/>
    </g>
    <g class="luggage" fill="#c9a24a"><rect x="${x + 10}" y="290" width="6" height="6"/><rect x="${x + 90}" y="290" width="6" height="6"/><rect x="${x + 10}" y="330" width="6" height="6"/><rect x="${x + 90}" y="330" width="6" height="6"/></g>`;
}

function foregroundTile() {
  return `
    <svg viewBox="0 0 ${TILE} 400" preserveAspectRatio="none" aria-hidden="true">
      ${lamp(420, 'lamp-a')}${lamp(1220, 'lamp-b')}${luggage(36)}
    </svg>`;
}

/** Gradients shared by every world tile (defined once so IDs stay unique). */
function worldDefs() {
  return `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="gFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d1b33"/><stop offset="1" stop-color="#160c1a"/></linearGradient>
      <linearGradient id="gCastle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241329"/><stop offset="1" stop-color="#120a16"/></linearGradient>
      <linearGradient id="gHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1020"/><stop offset="1" stop-color="#0f0812"/></linearGradient>
      <radialGradient id="gHalo"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".42"/><stop offset=".45" stop-color="#ff9a3c" stop-opacity=".12"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
      <linearGradient id="gLampGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#ffb347"/></linearGradient>
    </defs></svg>`;
}

/** Each layer is N repeated inline tiles so ultrawide screens never run dry. */
export function worldMarkup() {
  const repeat = (fn, n = 4) => Array.from({ length: n }, fn).join('');
  const stars = (() => {
    const r = rng(3);
    return Array.from({ length: 70 }, (_, i) => {
      const s = r() < 0.12 ? 2 : 1;
      return `<i class="star${i % 9 === 0 ? ' twinkle' : ''}" style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 62).toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${(r() * 4).toFixed(1)}s"></i>`;
    }).join('');
  })();

  return `
    ${worldDefs()}
    <div class="world-sky" aria-hidden="true">
      ${stars}
      <div class="world-moon"></div>
      <div class="world-cloud cloud-a"></div><div class="world-cloud cloud-b"></div>
    </div>
    <div class="world-layer layer-far" data-speed="0.05" aria-hidden="true">${repeat(farTile)}</div>
    <div class="world-layer layer-hills" data-speed="0.12" aria-hidden="true">${repeat(hillsTile)}</div>
    <div class="world-layer layer-forest" data-speed="0.3" aria-hidden="true">${repeat(forestTile)}</div>
    <div class="world-mist" aria-hidden="true"><span></span><span></span></div>
    <div class="world-layer layer-poles" data-speed="0.6" aria-hidden="true">${repeat(polesTile)}</div>
    <div class="world-embankment" aria-hidden="true"></div>`;
}

export function foregroundMarkup() {
  return `<div class="world-layer layer-foreground" data-speed="1" aria-hidden="true">${Array.from({ length: 4 }, foregroundTile).join('')}</div>`;
}

/* ---------- THE TRAIN ---------- */

/** viewBox: x -160 → 1304, rail top at y=222. */
export const TRAIN_VIEW = { x: -160, y: 0, w: 1464, h: 230 };

const wheelSpokes = (r, n) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI;
    s += `<line x1="${(-Math.cos(a) * (r - 4)).toFixed(1)}" y1="${(-Math.sin(a) * (r - 4)).toFixed(1)}" x2="${(Math.cos(a) * (r - 4)).toFixed(1)}" y2="${(Math.sin(a) * (r - 4)).toFixed(1)}"/>`;
  }
  return s;
};

function wheel(cx, cy, r, cls, spokes = 10, counterweight = false) {
  return `
    <g transform="translate(${cx},${cy})">
      <g class="spin ${cls}">
        <circle r="${r}" fill="#171112" stroke="#c9a24a" stroke-width="${r > 30 ? 3.2 : 2.4}"/>
        <circle r="${r - 7}" fill="none" stroke="#2c2220" stroke-width="2"/>
        <g stroke="#b8923f" stroke-width="${r > 30 ? 2.6 : 1.8}" stroke-linecap="round">${wheelSpokes(r, spokes)}</g>
        ${counterweight ? `<path d="M0,0 L${-r + 6},${-4} A${r - 6},${r - 6} 0 0 1 ${-6},${-r + 6}Z" fill="#0b0809" opacity=".85" transform="rotate(200)"/>` : ''}
        <circle r="${Math.max(6, r * 0.17)}" fill="url(#gBrass)"/>
        <circle r="${Math.max(2.4, r * 0.06)}" cy="${-r * 0.55}" fill="#e8c76a"/>
      </g>
    </g>`;
}

function carriage(x, label, windowGradId) {
  let wins = '';
  for (let i = 0; i < 5; i++) {
    const wx = 24 + i * 46;
    wins += `
      <path d="M${wx},118 V92 Q${wx},78 ${wx + 17},78 Q${wx + 34},78 ${wx + 34},92 V118Z" fill="url(#${windowGradId})" stroke="#2b0a10" stroke-width="2"/>
      <path d="M${wx + 4},114 V94 Q${wx + 4},84 ${wx + 12},82 L${wx + 24},112Z" fill="#fff" opacity=".12"/>
      <line x1="${wx + 17}" y1="78" x2="${wx + 17}" y2="118" stroke="#2b0a10" stroke-width="1.4" opacity=".55"/>`;
  }
  return `
    <g transform="translate(${x},0)" class="carriage">
      <path d="M-2,70 Q-2,52 20,50 L250,50 Q272,52 272,70Z" fill="#100b0c" stroke="#c9a24a" stroke-width="1.5"/>
      <rect x="40" y="43" width="26" height="8" rx="3" fill="#100b0c"/><rect x="170" y="43" width="26" height="8" rx="3" fill="#100b0c"/>
      <rect x="0" y="70" width="270" height="110" fill="url(#gCrimson)" stroke="#d8b25a" stroke-width="1.6"/>
      <rect x="0" y="122" width="270" height="3" fill="#d8b25a" opacity=".9"/>
      <rect x="0" y="171" width="270" height="3" fill="#d8b25a" opacity=".9"/>
      <rect x="6" y="70" width="3" height="52" fill="#2b0a10" opacity=".7"/><rect x="261" y="70" width="3" height="52" fill="#2b0a10" opacity=".7"/>
      ${wins}
      <rect x="64" y="132" width="142" height="28" rx="4" fill="#150d0e" stroke="url(#gBrass)" stroke-width="2"/>
      <text x="135" y="151" class="train-plate" text-anchor="middle">${label}</text>
      <rect x="-2" y="180" width="274" height="10" fill="#0e0a0b"/>
      <circle cx="-8" cy="172" r="6" fill="url(#gBrass)"/><circle cx="278" cy="172" r="6" fill="url(#gBrass)"/>
      ${wheel(56, 202, 20, 'w-sm', 8)}${wheel(98, 202, 20, 'w-sm', 8)}${wheel(172, 202, 20, 'w-sm', 8)}${wheel(214, 202, 20, 'w-sm', 8)}
    </g>
    <rect x="${x + 270}" y="92" width="14" height="80" fill="#0e0a0b"/><rect x="${x + 270}" y="168" width="14" height="6" fill="#c9a24a"/>`;
}

export function trainMarkup() {
  const loco = `
    <g transform="translate(900,0)" class="loco">
      <!-- boiler -->
      <rect x="62" y="62" width="278" height="92" rx="12" fill="url(#gBoiler)"/>
      <rect x="296" y="60" width="62" height="96" rx="8" fill="#0d0a0b" stroke="#c9a24a" stroke-width="2"/>
      <circle cx="356" cy="108" r="4" fill="#e8c76a"/>
      <g fill="url(#gBrass)"><rect x="128" y="60" width="7" height="96"/><rect x="198" y="60" width="7" height="96"/><rect x="262" y="60" width="7" height="96"/></g>
      <path d="M96,76 H300" stroke="#c9a24a" stroke-width="2" opacity=".85"/>
      <g fill="#c9a24a"><circle cx="110" cy="76" r="3"/><circle cx="168" cy="76" r="3"/><circle cx="232" cy="76" r="3"/><circle cx="286" cy="76" r="3"/></g>
      <!-- chimney, domes, valve -->
      <path d="M298,62 L302,28 Q298,16 288,12 L322,12 Q312,16 308,28 L316,62Z" fill="#0d0a0b"/>
      <rect x="284" y="8" width="42" height="7" rx="3" fill="url(#gBrass)"/>
      <path d="M176,62 Q176,36 200,36 Q224,36 224,62Z" fill="url(#gBrass)" stroke="#8a6a1c" stroke-width="1.2"/>
      <path d="M104,62 Q104,44 118,44 Q132,44 132,62Z" fill="#0d0a0b" stroke="#c9a24a" stroke-width="1.4"/>
      <rect x="236" y="48" width="8" height="14" fill="url(#gBrass)"/><circle cx="240" cy="46" r="4" fill="#e8c76a"/>
      <!-- headlamp -->
      <rect x="322" y="38" width="30" height="24" rx="4" fill="#0d0a0b" stroke="url(#gBrass)" stroke-width="2"/>
      <circle cx="337" cy="50" r="8" fill="#fff0b8" class="headlamp"/>
      <!-- nameplate -->
      <ellipse cx="236" cy="116" rx="34" ry="17" fill="#150d0e" stroke="url(#gBrass)" stroke-width="2"/>
      <text x="236" y="120" class="train-plate" text-anchor="middle">RB EXPRESS</text>
      <!-- cab -->
      <path d="M0,34 H98 V158 H0Z" fill="url(#gCrimson)" stroke="#d8b25a" stroke-width="2"/>
      <path d="M-8,32 Q-8,22 6,22 H96 Q108,22 108,32 V38 H-8Z" fill="#100b0c" stroke="#c9a24a" stroke-width="1.4"/>
      <path d="M14,110 V70 Q14,54 31,54 Q48,54 48,70 V110Z" fill="url(#gWindowCab)" stroke="#2b0a10" stroke-width="2"/>
      <path d="M58,110 V70 Q58,54 75,54 Q92,54 92,70 V110Z" fill="url(#gWindowCab)" stroke="#2b0a10" stroke-width="2"/>
      <rect x="0" y="120" width="98" height="3" fill="#d8b25a"/>
      <!-- footplate, cylinder, frame, pilot -->
      <rect x="-6" y="152" width="372" height="9" fill="#0d0a0b"/>
      <rect x="20" y="160" width="340" height="18" fill="#150d0e"/>
      <rect x="292" y="158" width="52" height="26" rx="5" fill="#1b1213" stroke="#c9a24a" stroke-width="1.6"/>
      <rect x="338" y="166" width="22" height="7" fill="#c9a24a"/>
      <path d="M356,184 H380 L398,222 H340Z" fill="#0d0a0b" stroke="#c9a24a" stroke-width="1.4"/>
      <line x1="352" y1="190" x2="366" y2="218" stroke="#c9a24a" stroke-width="1.2"/><line x1="364" y1="188" x2="378" y2="218" stroke="#c9a24a" stroke-width="1.2"/>
      <rect x="352" y="170" width="36" height="14" rx="3" fill="#6e1423" stroke="#d8b25a" stroke-width="1.4"/>
      <circle cx="394" cy="177" r="6" fill="url(#gBrass)"/>
      ${wheel(110, 178, 44, 'w-lg', 12, true)}${wheel(198, 178, 44, 'w-lg', 12, true)}${wheel(286, 178, 44, 'w-lg', 12, true)}
      ${wheel(344, 200, 22, 'w-sm', 8)}${wheel(384, 200, 22, 'w-sm', 8)}${wheel(26, 200, 22, 'w-sm', 8)}
      <!-- coupling rod follows the crank pins -->
      <g class="rod"><rect x="106" y="${178 - 24 - 4}" width="184" height="8" rx="4" fill="#d8b25a" stroke="#8a6a1c" stroke-width="1"/>
      <circle cx="110" cy="${178 - 24}" r="6" fill="#e8c76a"/><circle cx="198" cy="${178 - 24}" r="6" fill="#e8c76a"/><circle cx="286" cy="${178 - 24}" r="6" fill="#e8c76a"/></g>
    </g>`;

  const tender = `
    <g transform="translate(690,0)">
      <path d="M8,82 Q40,52 74,66 Q100,46 130,64 Q160,50 192,82Z" fill="#0d0a0b"/>
      <rect x="0" y="82" width="200" height="94" rx="4" fill="url(#gCrimson)" stroke="#d8b25a" stroke-width="1.6"/>
      <rect x="0" y="82" width="200" height="14" fill="#100b0c"/>
      <rect x="10" y="108" width="180" height="48" rx="3" fill="none" stroke="#d8b25a" stroke-width="1.4"/>
      <circle cx="100" cy="132" r="14" fill="#150d0e" stroke="url(#gBrass)" stroke-width="2"/>
      <text x="100" y="136" class="train-plate" text-anchor="middle">RB</text>
      <rect x="-4" y="176" width="208" height="10" fill="#0e0a0b"/>
      ${wheel(46, 196, 26, 'w-md', 8)}${wheel(104, 196, 26, 'w-md', 8)}${wheel(162, 196, 26, 'w-md', 8)}
    </g>
    <rect x="882" y="150" width="30" height="8" fill="#0e0a0b"/>`;

  return `
    <svg class="train-svg" viewBox="${TRAIN_VIEW.x} ${TRAIN_VIEW.y} ${TRAIN_VIEW.w} ${TRAIN_VIEW.h}" role="img" aria-label="The Wizarding Railway express: steam locomotive, tender and carriages" preserveAspectRatio="xMaxYMax meet">
      <defs>
        <linearGradient id="gCrimson" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c1a2e"/><stop offset=".6" stop-color="#6e1423"/><stop offset="1" stop-color="#4a0b16"/></linearGradient>
        <linearGradient id="gBoiler" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3230"/><stop offset=".4" stop-color="#1c1617"/><stop offset="1" stop-color="#0c090a"/></linearGradient>
        <linearGradient id="gBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5dc8e"/><stop offset=".5" stop-color="#cba348"/><stop offset="1" stop-color="#8a6a1c"/></linearGradient>
        <linearGradient id="gWindow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#ffc766"/><stop offset="1" stop-color="#e8943a"/></linearGradient>
        <linearGradient id="gWindowCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd98a"/><stop offset="1" stop-color="#d9772b"/></linearGradient>
      </defs>
      ${carriage(-156, 'THE WIZARDING RAILWAY', 'gWindow')}
      ${carriage(126, 'THE WIZARDING RAILWAY', 'gWindow')}
      ${carriage(408, '<tspan id="trainDestination">NOW BOARDING</tspan>', 'gWindow')}
      ${tender}
      ${loco}
    </svg>`;
}
