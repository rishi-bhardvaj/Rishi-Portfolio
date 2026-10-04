/**
 * The Laboratory: apothecary cabinet + specimen panel + full report table.
 * Everything renders from data/skills.js. Hovering (mouse) or tapping/focusing (touch, keyboard) a bottle
 * loads it into a large specimen panel, so details are readable instead of a tiny tooltip.
 */

import { skills, skillCategories } from '../data/skills.js';
import { projects } from '../data/projects.js';
import { playSfx } from '../core/audio.js';
import { escapeHtml as esc } from '../core/dom.js';
import { goToStation } from '../railway/journey.js';
import { bottleDefs, bottleSvg } from './potion-art.js';

const SHELF_ORDER = ['backend', 'frontend', 'database', 'security', 'devops', 'cloud', 'aiml'];
const SHELF_LABEL = {
  backend: 'Backend Core', frontend: 'Frontend', database: 'Databases', security: 'Security & Auth',
  devops: 'DevOps', cloud: 'Cloud', aiml: 'AI & Research',
};
const SHEET_QUERY = '(max-width: 900px)';

let cleanups = [];
let category = 'all';
let query = '';
let selectedId = null;
let sheetOpen = false;
let raf = 0;

const byId = (id) => skills.find((s) => s.id === id);

function matches(skill) {
  const okCat = category === 'all' || skill.category === category;
  const q = query;
  const okQuery = !q || [skill.name, skill.code, skill.description, skill.potionLabel, skill.detail, skill.categoryLabel]
    .some((v) => String(v || '').toLowerCase().includes(q));
  return okCat && okQuery;
}

export function initLabReport() {
  const input = document.getElementById('skillSearchInput');
  const pills = document.getElementById('labPills');
  const bench = document.getElementById('labWorkbench');

  if (pills) {
    pills.innerHTML = skillCategories
      .map((c) => `<button type="button" class="lab-pill-btn${c.id === 'all' ? ' active' : ''}" data-category="${c.id}">${esc(c.label)}</button>`)
      .join('');
    const onPill = (e) => {
      const btn = e.target.closest('.lab-pill-btn');
      if (!btn) return;
      pills.querySelectorAll('.lab-pill-btn').forEach((b) => b.classList.toggle('active', b === btn));
      category = btn.dataset.category || 'all';
      renderLabReport();
    };
    pills.addEventListener('click', onPill);
    cleanups.push(() => pills.removeEventListener('click', onPill));
  }

  if (input) {
    const onSearch = (e) => { query = e.target.value.toLowerCase().trim(); renderLabReport(); };
    input.addEventListener('input', onSearch);
    cleanups.push(() => input.removeEventListener('input', onSearch));
  }

  if (bench) {
    // Select on hover (mouse) or on click/tap/focus; one set of delegated listeners
    const onOver = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const b = e.target.closest('.potion-bottle');
      if (b && b.dataset.id !== selectedId) select(b.dataset.id, { source: 'hover' });
    };
    const onClick = (e) => {
      const b = e.target.closest('.potion-bottle');
      if (b) { select(b.dataset.id, { source: 'click' }); playSfx('wand'); return; }
      const goto = e.target.closest('[data-goto]');
      if (goto) { goToStation(parseInt(goto.dataset.goto, 10)); return; }
      if (e.target.closest('[data-sheet-close]')) setSheet(false);
      const clear = e.target.closest('[data-clear]');
      if (clear) {
        if (input) input.value = '';
        query = '';
        renderLabReport();
      }
    };
    const onFocus = (e) => { const b = e.target.closest?.('.potion-bottle'); if (b) select(b.dataset.id, { source: 'focus' }); };
    bench.addEventListener('pointerover', onOver);
    bench.addEventListener('click', onClick);
    bench.addEventListener('focusin', onFocus);
    cleanups.push(() => {
      bench.removeEventListener('pointerover', onOver);
      bench.removeEventListener('click', onClick);
      bench.removeEventListener('focusin', onFocus);
    });
  }

  const onKey = (e) => { if (e.key === 'Escape' && sheetOpen) setSheet(false); };
  window.addEventListener('keydown', onKey);
  cleanups.push(() => window.removeEventListener('keydown', onKey));

  renderLabReport();
  return destroyLabReport;
}

