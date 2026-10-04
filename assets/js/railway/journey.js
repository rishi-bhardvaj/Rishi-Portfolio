/**
 * The Journey Engine
 *
 * One number drives the whole railway: `t`, the fractional station position (0 = first station).
 *  - Pinned mode (GSAP ScrollTrigger available, motion allowed): scroll position scrubs `t`, snapping to stations.
 *  - Free mode (reduced motion / no GSAP): buttons, keys and swipes tween `t` directly (instantly when reduced).
 * `render(t)` only writes transforms and a handful of CSS variables, so travel stays cheap.
 */

import { projects } from '../data/projects.js';
import { store } from '../core/store.js';
import { showToast, trapFocus } from '../core/dom.js';
import { prefersReducedMotion } from '../core/motion.js';
import { TILE, TRAIN_VIEW } from './art.js';
import { createSceneMarkup } from './scene.js';
import { setRouteProgress, updateRouteMap } from './route-map.js';
import { renderStationCard, renderDrawer, countUpMetrics } from './station-panel.js';
import { playRailwayBell, playGateOpen, playStationArrival, startTrainChug, stopTrainChug } from './sfx.js';

const START_T = -0.55; // where the platform sign rests before boarding
const BOARDED_KEY = 'railway_boarded';
const DEG = 180 / Math.PI;
const CRANK = 24; // coupling-rod crank radius in train SVG units
const BIG_WHEEL = 44;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = (v, m) => ((v % m) + m) % m;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const navHeight = () => document.querySelector('.vintage-navbar')?.offsetHeight || 0;
const getStations = () => projects.filter((p) => !p.hidden);
const readBoarded = () => { try { return sessionStorage.getItem(BOARDED_KEY) === 'true'; } catch { return false; } };
const writeBoarded = () => { try { sessionStorage.setItem(BOARDED_KEY, 'true'); } catch { /* storage unavailable */ } };

/** @type {null | Record<string, any>} */
let S = null;

/** Writes translateX only when it changed by at least a quarter pixel. */
function setX(item, x) {
  const el = item.el || item;
  const v = Math.round(x * 4) / 4;
  if (el.__x === v) return;
  el.__x = v;
  el.style.transform = `translate3d(${v}px,0,0)`;
}

/* ---------------------------------------------------------------- lifecycle */

export function startJourney(mount) {
  S = {
    mount, stations: [], el: {}, layers: [],
    t: START_T, rawT: START_T, idx: -1, D: 1400, scale: 1,
    boarded: readBoarded(), boarding: false, locked: false, inView: false,
    mounted: false, drawerOpen: false, opener: null, releaseTrap: null, wheels: [], rod: null,
    gctx: null, st: null, cancel: null, moveTimer: 0, moving: false, lastOff: 0, cardAway: null,
    cleanups: [],
  };
  // Build the (heavy) scene only when it is about to be seen. A boarded session mounts immediately so
  // the pin spacer exists before anchor links compute their scroll targets.
  if (S.boarded) {
    mountScene();
  } else {
    const lazy = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { lazy.disconnect(); if (S && !S.mounted) mountScene(); }
    }, { rootMargin: '900px 0px' });
    lazy.observe(mount);
    S.lazy = lazy;
  }

  const onUnlock = () => rebuild();
  window.addEventListener('chronicle:secret-unlocked', onUnlock);
  S.persistent = [() => window.removeEventListener('chronicle:secret-unlocked', onUnlock)];

  return destroyJourney;
}

export function destroyJourney() {
  if (!S) return;
  S.lazy?.disconnect();
  teardownScene();
  S.persistent.forEach((fn) => fn());
  stopTrainChug();
  S = null;
}

function teardownScene() {
  if (!S.mounted) return;
  S.mounted = false;
  S.cancel?.();
  S.gctx?.revert();
  S.gctx = null;
  S.st = null;
  S.releaseTrap?.();
  S.releaseTrap = null;
  S.cleanups.forEach((fn) => fn());
  S.cleanups = [];
  clearTimeout(S.moveTimer);
}

