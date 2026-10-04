/**
 * Original snowy-owl artwork (vector, layered feathers with soft shading).
 * Two poses: `flyingOwl()` (front view, wings spread, carrying a sealed letter) and `perchedOwl()` (small icon).
 */

const leaf = (len, wid) =>
  `M0,0 C${len * 0.22},${-wid} ${len * 0.78},${-wid * 1.05} ${len},0 C${len * 0.8},${wid * 0.9} ${len * 0.25},${wid * 0.95} 0,0Z`;

function feather(angle, len, wid, { bars = true, spots = false } = {}) {
  const bar = bars
    ? `<path d="M${len * 0.6},${-wid * 0.5} q5,${wid * 0.5} 0,${wid} M${len * 0.74},${-wid * 0.45} q5,${wid * 0.45} 0,${wid * 0.9}" stroke="#6b5f55" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>`
    : '';
  const dots = spots
    ? `<circle cx="${len * 0.45}" cy="${-wid * 0.2}" r="2.2" fill="#8a7a6b" opacity=".5"/><circle cx="${len * 0.62}" cy="${wid * 0.25}" r="1.8" fill="#8a7a6b" opacity=".5"/>`
    : '';
  return `<g transform="rotate(${angle})"><path d="${leaf(len, wid)}" fill="url(#oWing)" stroke="#aab4c2" stroke-width=".9"/><path d="M6,0 L${len * 0.94},0" stroke="#c0c9d6" stroke-width=".8"/>${bar}${dots}</g>`;
}

/** One wing drawn pointing along -x from its shoulder (mirrored for the right wing by the caller). */
function wing() {
  const primaries = [[-46, 168, 15], [-35, 184, 16], [-23, 192, 17], [-11, 190, 17], [1, 180, 17], [13, 166, 16], [25, 150, 15]];
  const secondaries = [[-54, 112, 24], [-41, 118, 25], [-28, 124, 26], [-15, 124, 26], [-2, 120, 26], [11, 112, 25], [24, 102, 24]];
  const coverts = [[-48, 78, 26], [-34, 82, 27], [-20, 84, 27], [-6, 82, 27], [8, 76, 26], [20, 68, 24]];
  return `
    <g>${primaries.map(([a, l, w]) => feather(a, l, w)).join('')}</g>
    <g>${secondaries.map(([a, l, w]) => feather(a, l, w, { bars: false })).join('')}</g>
    <g>${coverts.map(([a, l, w]) => feather(a, l, w, { bars: false, spots: true })).join('')}</g>
    <ellipse cx="22" cy="2" rx="30" ry="22" fill="url(#oBody)" stroke="#c5cedb" stroke-width=".8"/>`;
}

function face(scale = 1) {
  return `
    <g transform="scale(${scale})">
      <circle r="38" fill="url(#oBody)" stroke="#c5cedb" stroke-width=".9"/>
      <circle cx="-16" cy="4" r="19.5" fill="#fff" stroke="#d3dae4" stroke-width=".9"/>
      <circle cx="16" cy="4" r="19.5" fill="#fff" stroke="#d3dae4" stroke-width=".9"/>
      <path d="M-30,-6 Q-16,-20 -3,-8 M30,-6 Q16,-20 3,-8" stroke="#b9c2cf" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>
      <g fill="#8a7a6b" opacity=".5"><circle cx="-6" cy="-28" r="1.6"/><circle cx="8" cy="-30" r="1.4"/><circle cx="0" cy="-24" r="1.2"/><circle cx="-18" cy="-24" r="1.2"/><circle cx="19" cy="-25" r="1.3"/></g>
      <g>
        <circle cx="-16" cy="2" r="11.5" fill="url(#oEye)" stroke="#2a2418" stroke-width="1.6"/>
        <circle cx="16" cy="2" r="11.5" fill="url(#oEye)" stroke="#2a2418" stroke-width="1.6"/>
        <circle cx="-16" cy="2" r="5.8" fill="#0d0d0d"/><circle cx="16" cy="2" r="5.8" fill="#0d0d0d"/>
        <circle cx="-18.4" cy="-1" r="2.2" fill="#fff"/><circle cx="13.6" cy="-1" r="2.2" fill="#fff"/>
        <circle cx="-13.4" cy="5" r="1" fill="#fff" opacity=".8"/><circle cx="18.6" cy="5" r="1" fill="#fff" opacity=".8"/>
      </g>
      <path d="M-5.5,12 Q0,30 5.5,12 Q0,17 -5.5,12Z" fill="url(#oBeak)" stroke="#1d1d1d" stroke-width=".8"/>
      <path d="M-9,14 q4,-5 9,-3 q5,-2 9,3" stroke="#e8edf3" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>`;
}