export function destroyLabReport() {
  cancelAnimationFrame(raf);
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

export function renderLabReport() {
  const filtered = skills.filter(matches);
  const badge = document.getElementById('skillCountBadge');
  if (badge) badge.textContent = `${filtered.length} SUBSTANCES DETECTED`;

  if (!filtered.some((s) => s.id === selectedId)) selectedId = filtered[0]?.id ?? null;
  renderWorkbench(filtered);
  renderTable(filtered);
}

/* ------------------------------------------------------------ workbench */

function renderWorkbench(filtered) {
  const bench = document.getElementById('labWorkbench');
  if (!bench) return;

  const shelves = SHELF_ORDER
    .map((id) => ({ id, items: filtered.filter((s) => s.category === id) }))
    .filter((s) => s.items.length);

  bench.innerHTML = `
    ${bottleDefs()}
    <div class="apothecary">
      <div class="apo-head">
        <div><span class="apo-eyebrow">THE APOTHECARY</span><h3 class="apo-title">Potion Cabinet of Technical Mastery</h3></div>
        <p class="apo-hint">Hover a phial to inspect it<span class="apo-hint-touch">Tap a phial to inspect it</span></p>
      </div>
      <div class="apo-grid">
        ${shelves.length ? shelves.map((sh) => `
          <section class="cubby" aria-label="${esc(SHELF_LABEL[sh.id])}">
            <span class="cubby-label">${esc(SHELF_LABEL[sh.id])}</span>
            <div class="plank">
              ${sh.items.map((s) => `
                <button type="button" class="potion-bottle${s.id === selectedId ? ' is-selected' : ''}" data-id="${s.id}" aria-label="${esc(s.name)}, ${s.level} percent: ${esc(s.potionLabel)}" aria-pressed="${s.id === selectedId}">
                  ${bottleSvg(s)}
                </button>`).join('')}
            </div>
          </section>`).join('') : `
          <div class="apo-empty">No potions brewed for this query.<button type="button" class="dw-spell" data-clear>CAST OBLIVIATE</button></div>`}
      </div>
    </div>
    <aside class="specimen" id="specimen" aria-label="Selected specimen"></aside>`;
  renderSpecimen();
}

function select(id, { source } = {}) {
  if (id === selectedId && source !== 'click') return;
  selectedId = id;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    document.querySelectorAll('.potion-bottle').forEach((b) => {
      const on = b.dataset.id === selectedId;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderSpecimen();
    if (source === 'click' && window.matchMedia(SHEET_QUERY).matches) setSheet(true);
  });
}

function setSheet(open) {
  sheetOpen = open;
  const bench = document.getElementById('labWorkbench');
  if (bench) bench.classList.toggle('sheet-open', open);
}

function renderSpecimen() {
  const el = document.getElementById('specimen');
  const s = byId(selectedId);
  if (!el) return;
  if (!s) { el.innerHTML = '<p class="sp-empty">Select a phial to read its label.</p>'; return; }

  const years = Math.max(1, new Date().getFullYear() - (s.since || new Date().getFullYear()));
  const visible = projects.filter((p) => !p.hidden);
  const uses = s.uses
    .map((pid) => ({ p: projects.find((x) => x.id === pid), idx: visible.findIndex((x) => x.id === pid) }))
    .filter((u) => u.p && u.idx >= 0);

  el.innerHTML = `
    <button type="button" class="sp-close" data-sheet-close aria-label="Close specimen">&times;</button>
    <div class="sp-top">
      <div class="sp-bottle" style="--tint:${esc(s.color)}">${bottleSvg({ ...s, id: `${s.id}-big` })}</div>
      <div class="sp-id">
        <span class="sp-cat">${esc(s.categoryLabel)} &bull; ${esc(s.code)}</span>
        <h4 class="sp-name">${esc(s.name)}</h4>
        <span class="sp-potion">${esc(s.potionLabel)}</span>
      </div>
    </div>
    <div class="sp-meter" role="img" aria-label="Potency ${s.level} percent">
      <div class="sp-meter-fill" style="--lvl:${s.level}%;--tint:${esc(s.color)}"></div>
      <span class="sp-ticks" aria-hidden="true"></span>
    </div>
    <div class="sp-stats">
      <div><strong>${s.level}%</strong><span>Potency</span></div>
      <div><strong>${years}+ yrs</strong><span>Brewing</span></div>
      <div><strong class="sp-small">${esc(s.detected)}</strong><span>Detected</span></div>
    </div>
    <p class="sp-detail">${esc(s.detail || s.description)}</p>
    <p class="sp-short">${esc(s.description)}</p>
    ${uses.length ? `<div class="sp-uses"><span>Used in</span>${uses.map((u) => `<button type="button" class="sp-use" data-goto="${u.idx}" title="Travel to station ${u.p.number}">${esc(u.p.station)}</button>`).join('')}</div>` : ''}
    <span class="sp-finding ${s.levelType === 'primary' ? 'is-primary' : ''}">${esc(s.finding)}</span>`;
}

/* ------------------------------------------------------------ table fallback */

function renderTable(filtered) {
  const body = document.getElementById('forensicsTableBody');
  const cards = document.getElementById('forensicsMobileCards');
  const badge = (s) => (s.levelType === 'primary' ? 'stamp-red-box' : 'stamp-black-box');

  if (body) {
    body.innerHTML = filtered.length ? filtered.map((s) => `
      <tr>
        <td class="font-serif text-base sm:text-lg text-[var(--text-ink)] font-bold">${esc(s.name)}
          <div class="text-xs text-[var(--text-muted)] font-normal mt-0.5">${esc(s.description)} <span class="font-mono text-[10px] text-[var(--stamp-red)] ml-1.5 italic font-bold">(${esc(s.potionLabel)})</span></div>
        </td>
        <td class="font-mono text-xs text-[var(--text-muted)]">${esc(s.code)}</td>
        <td class="font-mono text-xs text-[var(--text-muted)]">${esc(s.detected)}</td>
        <td class="text-right"><span class="${badge(s)}">${esc(s.finding)}</span></td>
      </tr>`).join('') : '<tr><td colspan="4" class="text-center py-8 font-mono text-xs text-[#6a5b43]">NO SUBSTANCES DETECTED</td></tr>';
  }
  if (cards) {
    cards.innerHTML = filtered.map((s) => `
      <div class="forensics-mobile-card">
        <div class="forensics-card-top"><span class="font-mono text-xs font-bold text-[var(--text-muted)]">${esc(s.code)} // ${esc(s.categoryLabel)}</span><span class="${badge(s)}">${esc(s.finding)}</span></div>
        <h4 class="font-serif text-lg font-bold text-[var(--text-ink)]">${esc(s.name)}</h4>
        <p class="text-xs text-[var(--text-muted)]">${esc(s.description)}</p>
      </div>`).join('');
  }
}
