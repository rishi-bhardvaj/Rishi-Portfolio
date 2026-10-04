/**
 * Spell Voice
 * Speaks incantations aloud with correct pronunciation.
 *
 *  1. If index.html declares <meta name="spell-audio" content="assets/audio/spells/"> and a recording exists
 *     (e.g. assets/audio/spells/lumos.mp3, accio.mp3), your own clip is played.
 *  2. Otherwise the browser's speech synthesis speaks it: a low, slow British voice when one is installed.
 *
 * Only speaks while Sound is switched on (off by default).
 */

/** Respelled so speech engines say each word the way it is meant to be said. */
const PRONOUNCE = {
  lumos: 'Loo-mos',
  nox: 'Nocks',
  alohomora: 'Ah-low-ho-mora',
  colloportus: 'Col-oh-por-tus',
  accio: 'Ack-ee-oh',
  apparate: 'Ap-uh-rate',
  locomotor: 'Low-co-mo-tor',
  revelio: 'Reh-vail-ee-oh',
  reparo: 'Reh-pah-ro',
  transfiguro: 'Trans-fig-yoo-ro',
  sonorus: 'So-nor-us',
  silencio: 'Si-len-see-oh',
  cantis: 'Kan-tis',
  duplicare: 'Doo-pli-kah-ray',
  protego: 'Pro-tay-go',
  obliviate: 'Oh-bliv-ee-ate',
  expecto: 'Ex-peck-toe',
  patronum: 'Pa-tro-num',
  prior: 'Pry-or',
  incantato: 'In-can-tah-toe',
  finite: 'Fin-ee-tay',
  incantatem: 'In-can-tah-tem',
  morsmordre: 'Morz-mor-dray',
  wingardium: 'Win-gar-dee-um',
  portkey: 'Port-key',
};

const AUDIO_BASE = document.querySelector('meta[name="spell-audio"]')?.content || '';
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voice = null;
let current = null;

function pickVoice() {
  if (!synth) return;
  const list = synth.getVoices();
  if (!list.length) return;
  const score = (v) => {
    const n = `${v.name} ${v.lang}`.toLowerCase();
    let s = 0;
    if (/en[-_]gb/.test(n)) s += 4;
    else if (/^en/.test(v.lang.toLowerCase())) s += 1;
    if (/male|daniel|george|ryan|arthur|oliver|james/.test(n) && !/female/.test(n)) s += 3;
    if (/natural|neural|online/.test(n)) s += 1;
    return s;
  };
  voice = [...list].sort((a, b) => score(b) - score(a))[0] || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

const slug = (w) => w.toLowerCase().replace(/[^a-z]/g, '');

/** "ACCIO STACK" -> "Ack-ee-oh, Stack"; unknown words are spoken as written. */
function toSpeech(text) {
  return text
    .replace(/[!.]/g, '')
    .split(/\s+/)
    .map((w) => PRONOUNCE[slug(w)] || w.toLowerCase())
    .join(' ');
}

export function stopVoice() {
  synth?.cancel();
  if (current) { current.pause(); current = null; }
}

/** @param {string} spell e.g. "LUMOS" or "ACCIO WORK" */
export function speakSpell(spell) {
  stopVoice();
  const first = slug(spell.split(/\s+/)[0]);

  if (AUDIO_BASE) {
    const clip = new Audio(`${AUDIO_BASE}${first}.mp3`);
    clip.volume = 0.9;
    current = clip;
    clip.play().catch(() => speakWithSynth(spell));
    return true;
  }
  return speakWithSynth(spell);
}

function speakWithSynth(spell) {
  if (!synth) return false;
  const u = new SpeechSynthesisUtterance(toSpeech(spell));
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
  u.rate = 0.82;
  u.pitch = 0.75;
  u.volume = 0.95;
  synth.speak(u);
  return true;
}