function mountScene() {
  S.mounted = true;
  S.stations = getStations();
  S.mount.innerHTML = createSceneMarkup(S.stations);
  const q = (id) => document.getElementById(id);
  S.el = {
    stage: q('railwayStage'), rig: q('trainRig'), card: q('stationCard'), drawer: q('stationDrawer'),
    signs: q('signsStrip'), sleepers: q('trackSleepers'), seams: q('apronSeams'), map: q('routeMap'),
    counter: q('hudCounter'), protego: q('hudProtegoBtn'), dest: q('trainDestination'),
    svg: S.mount.querySelector('.train-svg'),
  };
  S.layers = [...S.mount.querySelectorAll('.world-layer')].map((el) => ({ el, speed: parseFloat(el.dataset.speed) }));
  S.wheels = [...S.mount.querySelectorAll('.wheel')].map((el) => ({ el, r: parseFloat(el.dataset.r) }));
  S.rod = S.mount.querySelector('.rod');
  S.sign = S.el.signs;
  S.sleep = S.el.sleepers;
  S.seam = S.el.seams;
  S.progress = S.cardOp = S.cardShift = S.rodX = S.rodY = null;
  S.idx = -1;
  S.drawerOpen = false;
  S.cardAway = null;

  bindInput();
  measure();

  if (S.boarded) {
    S.el.stage.dataset.state = 'active';
    S.t = S.rawT = 0;
    render(0, true);
    createPin();
  } else {
    S.t = S.rawT = START_T;
    render(START_T);
  }
}

/** Re-render everything when the station list changes (e.g. the hidden station unlocks). */
function rebuild() {
  if (!S || !S.mounted) return;
  const keep = clamp(S.idx, 0, 1e9);
  const wasBoarded = S.boarded;
  teardownScene();
  mountScene();
  if (wasBoarded) {
    const target = clamp(keep, 0, S.stations.length - 1);
    S.t = S.rawT = target;
    render(target, true);
    showToast('✶ A hidden station has appeared on the line.');
  }
}

/* ---------------------------------------------------------------- measuring & rendering */

function measure() {
  if (!S.mounted) return;
  const w = S.el.stage.clientWidth || window.innerWidth;
  S.D = Math.max(1100, w * 1.15);
  S.el.stage.style.setProperty('--d', `${S.D}px`);
  S.el.stage.style.setProperty('--nav-h', `${navHeight()}px`);
  S.el.stage.style.setProperty('--sx', `${Math.round(w * 0.5)}px`);
  const h = S.el.svg ? S.el.svg.getBoundingClientRect().height : 0;
  S.scale = h > 0 ? h / TRAIN_VIEW.h : 1;
}

function render(t, silent = false) {
  const s = S;
  s.rawT = t;
  if (s.locked && s.boarded) return;
  s.t = t;

  const off = t * s.D;
  for (const l of s.layers) setX(l, -wrap(off * l.speed, TILE));
  setX(s.sign, -off);
  setX(s.sleep, -wrap(off, 70));
  setX(s.seam, -wrap(off, 180));

  // Wheels are separate compositor layers: rotating them never repaints the train artwork.
  const px = off / s.scale; // distance travelled, in train SVG units
  for (const w of s.wheels) {
    const deg = Math.round(wrap((px / w.r) * DEG, 360) * 2) / 2; // half-degree steps: no redundant writes
    if (deg !== w.deg) { w.deg = deg; w.el.style.transform = `rotate(${deg}deg)`; }
  }
  if (s.rod) {
    const a = px / BIG_WHEEL;
    const rx = Math.round(CRANK * Math.sin(a) * s.scale * 2) / 2;
    const ry = Math.round(CRANK * (1 - Math.cos(a)) * s.scale * 2) / 2;
    if (rx !== s.rodX || ry !== s.rodY) { s.rodX = rx; s.rodY = ry; s.rod.style.transform = `translate3d(${rx}px,${ry}px,0)`; }
  }

  markMoving(off);

  const n = s.stations.length;
  const progress = n > 1 ? Math.round(clamp(t / (n - 1), 0, 1) * 1000) / 1000 : 0;
  if (progress !== s.progress) { s.progress = progress; setRouteProgress(s.el.map, progress); }

  if (!s.boarded) return;
  const near = Math.round(t);
  const ni = clamp(near, 0, n - 1);
  if (ni !== s.idx) activate(ni, silent);

  // The arrival board fades while the train is between stations
  const d = Math.abs(t - near);
  const o = clamp(1 - (d - 0.1) / 0.22, 0, 1);
  const away = o < 0.6;
  const shift = Math.round((near - t) * 70);
  const op = Math.round(o * 100) / 100;
  if (op !== s.cardOp || shift !== s.cardShift) {
    s.cardOp = op;
    s.cardShift = shift;
    s.el.card.style.opacity = op;
    s.el.card.style.transform = `translate3d(${shift}px,0,0)`;
  }
  if (away !== s.cardAway) {
    s.cardAway = away;
    s.el.card.classList.toggle('is-away', away);
  }
}

function markMoving(off) {
  const moved = Math.abs(off - S.lastOff) > 0.5;
  S.lastOff = off;
  if (!moved) return;
  if (!S.moving) {
    S.moving = true;
    S.el.stage.classList.add('is-moving');
    startTrainChug();
  }
  clearTimeout(S.moveTimer);
  S.moveTimer = setTimeout(() => {
    if (!S) return;
    S.moving = false;
    S.el.stage.classList.remove('is-moving');
    stopTrainChug();
  }, 170);
}

