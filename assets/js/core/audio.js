/**
 * Core Audio Synthesis Engine
 * Zero-asset synthesized acoustic feedback using Web Audio API.
 * Off by default. Master volume <= 0.25. Safe against autoplay restrictions.
 */

import { store } from './store.js';

const LEGACY_SOUND_KEY = 'prophet_sound_enabled';
const SOUND_KEY = 'chronicle_sound';

let audioCtx = null;
let masterGain = null;
let isAudioInitialized = false;
let chugInterval = null;

// Read preference, migrating legacy key if present
function readSoundPreference() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const current = localStorage.getItem(SOUND_KEY);
  if (current !== null) {
    return current === 'true';
  }
  const legacy = localStorage.getItem(LEGACY_SOUND_KEY);
  if (legacy !== null) {
    const val = legacy === 'true';
    localStorage.setItem(SOUND_KEY, String(val));
    return val;
  }
  return false;
}

let isSoundEnabled = readSoundPreference();
store.set('sound', isSoundEnabled);

function initAudioContext() {
  if (audioCtx) return audioCtx;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  try {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    isAudioInitialized = true;
  } catch (err) {
    console.warn('[audio] Web Audio initialization prevented:', err);
  }

  return audioCtx;
}

// Ensure context is running on user gesture
function ensureContext() {
  const ctx = initAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

// Auto-mute on visibility hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
      }
      stopChug();
    } else {
      if (audioCtx && audioCtx.state === 'suspended' && isSoundEnabled) {
        audioCtx.resume();
      }
    }
  });

  // Lazy init on first user gesture
  const onGesture = () => {
    if (isSoundEnabled) {
      ensureContext();
    }
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
  };
  window.addEventListener('pointerdown', onGesture, { passive: true });
  window.addEventListener('keydown', onGesture, { passive: true });
}

export function isSoundActive() {
  return isSoundEnabled;
}

export function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  localStorage.setItem(SOUND_KEY, String(isSoundEnabled));
  store.set('sound', isSoundEnabled);

  if (isSoundEnabled) {
    ensureContext();
    playSfx('wand');
  } else {
    stopChug();
  }
  return isSoundEnabled;
}

/**
 * Play a synthesized sound effect
 * @param {'wand'|'paper'|'bell'|'whistle'|'door'|'station'|'click'|'arrival'|'chime'|'thunder'|'hoot'|'seal'|'dark-mark'|'patronus'} type
 */
export function playSfx(type) {
  if (!isSoundEnabled) return;
  const ctx = ensureContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = ctx.currentTime;

  switch (type) {
    case 'wand':
    case 'chime': {
      // Shimmering bell chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
      break;
    }

    case 'click': {
      // Mechanical linotype typewriter click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }

    case 'paper': {
      // Filtered noise rustle
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(now);
      noise.stop(now + 0.15);
      break;
    }

    case 'bell': {
      // Vintage brass platform bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.9);
      break;
    }

    case 'whistle': {
      // Vintage steam whistle
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(880, now);    // A5

      // Slight frequency flutter
      osc1.frequency.linearRampToValueAtTime(600, now + 0.3);
      osc1.frequency.linearRampToValueAtTime(580, now + 0.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.75);
      osc2.stop(now + 0.75);
      break;
    }

    case 'door': {
      // Deep gate creak / thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.4);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case 'station': {
      // Two-tone arrival chime
      const t1 = now;
      const t2 = now + 0.18;
      
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(523.25, t1); // C5
      g1.gain.setValueAtTime(0.15, t1);
      g1.gain.exponentialRampToValueAtTime(0.001, t1 + 0.5);
      o1.connect(g1);
      g1.connect(masterGain);
      o1.start(t1);
      o1.stop(t1 + 0.5);

      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(659.25, t2); // E5
      g2.gain.setValueAtTime(0.15, t2);
      g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.6);
      o2.connect(g2);
      g2.connect(masterGain);
      o2.start(t2);
      o2.stop(t2 + 0.6);
      break;
    }

    case 'arrival': {
      // Major chord arrival chime (C5 - E5 - G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const t = now + i * 0.12;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.7);
      });
      break;
    }

    case 'thunder': {
      // Low rumble for easter egg
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.8);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.9);
      break;
    }

    case 'hoot': {
      // Owl hoot: two gentle downward glides
      const hootPulse = (startTime, startFreq, endFreq, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + dur);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.14, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + dur);
      };

      hootPulse(now, 550, 480, 0.22);
      hootPulse(now + 0.26, 520, 410, 0.35);
      break;
    }

    case 'seal': {
      // Wax seal fracture: crisp crack followed by resonant snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    }

    case 'dark-mark': {
      // Sinister low dissonant drone
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const gain = ctx.createGain();
      o1.type = 'sawtooth';
      o2.type = 'triangle';
      o1.frequency.setValueAtTime(55, now);
      o1.frequency.linearRampToValueAtTime(45, now + 1.8);
      o2.frequency.setValueAtTime(77.78, now); // Diminished 5th tritone
      o2.frequency.linearRampToValueAtTime(65, now + 1.8);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      o1.connect(gain);
      o2.connect(gain);
      gain.connect(masterGain);
      o1.start(now);
      o2.start(now);
      o1.stop(now + 2.0);
      o2.stop(now + 2.0);
      break;
    }

    case 'patronus': {
      // Silvery celestial shimmer arpeggio
      const notes = [880, 1174.66, 1479.98, 1760];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.6);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.7);
      });
      break;
    }
  }
}

/**
 * Start periodic low-frequency locomotive chug noise bursts
 */
export function startChug() {
  if (chugInterval || !isSoundEnabled) return;
  const pulse = () => {
    if (!isSoundEnabled) {
      stopChug();
      return;
    }
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.07;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(now);
    noise.stop(now + 0.08);
  };

  pulse();
  chugInterval = setInterval(pulse, 340);
}

export function stopChug() {
  if (chugInterval) {
    clearInterval(chugInterval);
    chugInterval = null;
  }
}
