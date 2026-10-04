/**
 * Background Music
 *
 * 1. If index.html declares <meta name="music-file" content="assets/audio/your-track.mp3"> that licensed file is played (looped, volume-capped).
 * 2. Otherwise an original enchanted music-box piece ("Parchment Waltz", written for this site) is synthesised
 *    with Web Audio: celesta-style arpeggios and melody over a soft pad, in a gentle 6/8 lilt.
 *
 * Off by default. Starts only from a user gesture. Preference persisted in localStorage.
 */

import { getAudioEngine } from './audio.js';
import { store } from './store.js';

const MUSIC_KEY = 'chronicle_music';
/** Opt in to your own licensed track with <meta name="music-file" content="assets/audio/theme.mp3"> in index.html. */
const FILE_URL = document.querySelector('meta[name="music-file"]')?.content || '';
const EIGHTH = 0.27; // seconds per eighth note (6/8 time, ~74 dotted-quarter BPM)
const LOOKAHEAD = 1.2;

const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const hz = (name) => {
  const m = /^([A-G][#b]?)(\d)$/.exec(name);
  return 440 * Math.pow(2, (NOTE_INDEX[m[1]] + (parseInt(m[2], 10) + 1) * 12 - 69) / 12);
};

/** Eight bars. Each: bass note, arpeggio chord tones, melody as [startEighth, note, lengthEighths]. */
const BARS = [
  { bass: 'D2',  arp: ['D3', 'A3', 'D4', 'F4'],  mel: [[0, 'A4', 3], [3, 'F4', 1], [4, 'A4', 1], [5, 'D5', 1]] },
  { bass: 'Bb1', arp: ['Bb2', 'F3', 'Bb3', 'D4'], mel: [[0, 'C5', 3], [3, 'Bb4', 2], [5, 'A4', 1]] },
  { bass: 'F2',  arp: ['F3', 'C4', 'F4', 'A4'],  mel: [[0, 'A4', 2], [2, 'C5', 1], [3, 'F5', 3]] },
  { bass: 'C2',  arp: ['C3', 'G3', 'C4', 'E4'],  mel: [[0, 'E5', 3], [3, 'D5', 1], [4, 'C5', 2]] },
  { bass: 'G1',  arp: ['G2', 'D3', 'G3', 'Bb3'], mel: [[0, 'D5', 3], [3, 'Bb4', 1], [4, 'D5', 1], [5, 'G5', 1]] },
  { bass: 'D2',  arp: ['D3', 'A3', 'D4', 'F4'],  mel: [[0, 'F5', 2], [2, 'E5', 1], [3, 'D5', 3]] },
  { bass: 'A1',  arp: ['A2', 'E3', 'A3', 'C#4'], mel: [[0, 'C#5', 2], [2, 'E5', 1], [3, 'A5', 2], [5, 'G5', 1]] },
  { bass: 'D2',  arp: ['D3', 'A3', 'D4', 'F4'],  mel: [[0, 'F5', 3], [3, 'D5', 3]] },
];
const ARP_PATTERN = [0, 1, 2, 3, 2, 1]; // chord-tone index per eighth

let on = readPref();
let mode = null; // 'file' | 'synth'
let audioEl = null;
let bus = null;
let timer = 0;
let nextBar = 0;
let nextTime = 0;
let session = 0;

function readPref() {
  try { return localStorage.getItem(MUSIC_KEY) === 'true'; } catch { return false; }
}
function writePref(v) {
  try { localStorage.setItem(MUSIC_KEY, String(v)); } catch { /* storage unavailable */ }
}

export const isMusicOn = () => on;

/* ------------------------------------------------------------ synthesis */

function bell(ctx, dest, freq, t, dur, vol) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(dest);
  for (const [mult, amp] of [[1, 1], [2.01, 0.22], [4.02, 0.1]]) {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * mult;
    og.gain.value = amp;
    o.connect(og);
    og.connect(g);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

function soft(ctx, dest, freq, t, dur, vol, type = 'triangle') {
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = type === 'triangle' ? 520 : 900;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(0.5, dur * 0.35));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.connect(f);
  f.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function scheduleBar(ctx, dest, bar, t) {
  const b = BARS[bar];
  soft(ctx, dest, hz(b.bass), t, EIGHTH * 6, 0.11);
  soft(ctx, dest, hz(b.arp[0]), t, EIGHTH * 6, 0.035, 'sine'); // pad
  soft(ctx, dest, hz(b.arp[1]) * 1.003, t, EIGHTH * 6, 0.028, 'sine');
  ARP_PATTERN.forEach((idx, i) => bell(ctx, dest, hz(b.arp[idx]) * 2, t + i * EIGHTH, 1.0, 0.045));
  for (const [start, note, len] of b.mel) bell(ctx, dest, hz(note), t + start * EIGHTH, Math.min(2.2, 0.7 + len * EIGHTH * 1.2), 0.09);
}

function tick(id) {
  if (id !== session || !bus) return;
  const { ctx, dest } = bus;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleBar(ctx, dest, nextBar, nextTime);
    nextTime += EIGHTH * 6;
    nextBar = (nextBar + 1) % BARS.length;
  }
  timer = setTimeout(() => tick(id), 250);
}

function startSynth(id) {
  const engine = getAudioEngine();
  if (!engine) return false;
  const { ctx, master } = engine;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5); // gentle fade-in

  // Soft echo for a hall-like bloom
  const delay = ctx.createDelay(1);
  delay.delayTime.value = EIGHTH * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.34;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2400;
  delay.connect(tone);
  tone.connect(fb);
  fb.connect(delay);
  const dry = ctx.createGain();
  dry.connect(out);
  dry.connect(delay);
  tone.connect(out);
  out.connect(master);

  bus = { ctx, dest: dry, out, nodes: [delay, fb, tone] };
  nextBar = 0;
  nextTime = ctx.currentTime + 0.15;
  mode = 'synth';
  tick(id);
  return true;
}

/* ------------------------------------------------------------ public api */

async function startFile() {
  if (!FILE_URL) return false;
  try {
    const head = await fetch(FILE_URL, { method: 'HEAD' });
    if (!head.ok || !/audio|octet/.test(head.headers.get('content-type') || 'audio')) return false;
  } catch { return false; }
  audioEl = new Audio(FILE_URL);
  audioEl.loop = true;
  audioEl.volume = 0.35;
  try { await audioEl.play(); mode = 'file'; return true; } catch { audioEl = null; return false; }
}

export async function startMusic() {
  if (mode) return true;
  const id = ++session;
  on = true;
  writePref(true);
  store.set('music', true);
  const ok = (await startFile()) || startSynth(id);
  if (!ok) { on = false; store.set('music', false); }
  return ok;
}

export function stopMusic() {
  on = false;
  writePref(false);
  store.set('music', false);
  session++;
  clearTimeout(timer);
  if (audioEl) { audioEl.pause(); audioEl = null; }
  if (bus) {
    const { ctx, out } = bus;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
    out.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    const old = bus;
    setTimeout(() => { try { old.out.disconnect(); } catch { /* already gone */ } }, 800);
    bus = null;
  }
  mode = null;
}

export async function toggleMusic() {
  if (on && mode) { stopMusic(); return false; }
  return startMusic();
}

/** Resume a remembered preference on the first user gesture (browsers block autoplay). */
export function resumeMusicOnGesture() {
  if (!on) return;
  const go = () => {
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('keydown', go);
    if (on && !mode) startMusic();
  };
  window.addEventListener('pointerdown', go, { once: false, passive: true });
  window.addEventListener('keydown', go, { once: false, passive: true });
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (audioEl) { if (document.hidden) audioEl.pause(); else if (on) audioEl.play().catch(() => {}); }
  });
}