function activate(i, silent = false) {
  const s = S;
  const p = s.stations[i];
  if (!p) return;
  s.idx = i;
  store.set('activeStation', i);

  const style = s.el.stage.style;
  style.setProperty('--station-sky', p.theme.sky);
  style.setProperty('--station-accent', p.theme.accent);
  style.setProperty('--station-lantern', p.theme.lantern);

  renderStationCard(s.el.card, p, i, s.stations.length);
  updateRouteMap(s.el.map, i, s.stations);
  s.el.counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(s.stations.length).padStart(2, '0')}`;
  if (s.el.dest) s.el.dest.textContent = p.station;

  if (s.drawerOpen) {
    renderDrawer(s.el.drawer, p, i, s.stations.length);
    countUpMetrics(s.el.drawer);
  }
  if (!silent) playStationArrival();
}

/* ---------------------------------------------------------------- travel */

const usePin = () => !prefersReducedMotion && !!(window.gsap && window.ScrollTrigger);

function tween(from, to, ms) {
  S.cancel?.();
  return new Promise((resolve) => {
    if (prefersReducedMotion || !ms) { render(to); resolve(); return; }
    const t0 = performance.now();
    let raf = 0;
    const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      render(from + (to - from) * ease(k));
      if (k < 1) raf = requestAnimationFrame(step); else resolve();
    };
    raf = requestAnimationFrame(step);
    S.cancel = () => { cancelAnimationFrame(raf); resolve(); };
  });
}

function createPin() {
  const { gsap, ScrollTrigger } = window;
  if (!usePin() || S.st || S.stations.length < 2) return;
  gsap.registerPlugin(ScrollTrigger);
  const last = S.stations.length - 1;
  const proxy = { t: S.t };

  S.gctx = gsap.context(() => {
    const tween = gsap.to(proxy, {
      t: last,
      ease: 'none',
      onUpdate: () => render(proxy.t),
      scrollTrigger: {
        trigger: S.el.stage,
        start: () => `top ${navHeight()}px`,
        end: () => `+=${Math.round(window.innerHeight * 0.85 * last)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.5,
        invalidateOnRefresh: true,
        snap: { snapTo: 1 / last, directional: false, inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.1, ease: 'power2.inOut' },
      },
    });
    S.st = tween.scrollTrigger;
  }, S.mount);
}