const DEFS = `
  <defs>
    <radialGradient id="oBody" cx=".5" cy=".32" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f4f8"/><stop offset="1" stop-color="#cdd5e0"/></radialGradient>
    <linearGradient id="oWing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#e1e7ef"/><stop offset="1" stop-color="#bdc7d4"/></linearGradient>
    <radialGradient id="oEye" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3ad"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#d98300"/></radialGradient>
    <linearGradient id="oBeak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#1a1a1a"/></linearGradient>
  </defs>`;

export function flyingOwl() {
  const tail = [62, 76, 90, 104, 118].map((a) => `<g transform="translate(180,184) rotate(${a})"><path d="${leaf(58, 12)}" fill="url(#oWing)" stroke="#aab4c2" stroke-width=".9"/><path d="M40,-6 q5,6 0,12" stroke="#6b5f55" stroke-width="2" fill="none" opacity=".45"/></g>`).join('');
  const chest = [0, 1, 2, 3, 4].map((i) => `<path d="M${160 + i * 1.5},${108 + i * 14} Q180,${116 + i * 14} ${200 - i * 1.5},${108 + i * 14}" stroke="#8b7b6c" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"/>`).join('');
  return `
    <svg class="owl-svg" viewBox="0 0 360 252" aria-hidden="true">
      ${DEFS}
      <g class="o-wing o-wing-l"><g transform="translate(150,106) scale(-1,1)">${wing()}</g></g>
      <g class="o-wing o-wing-r"><g transform="translate(210,106)">${wing()}</g></g>
      ${tail}
      <g class="o-body">
        <ellipse cx="180" cy="132" rx="46" ry="66" fill="url(#oBody)" stroke="#c5cedb" stroke-width=".9"/>
        ${chest}
        <g transform="translate(180,70)">${face()}</g>
        <ellipse cx="166" cy="190" rx="11" ry="17" fill="url(#oBody)" stroke="#c5cedb" stroke-width=".8"/>
        <ellipse cx="194" cy="190" rx="11" ry="17" fill="url(#oBody)" stroke="#c5cedb" stroke-width=".8"/>
        <g stroke="#2a2418" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M159,203 q-2,6 2,9 M166,205 q0,7 4,9 M173,203 q2,6 -1,10"/><path d="M187,203 q-2,6 1,10 M194,205 q0,7 4,9 M201,203 q2,6 -2,9"/></g>
      </g>
      <g class="o-letter" transform="translate(180,226) rotate(-5)">
        <rect x="-30" y="-19" width="60" height="38" rx="2" fill="#ecdcb4" stroke="#6b5a3a" stroke-width="1.4"/>
        <path d="M-30,-19 L0,4 L30,-19" fill="none" stroke="#6b5a3a" stroke-width="1.2"/>
        <circle cx="0" cy="4" r="8.5" fill="#9e1d1d" stroke="#6e1010" stroke-width="1"/>
        <text x="0" y="7.2" text-anchor="middle" font-size="8" font-family="MedievalSharp, serif" fill="#f3e3c3">RB</text>
      </g>
    </svg>`;
}

export function perchedOwl() {
  return `
    <svg viewBox="0 0 64 72" class="owl-perched" aria-hidden="true">
      <defs>
        <radialGradient id="pBody" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdd5e0"/></radialGradient>
        <radialGradient id="pEye" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3ad"/><stop offset=".6" stop-color="#ffc21a"/><stop offset="1" stop-color="#d98300"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="46" rx="21" ry="24" fill="url(#pBody)" stroke="#aab4c2"/>
      <path d="M14,40 Q10,56 20,64 Q22,50 20,38Z M50,40 Q54,56 44,64 Q42,50 44,38Z" fill="#e1e7ef" stroke="#aab4c2" stroke-width=".8"/>
      <g stroke="#8b7b6c" stroke-width="1" fill="none" opacity=".45" stroke-linecap="round"><path d="M22,44 q10,5 20,0 M23,51 q9,5 18,0 M25,58 q7,4 14,0"/></g>
      <circle cx="32" cy="24" r="19" fill="url(#pBody)" stroke="#aab4c2"/>
      <circle cx="24.5" cy="25" r="7.2" fill="url(#pEye)" stroke="#2a2418" stroke-width="1.2"/><circle cx="39.5" cy="25" r="7.2" fill="url(#pEye)" stroke="#2a2418" stroke-width="1.2"/>
      <circle cx="24.5" cy="25" r="3.6" fill="#0d0d0d"/><circle cx="39.5" cy="25" r="3.6" fill="#0d0d0d"/>
      <circle cx="23.2" cy="23.4" r="1.3" fill="#fff"/><circle cx="38.2" cy="23.4" r="1.3" fill="#fff"/>
      <path d="M29.5,31 Q32,38 34.5,31 Q32,33 29.5,31Z" fill="#2b2b2b"/>
      <g stroke="#2a2418" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M24,68 q-1,3 1,4 M28,68 q0,3 2,4 M36,68 q0,3 -2,4 M40,68 q1,3 -1,4"/></g>
    </svg>`;
}
