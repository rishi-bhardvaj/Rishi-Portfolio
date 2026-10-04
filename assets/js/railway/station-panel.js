/**
 * Station Card & Walkthrough Drawer
 * The card is the compact "arrival board" over the scene; the drawer is the full case study
 * (The Spell / Ingredients / Incantation / Result / Artifacts). Both are pure functions of project data.
 */

import { escapeHtml as esc } from '../core/dom.js';
import { prefersReducedMotion } from '../core/motion.js';

const MAX_CHIPS = 6;
const stripNumbering = (s) => String(s).replace(/^\s*\d+[.)]\s*/, '');
const pad = (n) => String(n).padStart(2, '0');

const stamp = (p) => (p.isDemo
  ? '<span class="stamp-tag is-demo">DEMO CASE FILE</span>'
  : '<span class="stamp-tag is-verified">VERIFIED DISPATCH</span>');

const sourceLink = (p, cls) => (p.github
  ? `<a class="${cls}" href="${esc(p.github)}" target="_blank" rel="noopener" data-spell="accio">ACCIO SOURCE <i aria-hidden="true">&nearr;</i></a>`
  : `<button type="button" class="${cls}" disabled title="Source is proprietary or not yet published">ACCIO SOURCE <i aria-hidden="true">&mdash;</i></button>`);

const demoButton = (p, cls) => (p.demo
  ? `<button type="button" class="${cls}" data-spell="portkey" data-url="${esc(p.demo)}">PORTKEY <i aria-hidden="true">&rarr;</i></button>`
  : '');

export function renderStationCard(el, p, i, total) {
  const extra = p.technologies.length - MAX_CHIPS;
  el.innerHTML = `
    <div class="sc-eyebrow"><span>STATION ${pad(i + 1)} / ${pad(total)}</span><span>${esc(p.category.toUpperCase())}</span></div>
    <h3 class="sc-name">${esc(p.station)}</h3>
    <p class="sc-title">${esc(p.title)}</p>
    <p class="sc-summary">${esc(p.summary)}</p>
    <ul class="sc-chips" aria-label="Technologies">
      ${p.technologies.slice(0, MAX_CHIPS).map((t) => `<li>${esc(t)}</li>`).join('')}
      ${extra > 0 ? `<li class="more">+${extra}</li>` : ''}
    </ul>
    <div class="sc-actions">
      <button type="button" class="sc-btn primary" data-act="open-drawer">ENTER STATION <i aria-hidden="true">&rarr;</i></button>
      ${sourceLink(p, 'sc-btn')}
      ${demoButton(p, 'sc-btn')}
    </div>
    <div class="sc-foot">${stamp(p)}<span class="sc-status">${esc(p.status.toUpperCase())}</span></div>`;
}

export function renderDrawer(el, p, i, total) {
  const steps = p.incantation.steps.map(stripNumbering);
  const art = p.artifacts || [];
  el.innerHTML = `
    <div class="dw-inner">
      <header class="dw-head">
        <div>
          <div class="dw-eyebrow">STATION ${pad(i + 1)} / ${pad(total)} &bull; ${esc(p.category.toUpperCase())} ${stamp(p)}</div>
          <h2 class="dw-title" id="dwTitle">${esc(p.station)}</h2>
          <p class="dw-sub">${esc(p.title)}</p>
        </div>
        <button type="button" class="dw-close" data-act="close-drawer" aria-label="Close walkthrough (Esc)">&times;</button>
      </header>
      <div class="dw-rule" style="--a:${esc(p.theme.accent)};--b:${esc(p.theme.lantern)}"></div>

      <div class="dw-body">
        <section class="dw-sec">
          <h3 class="dw-label"><b>I</b> The Spell <em>the problem</em></h3>
          <h4 class="dw-h">${esc(p.spell.heading)}</h4>
          <p>${esc(p.spell.body)}</p>
        </section>

        <section class="dw-sec">
          <h3 class="dw-label"><b>II</b> Ingredients <em>the stack</em></h3>
          <ul class="dw-chips">${p.technologies.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </section>

        <section class="dw-sec">
          <h3 class="dw-label"><b>III</b> Incantation <em>the architecture</em></h3>
          <h4 class="dw-h">${esc(p.incantation.heading)}</h4>
          <p>${esc(p.incantation.body)}</p>
          <ol class="dw-steps">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        </section>

        <section class="dw-sec">
          <h3 class="dw-label"><b>IV</b> Result <em>the impact</em></h3>
          <p>${esc(p.result.summary)}</p>
          <div class="dw-metrics">
            ${p.result.metrics.map((m) => `<div class="dw-metric"><strong data-count="${esc(m.value)}">${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}
          </div>
        </section>

        ${art.length ? `
        <section class="dw-sec">
          <h3 class="dw-label"><b>V</b> Artifacts <em>the evidence</em></h3>
          <div class="dw-artifacts">
            ${art.map((a) => `
              <figure>
                <img src="${esc(a.src)}" alt="${esc(a.alt)}" width="640" height="400" loading="lazy" decoding="async" />
                <figcaption>${esc(a.caption)}</figcaption>
              </figure>`).join('')}
          </div>
        </section>` : ''}

        <section class="dw-sec dw-reveal" id="dwReveal" data-revealed="false">
          <div class="dw-reveal-head">
            <h3 class="dw-label"><b>&#10022;</b> Classified <em>hidden detail</em></h3>
            <button type="button" class="dw-spell" data-spell="revelio" aria-expanded="false" aria-controls="dwRevealText">REVELIO</button>
          </div>
          <p class="dw-reveal-text" id="dwRevealText">${esc(p.reveal)}</p>
        </section>
      </div>

      <footer class="dw-foot">
        <button type="button" class="dw-btn ghost" data-act="close-drawer">&larr; RETURN TO TRAIN</button>
        <div class="dw-foot-actions">
          <button type="button" class="dw-btn" data-spell="alohomora" data-project="${esc(p.id)}">ALOHOMORA <i aria-hidden="true">&#9993;</i></button>
          ${sourceLink(p, 'dw-btn')}
          ${demoButton(p, 'dw-btn solid')}
        </div>
      </footer>
    </div>`;
}

/** Counts "79", "40+", "<15ms", "99.99%" up from zero once, preserving the surrounding text. */
export function countUpMetrics(root) {
  if (prefersReducedMotion) return;
  root.querySelectorAll('[data-count]').forEach((node) => {
    const m = /^([<>~]?)(\d+(?:\.\d+)?)(.*)$/.exec(node.dataset.count);
    if (!m) return;
    const [, pre, numStr, post] = m;
    const target = parseFloat(numStr);
    const decimals = (numStr.split('.')[1] || '').length;
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      node.textContent = `${pre}${(target * eased).toFixed(decimals)}${post}`;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
