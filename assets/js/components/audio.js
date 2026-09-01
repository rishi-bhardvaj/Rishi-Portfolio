// ==========================================================================
// VINTAGE AUDIO & HEDWIG'S THEME SYNTHESIZER
// Zero-Dependency Synthesized Celesta / Glockenspiel & Broadsheet Sound FX
// ==========================================================================

const SOUND_KEY = 'prophet_sound_enabled';
const MUSIC_KEY = 'prophet_music_playing';

let audioCtx = null;
let isSoundEnabled = false;
let isMusicPlaying = false;
let musicTimeout = null;
let currentNoteIndex = 0;

// Iconic Hedwig's Theme (Harry Potter Melody) Notes & Durations (in ms)
const hedwigMelody = [
  { freq: 493.88, dur: 450 },  // B4
  { freq: 659.25, dur: 650 },  // E5
  { freq: 783.99, dur: 320 },  // G5
  { freq: 739.99, dur: 320 },  // F#5
  { freq: 659.25, dur: 650 },  // E5
  { freq: 987.77, dur: 450 },  // B5
  { freq: 880.00, dur: 900 },  // A5
  { freq: 739.99, dur: 900 },  // F#5
  
  { freq: 659.25, dur: 650 },  // E5
  { freq: 783.99, dur: 320 },  // G5
  { freq: 739.99, dur: 320 },  // F#5
  { freq: 622.25, dur: 650 },  // D#5
  { freq: 698.46, dur: 450 },  // F5
  { freq: 493.88, dur: 1100 }, // B4
  
  { freq: 0,      dur: 250 },  // Rest
  { freq: 493.88, dur: 450 },  // B4
  { freq: 659.25, dur: 650 },  // E5
  { freq: 783.99, dur: 320 },  // G5
  { freq: 739.99, dur: 320 },  // F#5
  { freq: 659.25, dur: 650 },  // E5
  { freq: 987.77, dur: 450 },  // B5
  { freq: 1174.66, dur: 650 }, // D6
  { freq: 1108.73, dur: 450 }, // C#6
  { freq: 1046.50, dur: 900 }, // C6
  
  { freq: 830.61, dur: 450 },  // G#5
  { freq: 1046.50, dur: 550 }, // C6
  { freq: 987.77, dur: 320 },  // B5
  { freq: 932.33, dur: 320 },  // A#5
  { freq: 466.16, dur: 550 },  // A#4
  { freq: 783.99, dur: 450 },  // G5
  { freq: 659.25, dur: 1400 }, // E5
  { freq: 0,      dur: 800 }   // Loop pause
];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudio() {
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const mobileSoundToggleBtn = document.getElementById('mobileSoundToggleBtn');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const mobileMusicToggleBtn = document.getElementById('mobileMusicToggleBtn');

  isSoundEnabled = localStorage.getItem(SOUND_KEY) === 'true';
  updateSoundButtons();
  updateMusicButtons();

  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem(SOUND_KEY, isSoundEnabled);
    updateSoundButtons();
    if (isSoundEnabled) {
      playWandChime();
    }
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      stopHedwigTheme();
    } else {
      startHedwigTheme();
    }
  }

  if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleSound);
  if (mobileSoundToggleBtn) mobileSoundToggleBtn.addEventListener('click', toggleSound);
  if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);
  if (mobileMusicToggleBtn) mobileMusicToggleBtn.addEventListener('click', toggleMusic);

  // Attach subtle click sounds to interactive items
  document.addEventListener('click', (e) => {
    if (!isSoundEnabled) return;
    const target = e.target.closest('button, .nav-link, .stamp-distressed, .btn-ink, .btn-stamp-link, .filter-tab-btn');
    if (target && !target.id?.includes('music')) {
      if (target.classList.contains('stamp-distressed') || target.classList.contains('btn-ink')) {
        playStampThud();
      } else {
        playPaperRustle();
      }
    }
  });
}

function updateSoundButtons() {
  const buttons = [
    document.getElementById('soundToggleBtn'),
    document.getElementById('mobileSoundToggleBtn')
  ];

  buttons.forEach(btn => {
    if (!btn) return;
    btn.setAttribute('aria-label', isSoundEnabled ? 'Mute Vintage Broadsheet Sound FX' : 'Enable Vintage Broadsheet Sound FX');
    btn.title = isSoundEnabled ? 'Sound FX: Enabled' : 'Sound FX: Muted';
    btn.innerHTML = isSoundEnabled
      ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`
      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
  });
}

function updateMusicButtons() {
  const buttons = [
    document.getElementById('musicToggleBtn'),
    document.getElementById('mobileMusicToggleBtn')
  ];

  buttons.forEach(btn => {
    if (!btn) return;
    btn.setAttribute('aria-label', isMusicPlaying ? "Pause Hedwig's Theme" : "Play Harry Potter Theme (Hedwig's Theme)");
    btn.title = isMusicPlaying ? "Hedwig's Theme: Playing 🎵" : "Play Harry Potter Theme Song 🎵";
    if (isMusicPlaying) {
      btn.classList.add('active');
      btn.innerHTML = `<svg class="w-4 h-4 animate-pulse text-[#9e1d1d]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`;
    }
  });
}

// Synthesize Magical Celesta Note for Hedwig's Theme
function playCelestaNote(freq, durationMs) {
  if (freq === 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const durationSec = durationMs / 1000;

  // Fundamental Bell Oscillator
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  // Harmonic Shimmer Oscillator (2x frequency)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.005, now);

  // Celesta Bell Gain Envelope
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.14, now);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.2, durationSec * 1.35));

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.04, now);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.15, durationSec * 0.9));

  osc1.connect(gain1);
  osc2.connect(gain2);

  gain1.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);

  osc1.stop(now + durationSec * 1.4);
  osc2.stop(now + durationSec * 1.4);
}

// Start Hedwig's Theme Loop
export function startHedwigTheme() {
  isMusicPlaying = true;
  updateMusicButtons();
  currentNoteIndex = 0;

  function step() {
    if (!isMusicPlaying) return;
    const note = hedwigMelody[currentNoteIndex];
    playCelestaNote(note.freq, note.dur);

    currentNoteIndex = (currentNoteIndex + 1) % hedwigMelody.length;
    musicTimeout = setTimeout(step, note.dur);
  }

  step();
}

// Stop Hedwig's Theme
export function stopHedwigTheme() {
  isMusicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
  updateMusicButtons();
}

// Synthesize Authentic Newspaper Rustle
export function playPaperRustle() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 1.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
}

// Synthesize Authentic Rubber Stamp Thud
export function playStampThud() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

// Synthesize Magical Wand Chime
export function playWandChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  [587.33, 880, 1174.66].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.05);
    osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
  });
}