/** Smoothly brings the stage to the top of the viewport before the pin begins. */
async function alignToStage() {
  const top = () => S.el.stage.getBoundingClientRect().top - navHeight();
  if (Math.abs(top()) < 2) return;
  window.scrollTo({ top: window.scrollY + top(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  for (let i = 0; i < 40 && Math.abs(top()) > 2; i++) await wait(30);
}

export async function board({ instant = false } = {}) {
  if (S && !S.mounted) mountScene();
  const s = S;
  if (!s || s.boarded || s.boarding) return;
  s.boarding = true;
  playRailwayBell();
  playGateOpen();
  await alignToStage();
  if (!S) return;

  s.el.stage.dataset.state = 'departing';
  await wait(instant || prefersReducedMotion ? 0 : 900);
  if (!S) return;

  s.el.stage.dataset.state = 'boarding';
  await tween(START_T, 0, instant ? 0 : 2600);
  if (!S) return;

  s.boarded = true;
  s.boarding = false;
  writeBoarded();
  s.el.stage.dataset.state = 'active';
  s.idx = -1;
  render(0);
  createPin();
  s.el.card.querySelector('[data-act="open-drawer"]')?.focus({ preventScroll: true });
}

export function goToStation(i) {
  if (S && !S.mounted) mountScene();
  const s = S;
  if (!s) return;
  const last = s.stations.length - 1;
  const target = clamp(i, 0, last);

  if (!s.boarded) {
    board().then(() => { if (target > 0) goToStation(target); });
    return;
  }
  if (s.boarding) return;
  if (s.locked) { showToast('\u{1F6E1} Protego is up — lower the shield to travel.'); return; }

  if (s.st) {
    const y = s.st.start + (s.st.end - s.st.start) * (last ? target / last : 0);
    window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  } else {
    tween(s.t, target, 1500);
  }
}

export const stepStation = (d) => S && goToStation((S.idx < 0 ? 0 : S.idx) + d);
export const featuredIndex = () => (S ? Math.max(0, S.stations.findIndex((p) => p.featured)) : 0);
export const currentStation = () => (S ? S.stations[S.idx] || null : null);

/* ---------------------------------------------------------------- protego & revelio */

export function toggleProtego(force) {
  const s = S;
  if (!s || !s.mounted || !s.boarded) return;
  s.locked = typeof force === 'boolean' ? force : !s.locked;
  s.el.protego.setAttribute('aria-pressed', String(s.locked));
  s.el.protego.classList.toggle('active', s.locked);
  s.el.stage.classList.toggle('is-locked', s.locked);
  showToast(s.locked ? '\u{1F6E1} Protego! This station is held.' : '\u{1F6E1} Protego lowered.');
  if (!s.locked) render(s.rawT);
}

export function toggleRevelio() {
  const s = S;
  if (!s || !s.mounted || !s.boarded) return false;
  if (!s.drawerOpen) openDrawer();
  const box = s.el.drawer.querySelector('#dwReveal');
  if (!box) return false;
  const on = box.dataset.revealed !== 'true';
  box.dataset.revealed = String(on);
  box.querySelector('[data-spell="revelio"]')?.setAttribute('aria-expanded', String(on));
  return on;
}

/* ---------------------------------------------------------------- drawer */

const INERT_TARGETS = '#stationCard, #railwayHud, #routeMap';

export const isDrawerOpen = () => !!S && S.drawerOpen;

export function openDrawer() {
  const s = S;
  if (!s || !s.mounted || !s.boarded || s.idx < 0) return;
  s.opener = document.activeElement;
  s.drawerOpen = true;
  const p = s.stations[s.idx];
  renderDrawer(s.el.drawer, p, s.idx, s.stations.length);
  countUpMetrics(s.el.drawer);
  s.el.drawer.setAttribute('aria-hidden', 'false');
  s.el.stage.dataset.drawer = 'open';
  s.el.stage.querySelectorAll(INERT_TARGETS).forEach((n) => n.setAttribute('inert', ''));
  s.releaseTrap?.();
  s.releaseTrap = trapFocus(s.el.drawer);
  requestAnimationFrame(() => s.el.drawer.querySelector('.dw-close')?.focus({ preventScroll: true }));
}

/** @returns {boolean} whether a drawer was actually closed */
export function closeDrawer() {
  const s = S;
  if (!s || !s.mounted || !s.drawerOpen) return false;
  s.drawerOpen = false;
  s.el.drawer.setAttribute('aria-hidden', 'true');
  delete s.el.stage.dataset.drawer;
  s.el.stage.querySelectorAll(INERT_TARGETS).forEach((n) => n.removeAttribute('inert'));
  s.releaseTrap?.();
  s.releaseTrap = null;
  const back = s.opener && document.contains(s.opener) ? s.opener : s.el.card.querySelector('[data-act="open-drawer"]');
  back?.focus({ preventScroll: true });
  return true;
}

/* ---------------------------------------------------------------- input */

function bindInput() {
  const s = S;
  const stage = s.el.stage;
  const add = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    s.cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  // Delegated clicks: station nodes and data-act buttons. Spell buttons are routed by the spell dispatcher.
  add(stage, 'click', (e) => {
    const node = e.target.closest('.rm-node');
    if (node) { goToStation(parseInt(node.dataset.station, 10)); return; }
    if (e.target.closest('#btnBoardRailway')) { board(); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'next') stepStation(1);
    else if (act === 'open-drawer') openDrawer();
    else if (act === 'close-drawer') closeDrawer();
  });

  // Only react to keys while the railway is on screen so the rest of the page keeps its arrow keys.
  const io = new IntersectionObserver(([entry]) => {
    s.inView = entry.intersectionRatio > 0.5;
    stage.classList.toggle('is-offscreen', !entry.isIntersecting); // pauses ambient CSS animations
    document.documentElement.classList.toggle('railway-live', entry.intersectionRatio > 0.2);
  }, { threshold: [0, 0.5, 1] });
  io.observe(stage);
  s.cleanups.push(() => { io.disconnect(); document.documentElement.classList.remove('railway-live'); });

  add(window, 'keydown', (e) => {
    if (!s.inView || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (!s.boarded) {
      if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body && !s.boarding) {
        e.preventDefault();
        board();
      }
      return;
    }
    if (s.boarding) return;
    const keys = { ArrowRight: () => stepStation(1), ArrowLeft: () => stepStation(-1), Home: () => goToStation(0), End: () => goToStation(s.stations.length - 1) };
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  });

  // Swipe / drag (touch and mouse). Vertical scrolling stays native thanks to touch-action: pan-y.
  let start = null;
  add(stage, 'pointerdown', (e) => {
    if (!s.boarded || e.target.closest('.station-card, .station-drawer, .hud, .route-map, .platform-gate, a, button')) return;
    start = { x: e.clientX, y: e.clientY };
  });
  add(window, 'pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) stepStation(dx < 0 ? 1 : -1);
  });
  add(window, 'pointercancel', () => { start = null; });

  const ro = new ResizeObserver(() => { measure(); render(s.rawT, true); });
  ro.observe(stage);
  s.cleanups.push(() => ro.disconnect());
}
