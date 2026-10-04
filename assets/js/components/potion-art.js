/**
 * Apothecary bottle artwork.
 * Five glass silhouettes, each with real glass layering: tinted liquid with a depth gradient and meniscus,
 * rising bubbles, left/right specular streaks, a stopper and a parchment label. Shared gradients live in
 * `bottleDefs()` (mount once) so IDs stay unique.
 */

import { escapeHtml as esc } from '../core/dom.js';

/** outer = glass silhouette, liquid = [topY, bottomY] fillable range, cork = stopper markup, label = label Y. */
const SHAPES = {
  'round-flask': {
    outer: 'M33,20 V56 A37,37 0 1 0 47,56 V20 Z',
    liquid: [64, 129], label: 80, neckY: 20, tie: 40,
    streaks: 'M17,84 Q15,100 22,114',
    cork: '<path d="M32,8 H48 L46.5,21 H33.5Z" fill="url(#pCork)" stroke="#4a280c" stroke-width=".8"/>',
  },
  erlenmeyer: {
    outer: 'M33,18 V46 L8,118 Q6,127 15,127 H65 Q74,127 72,118 L47,46 V18 Z',
    liquid: [62, 127], label: 86, neckY: 18, tie: 38,
    streaks: 'M22,92 L16,112',
    cork: '<path d="M32,6 H48 L46.5,19 H33.5Z" fill="url(#pCork)" stroke="#4a280c" stroke-width=".8"/>',
  },
  'tall-vial': {
    outer: 'M30,18 V30 Q22,34 22,44 V118 Q22,128 32,128 H48 Q58,128 58,118 V44 Q58,34 50,30 V18 Z',
    liquid: [50, 127], label: 70, neckY: 18, tie: 0,
    streaks: 'M27,52 V110',
    cork: '<path d="M29,6 H51 L49.5,19 H30.5Z" fill="url(#pCork)" stroke="#4a280c" stroke-width=".8"/>',
  },
  'apothecary-jar': {
    outer: 'M22,32 H58 V37 Q71,41 71,54 V114 Q71,128 57,128 H23 Q9,128 9,114 V54 Q9,41 22,37 Z',
    liquid: [56, 127], label: 72, neckY: 32, tie: 0,
    streaks: 'M16,58 V108',
    cork: '<rect x="24" y="14" width="32" height="19" rx="3" fill="url(#pLid)" stroke="#2a170a" stroke-width="1"/><rect x="34" y="8" width="12" height="7" rx="3" fill="url(#pLid)" stroke="#2a170a" stroke-width="1"/>',
  },
  decanter: {
    outer: 'M32,16 V34 L20,48 Q14,52 14,60 V118 Q14,128 24,128 H56 Q66,128 66,118 V60 Q66,52 60,48 L48,34 V16 Z',
    liquid: [56, 127], label: 74, neckY: 16, tie: 36,
    streaks: 'M20,62 V112',
    cork: '<circle cx="40" cy="9" r="8.5" fill="url(#pGlass)" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/><path d="M35,6 Q38,3 42,4" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
  },
};

export function bottleDefs() {
  return `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="pGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset=".8" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
      <linearGradient id="pLiqShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".48"/></linearGradient>
      <linearGradient id="pShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="pCork" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98a52"/><stop offset=".5" stop-color="#9a6b38"/><stop offset="1" stop-color="#6e4724"/></linearGradient>
      <linearGradient id="pLid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a4426"/><stop offset=".5" stop-color="#4a2c16"/><stop offset="1" stop-color="#2e1a0c"/></linearGradient>
      <radialGradient id="pShadow"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs></svg>`;
}

/** @param {{id:string,code:string,level:number,color:string,bottleType:string}} skill */
export function bottleSvg(skill) {
  const shape = SHAPES[skill.bottleType] || SHAPES['round-flask'];
  const [top, bottom] = shape.liquid;
  const ly = bottom - (bottom - top) * (skill.level / 100);
  const cid = `bc-${skill.id}`;
  const lh = bottom - ly + 2;
  return `
    <svg viewBox="0 0 80 140" class="bottle-svg" aria-hidden="true">
      <ellipse cx="40" cy="133" rx="27" ry="4.5" fill="url(#pShadow)"/>
      <clipPath id="${cid}"><path d="${shape.outer}"/></clipPath>
      <g clip-path="url(#${cid})">
        <rect x="0" y="${ly.toFixed(1)}" width="80" height="${lh.toFixed(1)}" fill="${esc(skill.color)}"/>
        <rect x="0" y="${ly.toFixed(1)}" width="80" height="${lh.toFixed(1)}" fill="url(#pLiqShade)"/>
        <rect x="11" y="${ly.toFixed(1)}" width="9" height="${lh.toFixed(1)}" fill="url(#pShine)" opacity=".7"/>
        <ellipse cx="40" cy="${ly.toFixed(1)}" rx="40" ry="3.4" fill="#fff" opacity=".34"/>
        <ellipse cx="40" cy="${(ly + 1.2).toFixed(1)}" rx="30" ry="2" fill="#fff" opacity=".18"/>
        <g class="bubbles" fill="#fff" fill-opacity=".55">
          <circle class="bub b1" cx="30" cy="${bottom - 8}" r="2"/><circle class="bub b2" cx="46" cy="${bottom - 14}" r="1.4"/><circle class="bub b3" cx="38" cy="${bottom - 4}" r="2.4"/><circle class="bub b4" cx="52" cy="${bottom - 10}" r="1.1"/>
        </g>
      </g>
      <path d="${shape.outer}" fill="url(#pGlass)" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="${shape.outer}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1" transform="translate(40 70) scale(.965) translate(-40 -70)"/>
      <path d="${shape.streaks}" stroke="#fff" stroke-opacity=".6" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <path d="M66,66 V102" stroke="#fff" stroke-opacity=".22" stroke-width="1.6" stroke-linecap="round" fill="none" transform="translate(${shape.outer.includes('M22,32') ? 4 : 0} 0)"/>
      <ellipse cx="40" cy="${shape.neckY}" rx="${shape.outer.includes('M22,32') ? 18 : 8}" ry="2" fill="#fff" opacity=".35"/>
      ${shape.tie ? `<path d="M33,${shape.tie} q7,4.5 14,0" stroke="#c9a05a" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="47" cy="${shape.tie}" r="1.6" fill="#c9a05a"/>` : ''}
      ${shape.cork}
      <g transform="rotate(-2 40 ${shape.label + 15})">
        <rect x="18" y="${shape.label}" width="44" height="30" rx="2" fill="#e8d8ad" stroke="#8c6d3b" stroke-width="1"/>
        <rect x="21" y="${shape.label + 3}" width="38" height="24" fill="none" stroke="#8c6d3b" stroke-width=".5" opacity=".6"/>
        <text x="40" y="${shape.label + 15.5}" text-anchor="middle" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#3b2a14">${esc(skill.code)}</text>
        <text x="40" y="${shape.label + 24}" text-anchor="middle" font-family="'Space Mono', monospace" font-size="6.5" fill="#7a2a1a">${skill.level}%</text>
      </g>
    </svg>`;
}
