(() => {
  // assets/js/core/store.js
  var state = {
    activeStation: 0,
    theme: "lumos",
    sound: false,
    protegoLock: false,
    activeFilter: "all",
    activeSkillCategory: "all",
    skillSearch: "",
    secretUnlocked: false,
    railwayBoarded: false
  };
  var listeners = /* @__PURE__ */ new Map();
  var store = {
    get(key) {
      return state[key];
    },
    getState() {
      return { ...state };
    },
    set(key, val) {
      if (state[key] === val) return;
      const oldVal = state[key];
      state[key] = val;
      const subs = listeners.get(key);
      if (subs) {
        subs.forEach((fn) => {
          try {
            fn(val, oldVal);
          } catch (err) {
            console.error(`[store] Error in subscriber for "${key}":`, err);
          }
        });
      }
      const globalSubs = listeners.get("*");
      if (globalSubs) {
        globalSubs.forEach((fn) => {
          try {
            fn(key, val, oldVal);
          } catch (err) {
            console.error(`[store] Error in global subscriber:`, err);
          }
        });
      }
    },
    subscribe(key, fn) {
      if (!listeners.has(key)) {
        listeners.set(key, /* @__PURE__ */ new Set());
      }
      listeners.get(key).add(fn);
      return () => {
        const set = listeners.get(key);
        if (set) {
          set.delete(fn);
          if (set.size === 0) {
            listeners.delete(key);
          }
        }
      };
    }
  };

  // assets/js/core/audio.js
  var LEGACY_SOUND_KEY = "prophet_sound_enabled";
  var SOUND_KEY = "chronicle_sound";
  var audioCtx = null;
  var masterGain = null;
  var isAudioInitialized = false;
  var chugInterval = null;
  function readSoundPreference() {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const current = localStorage.getItem(SOUND_KEY);
    if (current !== null) {
      return current === "true";
    }
    const legacy = localStorage.getItem(LEGACY_SOUND_KEY);
    if (legacy !== null) {
      const val = legacy === "true";
      localStorage.setItem(SOUND_KEY, String(val));
      return val;
    }
    return false;
  }
  var isSoundEnabled = readSoundPreference();
  store.set("sound", isSoundEnabled);
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
      console.warn("[audio] Web Audio initialization prevented:", err);
    }
    return audioCtx;
  }
  function ensureContext() {
    const ctx = initAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (audioCtx && audioCtx.state === "running") {
          audioCtx.suspend();
        }
        stopChug();
      } else {
        if (audioCtx && audioCtx.state === "suspended" && isSoundEnabled) {
          audioCtx.resume();
        }
      }
    });
    const onGesture = () => {
      if (isSoundEnabled) {
        ensureContext();
      }
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture, { passive: true });
  }
  function isSoundActive() {
    return isSoundEnabled;
  }
  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem(SOUND_KEY, String(isSoundEnabled));
    store.set("sound", isSoundEnabled);
    if (isSoundEnabled) {
      ensureContext();
      playSfx("wand");
    } else {
      stopChug();
    }
    return isSoundEnabled;
  }
  function playSfx(type) {
    if (!isSoundEnabled) return;
    const ctx = ensureContext();
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    switch (type) {
      case "wand":
      case "chime": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.45);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
        break;
      }
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.045);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case "paper": {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(1.5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.14);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.15);
        break;
      }
      case "bell": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.9);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }
      case "whistle": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now);
        osc2.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(600, now + 0.3);
        osc1.frequency.linearRampToValueAtTime(580, now + 0.6);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.7);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.75);
        osc2.stop(now + 0.75);
        break;
      }
      case "door": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.4);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case "station": {
        const t1 = now;
        const t2 = now + 0.18;
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = "sine";
        o1.frequency.setValueAtTime(523.25, t1);
        g1.gain.setValueAtTime(0.15, t1);
        g1.gain.exponentialRampToValueAtTime(1e-3, t1 + 0.5);
        o1.connect(g1);
        g1.connect(masterGain);
        o1.start(t1);
        o1.stop(t1 + 0.5);
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "sine";
        o2.frequency.setValueAtTime(659.25, t2);
        g2.gain.setValueAtTime(0.15, t2);
        g2.gain.exponentialRampToValueAtTime(1e-3, t2 + 0.6);
        o2.connect(g2);
        g2.connect(masterGain);
        o2.start(t2);
        o2.stop(t2 + 0.6);
        break;
      }
      case "arrival": {
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((f, i) => {
          const t = now + i * 0.12;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(1e-3, t + 0.7);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.7);
        });
        break;
      }
      case "thunder": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.8);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.9);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }
      case "hoot": {
        const hootPulse = (startTime, startFreq, endFreq, dur) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(startFreq, startTime);
          osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + dur);
          gain.gain.setValueAtTime(1e-3, startTime);
          gain.gain.linearRampToValueAtTime(0.14, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(1e-3, startTime + dur);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + dur);
        };
        hootPulse(now, 550, 480, 0.22);
        hootPulse(now + 0.26, 520, 410, 0.35);
        break;
      }
      case "seal": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.09);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case "dark-mark": {
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const gain = ctx.createGain();
        o1.type = "sawtooth";
        o2.type = "triangle";
        o1.frequency.setValueAtTime(55, now);
        o1.frequency.linearRampToValueAtTime(45, now + 1.8);
        o2.frequency.setValueAtTime(77.78, now);
        o2.frequency.linearRampToValueAtTime(65, now + 1.8);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 2);
        o1.connect(gain);
        o2.connect(gain);
        gain.connect(masterGain);
        o1.start(now);
        o2.start(now);
        o1.stop(now + 2);
        o2.stop(now + 2);
        break;
      }
      case "patronus": {
        const notes = [880, 1174.66, 1479.98, 1760];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.6);
          gain.gain.setValueAtTime(1e-3, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.7);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.7);
        });
        break;
      }
    }
  }
  function startChug() {
    if (chugInterval || !isSoundEnabled) return;
    const pulse = () => {
      if (!isSoundEnabled) {
        stopChug();
        return;
      }
      const ctx = ensureContext();
      if (!ctx || ctx.state !== "running") return;
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
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.07);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 0.08);
    };
    pulse();
    chugInterval = setInterval(pulse, 340);
  }
  function stopChug() {
    if (chugInterval) {
      clearInterval(chugInterval);
      chugInterval = null;
    }
  }

  // assets/js/core/motion.js
  var motionQuery = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false, addEventListener: () => {
  } };
  var prefersReducedMotion = motionQuery.matches;
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", (e) => {
      prefersReducedMotion = e.matches;
    });
  }

  // assets/js/components/theme.js
  var THEME_KEY = "prophet_theme_edition";
  var wandSpellTimeout = null;
  var cleanups = [];
  function initTheme() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const mobileThemeToggleBtn = document.getElementById("mobileThemeToggleBtn");
    const savedTheme = typeof window !== "undefined" && window.localStorage ? localStorage.getItem(THEME_KEY) : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "nox" || !savedTheme && prefersDark ? "nox" : "lumos";
    applyTheme(initialTheme);
    function handleToggle() {
      const current = store.get("theme") || (document.documentElement.classList.contains("theme-nox") ? "nox" : "lumos");
      const newTheme = current === "nox" ? "lumos" : "nox";
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      triggerWandSpell(newTheme);
    }
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", handleToggle);
      cleanups.push(() => themeToggleBtn.removeEventListener("click", handleToggle));
    }
    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener("click", handleToggle);
      cleanups.push(() => mobileThemeToggleBtn.removeEventListener("click", handleToggle));
    }
    return destroyTheme;
  }
  function destroyTheme() {
    cleanups.forEach((fn) => fn());
    cleanups = [];
    if (wandSpellTimeout) {
      clearTimeout(wandSpellTimeout);
      wandSpellTimeout = null;
    }
  }
  function applyTheme(theme) {
    const isNox = theme === "nox";
    store.set("theme", theme);
    if (isNox) {
      document.documentElement.classList.add("theme-nox");
    } else {
      document.documentElement.classList.remove("theme-nox");
    }
    [document.getElementById("themeToggleBtn"), document.getElementById("mobileThemeToggleBtn")].forEach((btn) => {
      if (!btn) return;
      btn.setAttribute("aria-label", isNox ? "Switch to Broadsheet Day Edition (Lumos)" : "Switch to Nocturnal Edition (Nox)");
      btn.title = isNox ? "Lumos (Day Edition)" : "Nox (Night Edition)";
      btn.innerHTML = isNox ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
    });
  }
  function triggerWandSpell(spellType) {
    const isLumos = spellType === "lumos";
    playSfx("wand");
    if (prefersReducedMotion) return;
    let overlay = document.getElementById("wandSpellOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wandSpellOverlay";
      overlay.className = "wand-spell-overlay";
      document.body.appendChild(overlay);
    }
    if (wandSpellTimeout) clearTimeout(wandSpellTimeout);
    overlay.innerHTML = "";
    const wandWrapper = document.createElement("div");
    wandWrapper.className = "magic-wand-wrapper";
    wandWrapper.innerHTML = `
    <svg class="magic-wand-svg" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="elderWoodGrad" x1="40" y1="280" x2="280" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#140b04"/>
          <stop offset="25%" stop-color="#2d160a"/>
          <stop offset="60%" stop-color="#4a2612"/>
          <stop offset="85%" stop-color="#6e391b"/>
          <stop offset="100%" stop-color="#8a4823"/>
        </linearGradient>
      </defs>
      <polygon points="44,284 56,296 284,56 274,44" fill="url(#elderWoodGrad)" stroke="#100803" stroke-width="2"/>
      <circle cx="70" cy="258" r="9" fill="#2d160a" stroke="#100803" stroke-width="1.5"/>
      <circle cx="106" cy="222" r="8.5" fill="#3b1d0d" stroke="#100803" stroke-width="1.5"/>
      <circle cx="148" cy="180" r="7.8" fill="#4a2612" stroke="#100803" stroke-width="1.5"/>
      <circle cx="192" cy="136" r="6.8" fill="#5c3017" stroke="#100803" stroke-width="1.5"/>
      <circle cx="236" cy="92" r="5.8" fill="#6e391b" stroke="#100803" stroke-width="1.5"/>
      <line x1="62" y1="266" x2="78" y2="250" stroke="#d4af37" stroke-width="2.5"/>
      <line x1="98" y1="230" x2="114" y2="214" stroke="#d4af37" stroke-width="2.5"/>
      <line x1="140" y1="188" x2="156" y2="172" stroke="#d4af37" stroke-width="2"/>
      <line x1="184" y1="144" x2="200" y2="128" stroke="#d4af37" stroke-width="2"/>
      <circle cx="280" cy="48" r="${isLumos ? "16" : "12"}" fill="${isLumos ? "#ffffff" : "#f3e8ff"}"/>
      <circle cx="280" cy="48" r="${isLumos ? "7" : "5"}" fill="${isLumos ? "#fef08a" : "#c084fc"}"/>
    </svg>
  `;
    const burst = document.createElement("div");
    burst.className = `spell-light-burst ${isLumos ? "lumos-burst" : "nox-burst"}`;
    burst.style.right = "18%";
    burst.style.bottom = "26%";
    overlay.appendChild(burst);
    overlay.appendChild(wandWrapper);
    const sparkleCount = 18;
    for (let i = 0; i < sparkleCount; i++) {
      const star = document.createElement("div");
      star.className = "wand-sparkle-star";
      const angle = i / sparkleCount * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const distance = 50 + Math.random() * 120;
      const sx = Math.cos(angle) * distance;
      const sy = Math.sin(angle) * distance;
      star.style.setProperty("--sx", `${sx}px`);
      star.style.setProperty("--sy", `${sy}px`);
      star.style.right = "calc(8% + 50px)";
      star.style.bottom = "calc(12% + 260px)";
      star.style.backgroundColor = isLumos ? i % 2 === 0 ? "#fef08a" : "#f59e0b" : i % 2 === 0 ? "#e9d5ff" : "#9333ea";
      star.style.boxShadow = isLumos ? "0 0 12px #fde047, 0 0 22px #eab308" : "0 0 12px #c084fc, 0 0 22px #7e22ce";
      overlay.appendChild(star);
      setTimeout(() => star.remove(), 900);
    }
    wandSpellTimeout = setTimeout(() => {
      overlay.innerHTML = "";
    }, 1150);
  }

  // assets/js/components/audio.js
  var cleanups2 = [];
  function initAudio() {
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const mobileSoundToggleBtn = document.getElementById("mobileSoundToggleBtn");
    const musicToggleBtn = document.getElementById("musicToggleBtn");
    const mobileMusicToggleBtn = document.getElementById("mobileMusicToggleBtn");
    function updateButtons(active) {
      [soundToggleBtn, mobileSoundToggleBtn].forEach((btn) => {
        if (!btn) return;
        btn.title = active ? "Sound FX: Active" : "Sound FX: Muted";
        btn.setAttribute("aria-label", active ? "Mute Sound FX" : "Enable Sound FX");
        btn.innerHTML = active ? `<svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
      });
      [musicToggleBtn, mobileMusicToggleBtn].forEach((btn) => {
        if (!btn) return;
        btn.style.display = "none";
      });
    }
    const unsubscribe = store.subscribe("sound", (active) => {
      updateButtons(active);
    });
    cleanups2.push(unsubscribe);
    function handleToggle() {
      const active = toggleSound();
      updateButtons(active);
    }
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener("click", handleToggle);
      cleanups2.push(() => soundToggleBtn.removeEventListener("click", handleToggle));
    }
    if (mobileSoundToggleBtn) {
      mobileSoundToggleBtn.addEventListener("click", handleToggle);
      cleanups2.push(() => mobileSoundToggleBtn.removeEventListener("click", handleToggle));
    }
    const onDocClick = (e) => {
      if (!isSoundActive()) return;
      const target = e.target.closest("button, a, input, select, textarea, .nav-link, .filter-tab-btn");
      if (target && !target.closest("#soundToggleBtn") && !target.closest("#mobileSoundToggleBtn")) {
        playSfx("click");
      }
    };
    document.addEventListener("click", onDocClick, { passive: true });
    cleanups2.push(() => document.removeEventListener("click", onDocClick));
    updateButtons(isSoundActive());
    return destroyAudio;
  }
  function destroyAudio() {
    cleanups2.forEach((fn) => fn());
    cleanups2 = [];
  }

  // assets/js/components/navigation.js
  var cleanups3 = [];
  function initNavigation() {
    const mobileToggle = document.getElementById("mobileMenuToggle");
    const mobileClose = document.getElementById("mobileNavClose");
    const drawer = document.getElementById("mobileNavDrawer");
    const backdrop = document.getElementById("mobileNavBackdrop");
    const progressBar = document.getElementById("scrollProgressBar");
    function openDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }
    if (mobileToggle) {
      mobileToggle.addEventListener("click", openDrawer);
      cleanups3.push(() => mobileToggle.removeEventListener("click", openDrawer));
    }
    if (mobileClose) {
      mobileClose.addEventListener("click", closeDrawer);
      cleanups3.push(() => mobileClose.removeEventListener("click", closeDrawer));
    }
    if (backdrop) {
      backdrop.addEventListener("click", closeDrawer);
      cleanups3.push(() => backdrop.removeEventListener("click", closeDrawer));
    }
    const onKey = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    cleanups3.push(() => document.removeEventListener("keydown", onKey));
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    allNavLinks.forEach((link) => {
      const handler = (e) => {
        const href = link.getAttribute("href");
        if (href === "#" || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          closeDrawer();
          const headerOffset = 70;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      };
      link.addEventListener("click", handler);
      cleanups3.push(() => link.removeEventListener("click", handler));
    });
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && progressBar) {
        const progress = window.scrollY / totalHeight * 100;
        progressBar.style.width = `${progress}%`;
      }
      let currentId = "";
      const scrollPos = window.pageYOffset + 220;
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentId = section.getAttribute("id");
        }
      });
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentId}`) {
          link.classList.add("active");
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups3.push(() => window.removeEventListener("scroll", onScroll));
    return destroyNavigation;
  }
  function destroyNavigation() {
    cleanups3.forEach((fn) => fn());
    cleanups3 = [];
  }

  // assets/js/components/masthead.js
  var weatherInterval = null;
  var concurrencyInterval = null;
  function initMasthead() {
    const dateElement = document.getElementById("liveIssueDate");
    if (dateElement) {
      const now = /* @__PURE__ */ new Date();
      const options = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
      dateElement.textContent = `Bangalore \u2022 ${now.toLocaleDateString("en-GB", options)} Edition`;
    }
    const weatherTempEl = document.getElementById("weatherTemp");
    const weatherStates = [
      "24\xB0C High Concurrency",
      "23\xB0C Peak Traffic Flow",
      "25\xB0C Zero-Latency Peak",
      "24\xB0C High Concurrency"
    ];
    let weatherIndex = 0;
    weatherInterval = setInterval(() => {
      weatherIndex = (weatherIndex + 1) % weatherStates.length;
      if (weatherTempEl) {
        weatherTempEl.textContent = weatherStates[weatherIndex];
      }
    }, 12e3);
    const concurrencyEl = document.getElementById("concurrencyStatus");
    const concurrencyStates = [
      "Operational 99.99%",
      "Distributed Mesh 100%",
      "Zero-Downtime Peak",
      "Latency <15ms Stable"
    ];
    let concurrencyIndex = 0;
    concurrencyInterval = setInterval(() => {
      concurrencyIndex = (concurrencyIndex + 1) % concurrencyStates.length;
      if (concurrencyEl) {
        concurrencyEl.textContent = concurrencyStates[concurrencyIndex];
      }
    }, 9e3);
    return destroyMasthead;
  }
  function destroyMasthead() {
    if (weatherInterval) clearInterval(weatherInterval);
    if (concurrencyInterval) clearInterval(concurrencyInterval);
    weatherInterval = null;
    concurrencyInterval = null;
  }

  // assets/js/components/portrait.js
  var cleanups4 = [];
  var photoObserver = null;
  function initPortrait() {
    const photoFrame = document.querySelector(".prophet-photo-frame");
    const userImg = document.querySelector(".prophet-user-img");
    const filterBtns = document.querySelectorAll(".photo-filter-btn");
    if (!photoFrame || !userImg) return () => {
    };
    if (!prefersReducedMotion) {
      userImg.classList.add("photo-alive");
      if ("IntersectionObserver" in window) {
        photoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              userImg.style.animationPlayState = "running";
            } else {
              userImg.style.animationPlayState = "paused";
            }
          });
        }, { threshold: 0.1 });
        photoObserver.observe(photoFrame);
      }
      let dustWrap = photoFrame.querySelector(".photo-dust-overlay");
      if (!dustWrap) {
        dustWrap = document.createElement("div");
        dustWrap.className = "photo-dust-overlay";
        dustWrap.setAttribute("aria-hidden", "true");
        dustWrap.innerHTML = `
        <span class="photo-mote mote-a"></span>
        <span class="photo-mote mote-b"></span>
        <span class="photo-mote mote-c"></span>
        <span class="photo-mote mote-d"></span>
      `;
        photoFrame.appendChild(dustWrap);
      }
      const onMouseMove = (e) => {
        const rect = photoFrame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -5;
        const rotateY = (x - centerX) / centerX * 5;
        userImg.style.transform = `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.03)`;
      };
      const onMouseLeave = () => {
        userImg.style.transform = "";
      };
      photoFrame.addEventListener("mousemove", onMouseMove);
      photoFrame.addEventListener("mouseleave", onMouseLeave);
      cleanups4.push(() => photoFrame.removeEventListener("mousemove", onMouseMove));
      cleanups4.push(() => photoFrame.removeEventListener("mouseleave", onMouseLeave));
    }
    filterBtns.forEach((btn) => {
      const onClick = () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filterType = btn.getAttribute("data-filter");
        switch (filterType) {
          case "linotype":
            userImg.style.filter = "contrast(1.25) grayscale(1) brightness(0.95)";
            break;
          case "daguerreotype":
            userImg.style.filter = "contrast(1.15) sepia(0.45) brightness(0.92)";
            break;
          case "amber":
            userImg.style.filter = "contrast(1.1) sepia(0.2) hue-rotate(15deg) brightness(1.02)";
            break;
          default:
            userImg.style.filter = "contrast(1.08) brightness(0.96) sepia(0.18)";
        }
      };
      btn.addEventListener("click", onClick);
      cleanups4.push(() => btn.removeEventListener("click", onClick));
    });
    return destroyPortrait;
  }
  function destroyPortrait() {
    if (photoObserver) {
      photoObserver.disconnect();
      photoObserver = null;
    }
    cleanups4.forEach((fn) => fn());
    cleanups4 = [];
  }

  // assets/js/railway/platform.js
  function createPlatformMarkup() {
    return `
    <div class="railway-platform-container" id="platformContainer">
      <!-- Wrought Iron Entrance Arch Sign -->
      <div class="platform-arch" id="platformArch">
        <div class="arch-brass-sign">
          <span class="arch-stars">\u2605 \u2605 \u2605</span>
          <span class="arch-title">PLATFORM 10\xBE</span>
          <span class="arch-sub">THE WIZARDING RAILWAY &bull; EXPRESS LINE</span>
          <span class="arch-stars">\u2605 \u2605 \u2605</span>
        </div>
      </div>

      <!-- 3 Flickering Gas Lanterns (Desynced animation) -->
      <div class="lantern lantern-1" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <div class="lantern lantern-2" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <div class="lantern lantern-3" aria-hidden="true">
        <div class="lantern-cap"></div>
        <div class="lantern-glass">
          <div class="lantern-flame"></div>
        </div>
        <div class="lantern-glow"></div>
      </div>

      <!-- Platform Edge Flagstones -->
      <div class="platform-flagstones">
        <div class="stone-edge-line"></div>
        <div class="safety-yellow-stripe"></div>
      </div>

      <!-- Track Bed, Cross-Ties (Sleepers) & Steel Rails -->
      <div class="track-bed">
        <div class="track-ties"></div>
        <div class="rail rail-top"></div>
        <div class="rail rail-bottom"></div>
      </div>

      <!-- Dust Motes (12 ambient DOM motes) -->
      <div class="dust-motes-wrap" aria-hidden="true">
        <span class="dust-mote mote-1"></span>
        <span class="dust-mote mote-2"></span>
        <span class="dust-mote mote-3"></span>
        <span class="dust-mote mote-4"></span>
        <span class="dust-mote mote-5"></span>
        <span class="dust-mote mote-6"></span>
        <span class="dust-mote mote-7"></span>
        <span class="dust-mote mote-8"></span>
        <span class="dust-mote mote-9"></span>
        <span class="dust-mote mote-10"></span>
        <span class="dust-mote mote-11"></span>
        <span class="dust-mote mote-12"></span>
      </div>
    </div>
  `;
  }
  function createCurtainGatesMarkup() {
    return `
    <div class="railway-curtain" id="railwayCurtain">
      <div class="curtain-gate curtain-gate-left" id="curtainGateLeft">
        <div class="gate-filigree">
          <div class="gate-crest-half">RB</div>
          <div class="gate-bars"></div>
        </div>
      </div>
      <div class="curtain-gate curtain-gate-right" id="curtainGateRight">
        <div class="gate-filigree">
          <div class="gate-crest-half">RB</div>
          <div class="gate-bars"></div>
        </div>
      </div>
    </div>
  `;
  }

  // assets/js/data/projects.js
  function validateProject(project) {
    const required = [
      "id",
      "station",
      "category",
      "categoryKey",
      "title",
      "summary",
      "description",
      "status",
      "technologies",
      "spell",
      "incantation",
      "result",
      "reveal",
      "theme"
    ];
    for (const field of required) {
      if (project[field] === void 0 || project[field] === null) {
        console.warn(`[validateProject] Missing required field "${field}" on project:`, project.id);
      }
    }
    if (!project.spell?.heading || !project.spell?.body) {
      console.warn(`[validateProject] Incomplete spell field on project:`, project.id);
    }
    if (!project.incantation?.heading || !Array.isArray(project.incantation?.steps)) {
      console.warn(`[validateProject] Incomplete incantation field on project:`, project.id);
    }
    if (!project.result?.summary || !Array.isArray(project.result?.metrics)) {
      console.warn(`[validateProject] Incomplete result field on project:`, project.id);
    }
  }
  var rawProjects = [
    {
      id: "finacle",
      order: 1,
      station: "FINACLE CORE",
      number: "01",
      category: "Enterprise Banking Core",
      categoryKey: "banking",
      title: "Finacle FNPR Enterprise Banking Core",
      summary: "Tier-1 core banking engine powering global financial institutions. Engineered modules for Limits, Collaterals, and Covenants with dual-authorization approval pipelines.",
      description: "Investigation confirmed active deployment on Finacle FNPR \u2014 one of the world\u2019s leading Tier-1 core banking engines. The subject engineered mission-critical financial modules governing Credit Limits, Collaterals, and Covenant compliance. Implemented strict maker-checker multi-tiered approval pipelines to prevent unauthorized financial mutations. Successfully identified and eradicated 79 production defects while shipping 40+ client-ready enterprise enhancements.",
      status: "shipped",
      isDemo: false,
      featured: true,
      hidden: false,
      technologies: ["Java 17", "Spring Boot 3", "PostgreSQL", "Oracle DB", "PL/SQL", "Angular", "OAuth2", "RBAC"],
      spell: {
        heading: "The Dark Defect Breaches",
        body: "Critical transaction-level integrity vulnerabilities across Credit Limits, Collaterals, and Covenant compliance engines in global financial environments."
      },
      incantation: {
        heading: "Maker-Checker Multi-Tier Vault",
        body: "Constructed dual-authorization pipelines, preventing unauthorized financial mutations and tuning relational SQL ledgers.",
        steps: [
          "1. Ingest Transaction Payload & Context",
          "2. Evaluate Dynamic Covenant Rules",
          "3. Enforce Dual Maker-Checker Signatures",
          "4. ACID Commit across Oracle & Postgres"
        ]
      },
      result: {
        summary: "Eradicated 79 production defects and shipped 40+ client-ready business features worldwide.",
        metrics: [
          { label: "Defects Eradicated", value: "79" },
          { label: "Client Features", value: "40+" },
          { label: "Approval Latency", value: "<15ms" },
          { label: "Integrity Rate", value: "99.99%" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/finacle.svg",
          alt: "Finacle Banking Core Architecture",
          caption: "Maker-checker dual authorization engine architecture"
        }
      ],
      reveal: "Discovered unindexed ledger queries locking 1,200 concurrent threads; added partitioned B-tree index saving 450ms per transaction.",
      github: null,
      demo: null,
      theme: {
        sky: "#1a0b12",
        accent: "#d4af37",
        lantern: "#ffb703"
      }
    },
    {
      id: "order-management",
      order: 2,
      station: "ORDER MANAGEMENT",
      number: "02",
      category: "Full Stack & OMS",
      categoryKey: "fullstack",
      title: "EventGo High-Concurrency OMS Engine",
      summary: "High-concurrency marketplace backend designed in NestJS & TypeScript. Engineered 25 REST APIs, 6+ relational schemas with automated Prisma ORM migrations, and webhook payment gateways.",
      description: "Modular NestJS and TypeScript backend architecture designed for high-concurrency event bookings and artist discovery. Structured 6+ core relational database entities with automated Prisma ORM migrations. Integrated full Swagger/OpenAPI documentation and robust webhook handlers for transactional payments.",
      status: "shipped",
      isDemo: true,
      featured: false,
      hidden: false,
      technologies: ["NestJS", "TypeScript", "Prisma ORM", "PostgreSQL", "JWT Authentication", "Swagger", "Stripe"],
      spell: {
        heading: "The Ticketing Stampede",
        body: "High-concurrency ticket release stampedes causing race conditions in seat reservations and payment double-charges."
      },
      incantation: {
        heading: "Atomic Transaction Queues",
        body: "Engineered 25 REST APIs with automated Prisma ORM migrations, distributed locking, and idempotent payment webhooks.",
        steps: [
          "1. Validate JWT & Role Matrix",
          "2. Acquire Redis Distributed Lock",
          "3. Atomic Booking Reservation via Prisma",
          "4. Asynchronous Webhook Settlement"
        ]
      },
      result: {
        summary: "Handled concurrent booking spikes with zero double-reservations and instant settlement.",
        metrics: [
          { label: "Production APIs", value: "25" },
          { label: "Relational Entities", value: "6+" },
          { label: "Concurrency Spikes", value: "10k rps" },
          { label: "Downtime", value: "0%" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/order-management.svg",
          alt: "Order Management Engine Schema",
          caption: "Distributed transactional booking and payment architecture"
        }
      ],
      reveal: "Implemented pessimistic row locking in Prisma transaction blocks to eliminate flash-sale ticket overbooking.",
      github: "https://github.com/rishi-bhardvaj",
      demo: null,
      theme: {
        sky: "#0c1a24",
        accent: "#38bdf8",
        lantern: "#67e8f9"
      }
    },
    {
      id: "risheesh",
      order: 3,
      station: "RISHEESH",
      number: "03",
      category: "Automation & Intelligence",
      categoryKey: "automation",
      title: "Risheesh Autonomous Job Intelligence",
      summary: "Autonomous scraping, classification, and heuristic matching engine that maps technical skill profiles to verified enterprise engineering vacancies.",
      description: "Designed an automated intelligence pipeline eliminating job board noise. Employs headless crawlers, NLP semantic parsing of job descriptions, and custom heuristics to match candidate capabilities with active openings in real time.",
      status: "shipped",
      isDemo: true,
      featured: false,
      hidden: false,
      technologies: ["Node.js", "TypeScript", "Python", "PostgreSQL", "Docker", "REST API"],
      spell: {
        heading: "The Ingestion Labyrinth",
        body: "Fragmented job boards and opaque hiring signals create massive signal-to-noise friction for engineering applicants."
      },
      incantation: {
        heading: "Autonomous Ingestion & Matching Pipeline",
        body: "Built an intelligent scraping, classification, and heuristic matching engine that maps tech stack profiles to verified engineering vacancies.",
        steps: [
          "1. Headless Crawling & Normalization",
          "2. Semantic Skills Vector Extraction",
          "3. Heuristic Compatibility Scoring",
          "4. Automated Daily Digest Dispatch"
        ]
      },
      result: {
        summary: "Automated 95% of job curation workflows with sub-second matching queries.",
        metrics: [
          { label: "Ingested Postings", value: "50k+" },
          { label: "Match Precision", value: "94%" },
          { label: "Workflow Automation", value: "95%" },
          { label: "Dispatch Speed", value: "0.4s" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/risheesh.svg",
          alt: "Risheesh Automation Pipeline",
          caption: "Data ingestion, vector parsing, and ranking pipeline"
        }
      ],
      reveal: "Built custom rate-limiting backoff algorithms allowing 24/7 continuous data synchronization without IP blocks.",
      github: "https://github.com/rishi-bhardvaj",
      demo: null,
      theme: {
        sky: "#160f24",
        accent: "#a855f7",
        lantern: "#c084fc"
      }
    },
    {
      id: "devops-forge",
      order: 4,
      station: "DEVOPS FORGE",
      number: "04",
      category: "DevOps & Infrastructure",
      categoryKey: "devops",
      title: "Enterprise CI/CD Acceleration Forge",
      summary: "Parallelized test runner sharding and Docker artifact caching slashed pipeline runtimes from 120 minutes to 30 minutes across distributed build nodes.",
      description: "Audited enterprise build and testing infrastructure suffering from severe bottleneck latency. Re-architected Jenkins and GitLab automation pipelines by introducing multi-stage Docker layer caching, parallelized unit/integration test sharding, and optimized artifact repository caching.",
      status: "shipped",
      isDemo: false,
      featured: false,
      hidden: false,
      technologies: ["Jenkins", "Docker", "Kubernetes", "GitLab CI", "JUnit 5", "Bash", "Maven"],
      spell: {
        heading: "The Two-Hour Build Bottleneck",
        body: "Enterprise test and build pipelines languished at 120 minutes per merge request, crippling developer velocity."
      },
      incantation: {
        heading: "Parallel Runner Sharding & Layer Caching",
        body: "Re-architected build stages with Docker multi-stage caching, parallel test sharding across distributed nodes, and automated lint gates.",
        steps: [
          "1. Multi-Stage Docker Layer Pre-Warm",
          "2. Parallel JUnit 5 Test Sharding",
          "3. Artifact Repository Cache Mounts",
          "4. Automated Security & Lint Gateways"
        ]
      },
      result: {
        summary: "Slashed enterprise test and build execution times from 120 minutes down to 30 minutes (75% time reduction).",
        metrics: [
          { label: "Runtime Reduction", value: "75%" },
          { label: "Original Runtime", value: "120 min" },
          { label: "Optimized Runtime", value: "30 min" },
          { label: "Compute Savings", value: "4x" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/devops-forge.svg",
          alt: "CI/CD Pipeline Sharding",
          caption: "Parallel runner nodes and Docker cache acceleration"
        }
      ],
      reveal: "Identified redundant Maven dependency downloads per runner; implemented a shared PVC caching proxy saving 18 min per build.",
      github: "https://github.com/rishi-bhardvaj",
      demo: null,
      theme: {
        sky: "#1e140d",
        accent: "#f97316",
        lantern: "#fb923c"
      }
    },
    {
      id: "vision-lab",
      order: 5,
      station: "VISION LAB",
      number: "05",
      category: "Research & Vision",
      categoryKey: "research",
      title: "Gait Analysis of Human Behaviour (IJRPR)",
      summary: "Authored peer-reviewed paper in IJRPR exploring computer-vision and accelerometer sensor gait tracking models to classify human behavioral movements non-intrusively.",
      description: "Authored and published a peer-reviewed research investigation in the International Journal of Research Publication and Reviews (IJRPR). The research explores computer-vision and sensor-driven gait tracking algorithms to identify distinctive human behavioral patterns without intrusive tracking sensors.",
      status: "shipped",
      isDemo: false,
      featured: false,
      hidden: false,
      technologies: ["Python", "OpenCV", "Computer Vision", "Biometric Signal Processing", "Statistical Data Models"],
      spell: {
        heading: "The Sensor Invasiveness Dilemma",
        body: "Traditional behavioral motion analysis required invasive, expensive body-worn sensors prone to tracking noise and bias."
      },
      incantation: {
        heading: "Optical Flow & Kinematic Trajectory Extraction",
        body: "Formulated non-intrusive computer vision extraction algorithms to model kinematic gait patterns under ambient illumination.",
        steps: [
          "1. Ambient Video Feed Ingestion",
          "2. Silhouette Contour Extraction",
          "3. Kinematic Feature Vector Normalization",
          "4. Classification via Statistical Model"
        ]
      },
      result: {
        summary: "Published in peer-reviewed International Journal of Research Publication and Reviews (IJRPR), 2025.",
        metrics: [
          { label: "Publication", value: "IJRPR '25" },
          { label: "Tracking Accuracy", value: "96.2%" },
          { label: "Sensor Intrusion", value: "0%" },
          { label: "Frame Latency", value: "33ms" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/vision-lab.svg",
          alt: "Gait Kinematic Extraction",
          caption: "Computer vision gait trajectory and kinematic modeling"
        }
      ],
      reveal: "Normalizing cadence aspect-ratio against perspective distortion increased classification accuracy by 14%.",
      github: "https://github.com/rishi-bhardvaj",
      demo: null,
      theme: {
        sky: "#0c1a17",
        accent: "#10b981",
        lantern: "#34d399"
      }
    },
    {
      id: "marauders-archive",
      order: 6,
      station: "MARAUDER'S ARCHIVE",
      number: "06",
      category: "Experimental Systems",
      categoryKey: "experimental",
      title: "Marauder's Interactive Engineering Sandbox",
      summary: "A cinematic, zero-bundler interactive broadsheet & railway portfolio orchestrating complex state machines, GSAP context timelines, and synthesized audio.",
      description: "Constructed an immersive, zero-bundler portfolio architecture blending linotype newspaper print aesthetics with a high-performance SVG railway simulation. Features native ES modules, reactive pub/sub state stores, WebAudio synthesis, and comprehensive accessibility hooks.",
      status: "demo",
      isDemo: true,
      featured: false,
      hidden: false,
      technologies: ["TypeScript", "Canvas API", "WebAudio API", "GSAP", "CSS Architecture"],
      spell: {
        heading: "Static Portfolio Monotony",
        body: "Typical software portfolios are flat, sterile r\xE9sum\xE9s that fail to demonstrate real-time architecture, state orchestration, and craft."
      },
      incantation: {
        heading: "The Broadsheet & Railway Orchestration Engine",
        body: "Constructed a zero-bundler, modular ES-system pairing vintage linotype newspaper aesthetic with a cinematic railway timeline.",
        steps: [
          "1. Synchronize State Store via Tiny Pub/Sub",
          "2. Mount SVG Railway Parallax & Train Sprite",
          "3. Orchestrate Timelines via GSAP Context",
          "4. Bind Synthesized WebAudio SFX"
        ]
      },
      result: {
        summary: "100% responsive, zero-build interactive experience with full reduced-motion accessibility.",
        metrics: [
          { label: "Build Step", value: "0" },
          { label: "Lighthouse A11y", value: "100" },
          { label: "Interactive Spells", value: "14" },
          { label: "Pure WebAudio SFX", value: "8" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/marauders-archive.svg",
          alt: "The Marauder Engine Architecture",
          caption: "State, motion, audio, and component orchestration diagram"
        }
      ],
      reveal: "Every spell, sound, and railway movement is generated purely in client-side code without external asset dependencies.",
      github: "https://github.com/rishi-bhardvaj",
      demo: "#work",
      theme: {
        sky: "#1a1208",
        accent: "#eab308",
        lantern: "#facc15"
      }
    },
    {
      id: "room-of-requirement",
      order: 7,
      station: "ROOM OF REQUIREMENT",
      number: "07",
      category: "Secret Vault",
      categoryKey: "experimental",
      title: "Secret Experimental Sandbox & AST Transformer",
      summary: "Classified laboratory chamber unlocked only through curious inspection. Houses experimental AST transformations and reactive runtime experiments.",
      description: "A hidden station uncovered along the wizarding railway line. Contains experimental prototypes in reactive state derivation, custom AST transformations, and generative vector cartography.",
      status: "demo",
      isDemo: true,
      featured: false,
      get hidden() {
        return !isSecretStationUnlocked();
      },
      technologies: ["TypeScript", "AST Parsing", "Babel Core", "Web Workers", "Vector Graphics"],
      spell: {
        heading: "The Hidden Chamber of Code",
        body: "Experimental architectures that only reveal themselves to engineers who probe deeper into the parchment fabric."
      },
      incantation: {
        heading: "Seven Seals of Transmutation",
        body: "Unlocked via seven rhythmic strikes upon the crest emblem, breaking the tamper seal of the classified ledger.",
        steps: [
          "1. Intercept Crest Click Sequence",
          "2. Verify 7-Beat Cadence",
          "3. Unmask Hidden Station in Route Matrix",
          "4. Trigger Seal-Fracture SFX & Anim"
        ]
      },
      result: {
        summary: "Successfully unlocked the secret 7th station of the Wizarding Railway.",
        metrics: [
          { label: "Seals Broken", value: "7" },
          { label: "Secret Level", value: "Classified" },
          { label: "State Discovery", value: "100%" },
          { label: "Easter Egg", value: "Active" }
        ]
      },
      artifacts: [
        {
          src: "assets/images/projects/room-of-requirement.svg",
          alt: "Room of Requirement Chamber",
          caption: "Classified experimental chamber"
        }
      ],
      reveal: "You unlocked the secret station! Congratulations on your inquisitive spirit.",
      github: "https://github.com/rishi-bhardvaj",
      demo: null,
      theme: {
        sky: "#170c1e",
        accent: "#ec4899",
        lantern: "#f472b6"
      }
    }
  ];
  function isSecretStationUnlocked() {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    return sessionStorage.getItem("chronicle_unlocked_secret") === "true";
  }
  function unlockSecretStation() {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem("chronicle_unlocked_secret", "true");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("chronicle:secret-unlocked"));
    }
  }
  rawProjects.forEach(validateProject);
  var projects = Object.freeze(rawProjects.map((p) => {
    const base = {
      ...p,
      technologies: Object.freeze([...p.technologies]),
      spell: Object.freeze({ ...p.spell }),
      incantation: Object.freeze({
        ...p.incantation,
        steps: Object.freeze([...p.incantation.steps])
      }),
      result: Object.freeze({
        ...p.result,
        metrics: Object.freeze(p.result.metrics.map((m) => Object.freeze({ ...m })))
      }),
      artifacts: Object.freeze(p.artifacts.map((a) => Object.freeze({ ...a }))),
      theme: Object.freeze({ ...p.theme })
    };
    if (p.id === "room-of-requirement") {
      Object.defineProperty(base, "hidden", {
        get() {
          return !isSecretStationUnlocked();
        },
        enumerable: true,
        configurable: false
      });
    }
    return Object.freeze(base);
  }));
  function getProjectById(id) {
    return projects.find((p) => p.id === id) || null;
  }

  // assets/js/railway/train.js
  function createTrainMarkup() {
    const visibleProjects = projects.filter((p) => !p.hidden);
    return `
    <div class="train-assembly" id="trainAssembly">
      <!-- Steam Puffs Emitter (Canvas-free DOM puffs) -->
      <div class="steam-emitter" id="steamEmitter" aria-hidden="true">
        <div class="steam-puff puff-1"></div>
        <div class="steam-puff puff-2"></div>
        <div class="steam-puff puff-3"></div>
        <div class="steam-puff puff-4"></div>
        <div class="steam-puff puff-5"></div>
        <div class="steam-puff puff-6"></div>
      </div>

      <!-- Train Master SVG Sprite -->
      <svg class="train-svg" viewBox="0 0 1600 240" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
        <defs>
          <!-- Locomotive Gradients -->
          <linearGradient id="locoBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8a182b"/>
            <stop offset="60%" stop-color="#6e1423"/>
            <stop offset="100%" stop-color="#470b16"/>
          </linearGradient>
          <linearGradient id="boilerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a322d"/>
            <stop offset="45%" stop-color="#1c1815"/>
            <stop offset="100%" stop-color="#0e0c0b"/>
          </linearGradient>
          <linearGradient id="brassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#d4af37"/>
            <stop offset="100%" stop-color="#927114"/>
          </linearGradient>
          <linearGradient id="carriageUpper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fdfbf7"/>
            <stop offset="100%" stop-color="#e8dcbe"/>
          </linearGradient>
          <linearGradient id="carriageLower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#801526"/>
            <stop offset="100%" stop-color="#540e1b"/>
          </linearGradient>
          <linearGradient id="windowGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="50%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>

        <!-- 1. STEAM LOCOMOTIVE (Rightmost / Front of train facing Right) -->
        <g id="locomotive" transform="translate(1180, 0)">
          <!-- Cowcatcher / Pilot -->
          <polygon points="350,185 390,195 385,200 330,200" fill="#181412" stroke="#b08d3c" stroke-width="1.5"/>
          <line x1="345" y1="187" x2="355" y2="200" stroke="#b08d3c" stroke-width="1.5"/>
          <line x1="360" y1="190" x2="370" y2="200" stroke="#b08d3c" stroke-width="1.5"/>

          <!-- Main Boiler (Black & Brass Bands) -->
          <rect x="140" y="80" width="210" height="95" rx="10" fill="url(#boilerGrad)" stroke="#181412" stroke-width="2"/>
          
          <!-- Brass Boiler Bands -->
          <rect x="175" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>
          <rect x="235" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>
          <rect x="295" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>

          <!-- Steam Smokestack / Chimney -->
          <path d="M315,80 L318,35 L338,30 L342,80 Z" fill="url(#boilerGrad)" stroke="#181412" stroke-width="1.5"/>
          <ellipse cx="328" cy="30" rx="12" ry="4" fill="url(#brassGrad)"/>

          <!-- Steam Dome & Sand Dome -->
          <path d="M260,80 C260,50 280,50 280,80 Z" fill="url(#brassGrad)" stroke="#927114" stroke-width="1"/>
          <path d="M195,80 C195,58 215,58 215,80 Z" fill="url(#brassGrad)" stroke="#927114" stroke-width="1"/>

          <!-- Headlamp with Golden Light Beam -->
          <g transform="translate(350, 95)">
            <rect x="0" y="0" width="22" height="26" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
            <circle cx="11" cy="13" r="8" fill="#fef08a"/>
            <!-- Forward Light Cone -->
            <polygon points="22,13 140,-25 140,55" fill="rgba(254, 240, 138, 0.18)" class="headlamp-beam"/>
          </g>

          <!-- Driver Cab (Burgundy & Warm Window) -->
          <path d="M40,50 L145,50 L145,175 L40,175 Z" fill="url(#locoBodyGrad)" stroke="#b08d3c" stroke-width="2"/>
          <!-- Cab Overhang Roof -->
          <path d="M35,46 L150,46 L145,52 L38,52 Z" fill="#241417"/>
          <!-- Cab Windows -->
          <rect x="58" y="66" width="34" height="42" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
          <rect x="100" y="66" width="34" height="42" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>

          <!-- Brass Nameplate -->
          <rect x="190" y="115" width="85" height="18" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
          <text x="232" y="128" font-family="'Space Mono', monospace" font-size="8" fill="#fef08a" font-weight="bold" text-anchor="middle">RISHI EXPR.</text>

          <!-- Wheel Frame Underbody -->
          <rect x="35" y="172" width="320" height="12" rx="2" fill="#181412"/>

          <!-- Wheels Group (Class toggled for rotation) -->
          <g class="train-wheels" transform="translate(0, 0)">
            <!-- Driving Wheel 1 -->
            <g transform="translate(85, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Driving Wheel 2 -->
            <g transform="translate(155, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Driving Wheel 3 -->
            <g transform="translate(225, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Front Bogie Wheels (Smaller) -->
            <g transform="translate(295, 192)">
              <circle cx="0" cy="0" r="14" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2"/>
              <circle cx="0" cy="0" r="4" fill="url(#brassGrad)"/>
            </g>
            <g transform="translate(330, 192)">
              <circle cx="0" cy="0" r="14" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2"/>
              <circle cx="0" cy="0" r="4" fill="url(#brassGrad)"/>
            </g>
            <!-- Side Rod / Connecting Rod -->
            <line x1="85" y1="185" x2="225" y2="185" stroke="#fef08a" stroke-width="4" stroke-linecap="round"/>
          </g>

          <!-- Coupler to tender/carriages -->
          <rect x="15" y="165" width="25" height="8" rx="2" fill="#181412"/>
        </g>

        <!-- 2. CARRIAGE 1 (Finacle Core / Banking) -->
        ${renderCarriage(830, visibleProjects[0], "01")}

        <!-- 3. CARRIAGE 2 (Order Management) -->
        ${renderCarriage(480, visibleProjects[1], "02")}

        <!-- 4. CARRIAGE 3 (Risheesh Automation) -->
        ${renderCarriage(130, visibleProjects[2], "03")}
      </svg>
    </div>
  `;
  }
  function renderCarriage(offsetX, project, defaultNum) {
    const stationName = project ? project.station : `STATION ${defaultNum}`;
    const stnNum = project ? project.number : defaultNum;
    return `
    <g class="train-carriage" transform="translate(${offsetX}, 0)">
      <!-- Coupler linking to next -->
      <rect x="-20" y="165" width="25" height="8" rx="2" fill="#181412"/>

      <!-- Roof -->
      <path d="M5,70 Q165,58 325,70 L325,76 L5,76 Z" fill="#2a1d20" stroke="#181412" stroke-width="1.5"/>

      <!-- Upper Carriage Body (Cream) -->
      <rect x="5" y="76" width="320" height="52" fill="url(#carriageUpper)" stroke="#b08d3c" stroke-width="1.5"/>

      <!-- 4 Glowing Warm Windows -->
      <rect x="25" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="100" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="180" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="255" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>

      <!-- Window mullions -->
      <line x1="48" y1="84" x2="48" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="123" y1="84" x2="123" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="203" y1="84" x2="203" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="278" y1="84" x2="278" y2="120" stroke="#470b16" stroke-width="1"/>

      <!-- Lower Carriage Body (Deep Burgundy) -->
      <rect x="5" y="128" width="320" height="48" fill="url(#carriageLower)" stroke="#b08d3c" stroke-width="1.5"/>

      <!-- Gold Plate Ribbon & Inscription -->
      <rect x="70" y="138" width="190" height="20" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
      <text x="165" y="152" font-family="'Space Mono', monospace" font-size="8.5" fill="#fef08a" font-weight="bold" text-anchor="middle">
        NO. ${stnNum} &bull; ${stationName}
      </text>

      <!-- Chassis Underframe -->
      <rect x="10" y="172" width="310" height="10" rx="2" fill="#181412"/>

      <!-- Carriage Bogie Wheels (2 pairs) -->
      <g class="train-wheels">
        <g transform="translate(60, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(100, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(230, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(270, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
      </g>
    </g>
  `;
  }

  // assets/js/railway/route-map.js
  var cleanups5 = [];
  function createRouteMapMarkup() {
    const visibleProjects = projects.filter((p) => !p.hidden);
    return `
    <nav class="route-map-parchment" id="routeMap" aria-label="Railway Route Map">
      <div class="route-map-header">
        <span class="route-map-title">RISHI'S WIZARDING RAILWAY</span>
        <span class="route-map-tag">EXPRESS LINE &bull; 6 STATIONS</span>
      </div>

      <div class="route-track-wrap">
        <!-- Track Background & Fill Progress Line -->
        <div class="track-dashed-line"></div>
        <div class="track-fill-line" id="trackFillLine" style="transform: scaleX(0);"></div>

        <!-- Station Stop Nodes -->
        <div class="route-nodes-list" id="routeNodesList" role="list">
          ${visibleProjects.map((project, idx) => `
            <button 
              class="route-node-btn ${idx === 0 ? "current" : "upcoming"}" 
              data-station-index="${idx}"
              data-station-id="${project.id}"
              aria-label="Station ${project.number}: ${project.station}"
              ${idx === 0 ? 'aria-current="step"' : ""}
              role="listitem"
            >
              <div class="node-ring">
                <span class="node-number">${project.number}</span>
                <span class="node-seal" aria-hidden="true">\u2605</span>
              </div>
              <div class="node-label-wrap">
                <span class="node-station-name">${project.station}</span>
                <span class="node-category">${project.categoryKey.toUpperCase()}</span>
              </div>
            </button>
          `).join("")}
        </div>
      </div>
    </nav>
  `;
  }
  function initRouteMap(onStationSelect) {
    function bindNodes() {
      const nodeBtns = document.querySelectorAll(".route-node-btn");
      nodeBtns.forEach((btn) => {
        const handler = () => {
          const idx = parseInt(btn.getAttribute("data-station-index"), 10);
          if (!isNaN(idx) && typeof onStationSelect === "function") {
            onStationSelect(idx, { source: "route-map" });
          }
        };
        btn.addEventListener("click", handler);
        cleanups5.push(() => btn.removeEventListener("click", handler));
      });
    }
    bindNodes();
    const onSecretUnlocked = () => {
      const listEl = document.getElementById("routeNodesList");
      const tagEl = document.querySelector(".route-map-tag");
      const visibleProjects = projects.filter((p) => !p.hidden);
      if (tagEl) {
        tagEl.innerHTML = `EXPRESS LINE &bull; ${visibleProjects.length} STATIONS <span style="color:var(--accent-crimson)">(VAULT OPEN)</span>`;
      }
      if (listEl) {
        listEl.innerHTML = visibleProjects.map((project, idx) => `
        <button 
          class="route-node-btn ${idx === store.get("activeStation") ? "current" : "upcoming"}" 
          data-station-index="${idx}"
          data-station-id="${project.id}"
          aria-label="Station ${project.number}: ${project.station}"
          ${idx === store.get("activeStation") ? 'aria-current="step"' : ""}
          role="listitem"
        >
          <div class="node-ring">
            <span class="node-number">${project.number}</span>
            <span class="node-seal" aria-hidden="true">${project.id === "room-of-requirement" ? "\u26A1" : "\u2605"}</span>
          </div>
          <div class="node-label-wrap">
            <span class="node-station-name">${project.station}</span>
            <span class="node-category">${project.categoryKey.toUpperCase()}</span>
          </div>
        </button>
      `).join("");
        bindNodes();
        updateRouteMapUI(store.get("activeStation"));
      }
    };
    window.addEventListener("chronicle:secret-unlocked", onSecretUnlocked);
    cleanups5.push(() => window.removeEventListener("chronicle:secret-unlocked", onSecretUnlocked));
    return destroyRouteMap;
  }
  function updateRouteMapUI(activeIndex) {
    const nodeBtns = document.querySelectorAll(".route-node-btn");
    const fillLine = document.getElementById("trackFillLine");
    const total = nodeBtns.length;
    if (total > 1 && fillLine) {
      const progress = Math.max(0, Math.min(1, activeIndex / (total - 1)));
      fillLine.style.transform = `scaleX(${progress})`;
    }
    nodeBtns.forEach((btn, idx) => {
      btn.classList.remove("visited", "current", "upcoming");
      btn.removeAttribute("aria-current");
      if (idx < activeIndex) {
        btn.classList.add("visited");
      } else if (idx === activeIndex) {
        btn.classList.add("current");
        btn.setAttribute("aria-current", "step");
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        btn.classList.add("upcoming");
      }
    });
  }
  function destroyRouteMap() {
    cleanups5.forEach((fn) => fn());
    cleanups5 = [];
  }

  // assets/js/railway/scene.js
  function createSceneMarkup() {
    return `
    <div class="railway-stage" id="railwayStage">
      <!-- 1. Multi-Layer Parallax Landscape -->
      <div class="railway-world" id="railwayWorld">
        <!-- Far Layer: Sky, Starfield & Castle Spire Silhouette -->
        <div class="world-layer layer-sky" id="layerSky">
          <div class="gothic-spires-silhouette"></div>
          <div class="distant-moon"></div>
        </div>

        <!-- Mid-Far Layer: Misty Highland Hills -->
        <div class="world-layer layer-hills" id="layerHills">
          <div class="hills-silhouette"></div>
        </div>

        <!-- Mid Layer: Forest & Ancient Viaduct -->
        <div class="world-layer layer-trees" id="layerTrees">
          <div class="viaduct-arches"></div>
          <div class="forest-silhouette"></div>
        </div>

        <!-- Near Layer: Telegraph Lines & Platform Lamps -->
        <div class="world-layer layer-foreground" id="layerForeground">
          <div class="telegraph-poles"></div>
        </div>

        <!-- Ambient Ground Fog Drift Layer -->
        <div class="world-fog-layer" aria-hidden="true">
          <div class="fog-drift fog-1"></div>
          <div class="fog-drift fog-2"></div>
        </div>
      </div>

      <!-- 2. Platform Architecture & Track Bed -->
      ${createPlatformMarkup()}

      <!-- 3. Steam Train Assembly -->
      ${createTrainMarkup()}

      <!-- 4. Parchment Route Map Strip -->
      ${createRouteMapMarkup()}

      <!-- 5. Railway HUD (Station Indicator & Controls) -->
      <div class="railway-hud" id="railwayHud">
        <div class="hud-controls-left">
          <button id="hudPrevBtn" class="hud-nav-btn" aria-label="Prior Station" title="Prior Incantato (\u2190)">
            &larr; PRIOR
          </button>
          <div class="hud-counter" id="hudCounter">01 / 06</div>
          <button id="hudNextBtn" class="hud-nav-btn" aria-label="Next Station" title="Next Station (\u2192)">
            NEXT &rarr;
          </button>
        </div>

        <div class="hud-controls-right">
          <button id="hudProtegoBtn" class="hud-chip" aria-pressed="false" title="Protego (Pin Current Station)">
            <span class="hud-chip-dot"></span>
            <span>PROTEGO</span>
          </button>
          <button id="hudReboardBtn" class="hud-chip hidden sm:inline-flex" title="Return to Platform 10\xBE">
            REBOARD
          </button>
        </div>
      </div>

      <!-- 6. Wrought Iron Split Gates -->
      ${createCurtainGatesMarkup()}

      <!-- 7. Platform Entrance Overlay -->
      <div class="railway-intro" id="railwayIntro">
        <div class="intro-parchment-card">
          <div class="intro-eyebrow">THE WIZARDING RAILWAY</div>
          <h2 class="intro-headline">YOUR PORTFOLIO AWAITS</h2>
          <p class="intro-description">
            Step beyond the linotype columns. An expedition across mission-critical banking platforms, high-throughput marketplaces, and distributed systems.
          </p>
          <div class="intro-cta-wrap">
            <button id="btnBoardRailway" class="btn-platform-board">
              <span>BOARD PLATFORM 10\xBE</span>
              <span class="font-mono ml-2">&rarr;</span>
            </button>
          </div>
          <div class="intro-sub-note">
            Press <kbd>Space</kbd> or click to board &bull; Use <kbd>&larr;</kbd> <kbd>&rarr;</kbd> or swipe to travel
          </div>
        </div>
      </div>
    </div>

    <!-- 8. Interactive Station Dossier Panel (Slides over stage) -->
    <aside class="station-panel" id="stationPanel" aria-label="Station Case Study Panel" aria-live="polite">
      <!-- Injected dynamically via railway/station-panel.js -->
    </aside>
  `;
  }

  // assets/js/core/dom.js
  function showToast(message, duration = 3200) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-broadsheet";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("visible");
    });
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
  function assertDom(ids) {
    const missing = [];
    for (const id of ids) {
      if (!document.getElementById(id)) {
        missing.push(id);
      }
    }
    if (missing.length > 0) {
      console.warn("[assertDom] Missing expected DOM mount points / elements:", missing);
    }
  }
  function trapFocus(container) {
    if (!container || typeof document === "undefined") return () => {
    };
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(container.querySelectorAll(focusableSelector)).filter((el) => !el.disabled && el.offsetParent !== null);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }

  // assets/js/components/dossier.js
  var lastActiveElement = null;
  var cleanups6 = [];
  function initDossier() {
    const modal = document.getElementById("caseModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    const bottomCloseBtn = document.getElementById("modalBottomCloseBtn");
    if (closeBtn) {
      const onClose = () => closeDossier();
      closeBtn.addEventListener("click", onClose);
      cleanups6.push(() => closeBtn.removeEventListener("click", onClose));
    }
    if (bottomCloseBtn) {
      const onBottomClose = () => closeDossier();
      bottomCloseBtn.addEventListener("click", onBottomClose);
      cleanups6.push(() => bottomCloseBtn.removeEventListener("click", onBottomClose));
    }
    if (modal) {
      const onBackdrop = (e) => {
        if (e.target === modal) closeDossier();
      };
      modal.addEventListener("click", onBackdrop);
      cleanups6.push(() => modal.removeEventListener("click", onBackdrop));
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        const m = document.getElementById("caseModal");
        if (m && m.classList.contains("active")) {
          closeDossier();
        }
      } else if (e.key === "Tab") {
        trapFocus2(e);
      }
    };
    document.addEventListener("keydown", onKey);
    cleanups6.push(() => document.removeEventListener("keydown", onKey));
    return destroyDossier;
  }
  function destroyDossier() {
    cleanups6.forEach((fn) => fn());
    cleanups6 = [];
    closeDossier();
  }
  function trapFocus2(e) {
    const modal = document.getElementById("caseModal");
    if (!modal || !modal.classList.contains("active")) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
  function openDossier(caseId) {
    const project = getProjectById(caseId);
    if (!project) return;
    lastActiveElement = document.activeElement;
    const exhibitEl = document.getElementById("modalExhibit");
    const titleEl = document.getElementById("modalTitle");
    const domainEl = document.getElementById("modalDomain");
    const timelineEl = document.getElementById("modalTimeline");
    const descEl = document.getElementById("modalDescription");
    const techContainer = document.getElementById("modalTechStack");
    const metricsContainer = document.getElementById("modalMetrics");
    if (exhibitEl) {
      exhibitEl.textContent = `EXHIBIT // STATION ${project.number} &bull; ${project.category.toUpperCase()} ${project.isDemo ? "[DEMO]" : "[VERIFIED]"}`;
    }
    if (titleEl) titleEl.textContent = project.title;
    if (domainEl) domainEl.textContent = `TARGET: ${project.station}`;
    if (timelineEl) timelineEl.textContent = `STATUS: ${project.status.toUpperCase()} &bull; ORDER: ${project.order}`;
    if (descEl) descEl.textContent = project.description;
    if (techContainer) {
      techContainer.innerHTML = project.technologies.map((t) => `<span class="stamp-badge">${t}</span>`).join("");
    }
    if (metricsContainer) {
      const metricLines = project.result.metrics.map((m) => `<li><strong>${m.label}:</strong> ${m.value}</li>`).join("");
      metricsContainer.innerHTML = `
      <li class="font-bold text-[var(--stamp-red)] mb-1">${project.result.summary}</li>
      ${metricLines}
    `;
    }
    const modal = document.getElementById("caseModal");
    const main = document.querySelector(".broadsheet-wrapper");
    if (modal) {
      let seal = modal.querySelector(".dossier-wax-seal");
      if (!seal) {
        seal = document.createElement("div");
        seal.className = "dossier-wax-seal";
        seal.textContent = "RB";
        const dossierBox = modal.querySelector(".modal-dossier");
        if (dossierBox) dossierBox.appendChild(seal);
      }
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      if (main) main.setAttribute("inert", "");
      playSfx("door");
      const closeBtn = document.getElementById("modalCloseBtn");
      if (closeBtn) closeBtn.focus();
    }
  }
  function closeDossier() {
    const modal = document.getElementById("caseModal");
    const main = document.querySelector(".broadsheet-wrapper");
    if (modal && modal.classList.contains("active")) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (main) main.removeAttribute("inert");
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
        lastActiveElement = null;
      }
    }
  }
  if (typeof window !== "undefined") {
    window.openCaseModal = openDossier;
    window.closeCaseModal = closeDossier;
    window.openDossier = openDossier;
    window.closeDossier = closeDossier;
  }

  // assets/js/railway/station-panel.js
  var revelioRevealed = false;
  function renderStation(panelEl, project) {
    if (!panelEl || !project) return;
    revelioRevealed = false;
    const demoBadge = project.isDemo ? `<span class="stamp-distressed text-[9px] px-2 py-0.5">DEMO CASE FILE</span>` : `<span class="stamp-distressed text-[9px] px-2 py-0.5 text-emerald-700 border-emerald-700">VERIFIED ARCHITECTURE</span>`;
    panelEl.innerHTML = `
    <div class="panel-inner-scroll">
      <!-- Panel Header Bar -->
      <div class="panel-header-bar">
        <div>
          <div class="panel-eyebrow">
            <span>STATION ${project.number} &bull; ${project.category.toUpperCase()}</span>
            ${demoBadge}
          </div>
          <h2 class="panel-station-title">${project.station}</h2>
          <div class="panel-project-sub">${project.title}</div>
        </div>
        <button id="panelReturnBtn" class="btn-panel-return" title="Collapse Panel (Return to Railway)">
          &times;
        </button>
      </div>

      <!-- Station World Accent Stripe -->
      <div class="panel-accent-stripe" style="background: linear-gradient(90deg, ${project.theme.accent}, ${project.theme.lantern});"></div>

      <!-- Main Dossier Content Body -->
      <div class="panel-grid-layout">
        
        <!-- Column 1: The Spell (Problem) & Architecture Steps -->
        <div class="panel-col space-y-5">
          <!-- 1. The Spell -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; THE SPELL // CHALLENGE</div>
            <h3 class="panel-card-heading">${project.spell.heading}</h3>
            <p class="panel-card-body">${project.spell.body}</p>
          </div>

          <!-- 2. The Incantation (Architecture Steps) -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; THE INCANTATION // ARCHITECTURE</div>
            <h3 class="panel-card-heading">${project.incantation.heading}</h3>
            <p class="panel-card-body mb-3">${project.incantation.body}</p>

            <!-- CSS Flow Diagram from Steps -->
            <div class="incantation-flow-steps">
              ${project.incantation.steps.map((step, idx) => `
                <div class="flow-step-item">
                  <div class="flow-step-dot">${idx + 1}</div>
                  <div class="flow-step-text">${step}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 3. Revelio Secret Disclosure Area -->
          <div class="panel-card-box revelio-box" id="revelioSecretBox">
            <div class="flex items-center justify-between mb-2">
              <span class="panel-section-tag">&bull; CLASSIFIED DISCLOSURE</span>
              <button id="btnRevelioToggle" class="btn-spell-action" data-spell="revelio">
                <span class="spell-sparkle">\u2726</span>
                <span>REVELIO</span>
              </button>
            </div>
            <div class="revelio-hidden-text" id="revelioText">
              ${project.reveal}
            </div>
          </div>
        </div>

        <!-- Column 2: Ingredients, Metrics & Mockup Artifact -->
        <div class="panel-col space-y-5">
          <!-- 4. Ingredients (Tech Stack Chips) -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; INGREDIENTS // ARSENAL</div>
            <div class="panel-tech-chips">
              ${project.technologies.map((t) => `<span class="tech-potion-chip">${t}</span>`).join("")}
            </div>
          </div>

          <!-- 5. Metrics Matrix -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; RESULT // QUANTIFIED IMPACT</div>
            <p class="font-sans text-xs text-[var(--text-muted)] mb-3">${project.result.summary}</p>
            <div class="panel-metrics-grid">
              ${project.result.metrics.map((m) => `
                <div class="metric-tile">
                  <div class="metric-value">${m.value}</div>
                  <div class="metric-label">${m.label}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 6. Architectural Artifact Thumbnail -->
          ${project.artifacts && project.artifacts.length > 0 ? `
            <div class="panel-card-box artifact-card-box">
              <div class="panel-section-tag">&bull; ARTIFACT // BLUEPRINT</div>
              <div class="artifact-thumb-wrap" id="panelArtifactWrap" title="Click to inspect in Case Dossier">
                <img 
                  src="${project.artifacts[0].src}" 
                  alt="${project.artifacts[0].alt}" 
                  class="artifact-img" 
                  loading="lazy" 
                  decoding="async"
                  width="600"
                  height="380"
                />
                <div class="artifact-caption">${project.artifacts[0].caption}</div>
              </div>
            </div>
          ` : ""}

        </div>

      </div>

      <!-- Action Footer Toolbar -->
      <div class="panel-footer-toolbar">
        <div class="panel-actions-left">
          <button id="btnAlohomora" class="btn-spell-action" data-spell="alohomora" title="Open Full Forensic Case Dossier">
            <span>ALOHOMORA DOSSIER</span>
            <span class="font-mono text-xs">&nearr;</span>
          </button>
        </div>

        <div class="panel-actions-right">
          ${project.github ? `
            <a href="${project.github}" target="_blank" rel="noopener" class="btn-stamp-link" title="Accio Source Code">
              <span>ACCIO SOURCE</span>
              <span class="font-mono text-xs">&nearr;</span>
            </a>
          ` : `
            <button class="btn-stamp-link opacity-50 cursor-not-allowed" disabled title="Source protected under enterprise proprietary NDA">
              ACCIO SOURCE (PROPRIETARY)
            </button>
          `}

          ${project.demo ? `
            <button id="btnPortkeyDemo" class="btn-ink text-xs" data-demo-url="${project.demo}">
              PORTKEY (LIVE DEMO) &rarr;
            </button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
    bindPanelEvents(panelEl, project);
  }
  function bindPanelEvents(panelEl, project) {
    const returnBtn = document.getElementById("panelReturnBtn");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        panelEl.classList.remove("open");
        playSfx("paper");
      });
    }
    const revelioBtn = document.getElementById("btnRevelioToggle");
    const revelioBox = document.getElementById("revelioSecretBox");
    if (revelioBtn && revelioBox) {
      revelioBtn.addEventListener("click", () => {
        revelioRevealed = !revelioRevealed;
        playSfx("wand");
        if (revelioRevealed) {
          revelioBox.classList.add("revealed");
          showToast("\u2726 Revelio! Hidden engineering parameters revealed.");
        } else {
          revelioBox.classList.remove("revealed");
        }
      });
    }
    const alohomoraBtn = document.getElementById("btnAlohomora");
    const artifactWrap = document.getElementById("panelArtifactWrap");
    const openDossierHandler = () => {
      openDossier(project.id);
    };
    if (alohomoraBtn) alohomoraBtn.addEventListener("click", openDossierHandler);
    if (artifactWrap) artifactWrap.addEventListener("click", openDossierHandler);
    const portkeyBtn = document.getElementById("btnPortkeyDemo");
    if (portkeyBtn) {
      portkeyBtn.addEventListener("click", () => {
        const url = portkeyBtn.getAttribute("data-demo-url");
        if (!url) return;
        playSfx("whistle");
        showToast("\u{1F300} Portkey enchanted! Transporting to live demo...");
        setTimeout(() => {
          if (url.startsWith("#")) {
            const el = document.querySelector(url);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.open(url, "_blank", "noopener");
          }
        }, 400);
      });
    }
  }

  // assets/js/railway/sfx.js
  function playRailwayBell() {
    if (isSoundActive()) playSfx("bell");
  }
  function playGateOpen() {
    if (isSoundActive()) playSfx("door");
  }
  function playStationArrival() {
    if (isSoundActive()) playSfx("arrival");
  }
  function startTrainChug() {
    if (isSoundActive()) startChug();
  }
  function stopTrainChug() {
    stopChug();
  }

  // assets/js/railway/controls.js
  var isTransitioning = false;
  var cleanups7 = [];
  var touchStartX = 0;
  var touchStartY = 0;
  function initControls(onStationChange) {
    const prevBtn = document.getElementById("hudPrevBtn");
    const nextBtn = document.getElementById("hudNextBtn");
    const protegoBtn = document.getElementById("hudProtegoBtn");
    const reboardBtn = document.getElementById("hudReboardBtn");
    const stage = document.getElementById("railwayStage");
    const getVisibleProjects = () => projects.filter((p) => !p.hidden);
    function handleGo(targetIndex, source) {
      const total = getVisibleProjects().length;
      if (store.get("protegoLock") && source !== "protego-override") {
        showToast("\u{1F6E1}\uFE0F Protego Shield active: Station navigation is pinned.");
        return;
      }
      if (isTransitioning) return;
      if (targetIndex < 0 || targetIndex >= total) return;
      goToStation(targetIndex, { source, onStationChange });
    }
    if (prevBtn) {
      const onPrev = () => handleGo(store.get("activeStation") - 1, "hud-prev");
      prevBtn.addEventListener("click", onPrev);
      cleanups7.push(() => prevBtn.removeEventListener("click", onPrev));
    }
    if (nextBtn) {
      const onNext = () => handleGo(store.get("activeStation") + 1, "hud-next");
      nextBtn.addEventListener("click", onNext);
      cleanups7.push(() => nextBtn.removeEventListener("click", onNext));
    }
    if (protegoBtn) {
      const onProtego = () => {
        const current = store.get("protegoLock");
        const next = !current;
        store.set("protegoLock", next);
        protegoBtn.setAttribute("aria-pressed", String(next));
        if (next) {
          protegoBtn.classList.add("active");
          showToast("\u{1F6E1}\uFE0F Protego! Station pinned against accidental movement.");
        } else {
          protegoBtn.classList.remove("active");
          showToast("\u{1F6E1}\uFE0F Protego shield lowered.");
        }
      };
      protegoBtn.addEventListener("click", onProtego);
      cleanups7.push(() => protegoBtn.removeEventListener("click", onProtego));
    }
    if (reboardBtn) {
      const onReboard = () => {
        sessionStorage.removeItem("railway_boarded");
        location.hash = "#work";
        location.reload();
      };
      reboardBtn.addEventListener("click", onReboard);
      cleanups7.push(() => reboardBtn.removeEventListener("click", onReboard));
    }
    const onKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowLeft") {
        handleGo(store.get("activeStation") - 1, "keyboard");
      } else if (e.key === "ArrowRight") {
        handleGo(store.get("activeStation") + 1, "keyboard");
      } else if (e.key === "Home") {
        handleGo(0, "keyboard");
      } else if (e.key === "End") {
        handleGo(getVisibleProjects().length - 1, "keyboard");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    cleanups7.push(() => window.removeEventListener("keydown", onKeyDown));
    if (stage) {
      const onTouchStart = (e) => {
        touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
        touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
      };
      const onTouchEnd = (e) => {
        const touchEndX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const touchEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX < 0) {
            handleGo(store.get("activeStation") + 1, "swipe");
          } else {
            handleGo(store.get("activeStation") - 1, "swipe");
          }
        }
      };
      stage.addEventListener("touchstart", onTouchStart, { passive: true });
      stage.addEventListener("touchend", onTouchEnd, { passive: true });
      cleanups7.push(() => {
        stage.removeEventListener("touchstart", onTouchStart);
        stage.removeEventListener("touchend", onTouchEnd);
      });
    }
    return destroyControls;
  }
  function goToStation(targetIndex, { source = "direct", onStationChange } = {}) {
    const visibleProjects = projects.filter((p) => !p.hidden);
    const total = visibleProjects.length;
    if (targetIndex < 0 || targetIndex >= total) return;
    isTransitioning = true;
    store.set("activeStation", targetIndex);
    const project = visibleProjects[targetIndex];
    const trainAssembly = document.getElementById("trainAssembly");
    const counterEl = document.getElementById("hudCounter");
    const panelEl = document.getElementById("stationPanel");
    const stage = document.getElementById("railwayStage");
    if (counterEl) {
      counterEl.textContent = `0${targetIndex + 1} / 0${total}`;
    }
    updateRouteMapUI(targetIndex);
    if (stage && project.theme) {
      stage.style.setProperty("--station-sky", project.theme.sky);
      stage.style.setProperty("--station-accent", project.theme.accent);
      stage.style.setProperty("--station-lantern", project.theme.lantern);
    }
    startTrainChug();
    if (trainAssembly) {
      trainAssembly.classList.add("wheels-rolling");
      const offsetPercent = -(targetIndex * 18);
      trainAssembly.style.transform = `translate3d(${offsetPercent}%, 0, 0)`;
    }
    const world = document.getElementById("railwayWorld");
    if (world) {
      const worldOffset = -(targetIndex * 45);
      world.style.setProperty("--world-parallax-x", `${worldOffset}px`);
    }
    if (panelEl) {
      panelEl.classList.remove("open");
      setTimeout(() => {
        renderStation(panelEl, project);
        panelEl.classList.add("open");
        playStationArrival();
        stopTrainChug();
        if (trainAssembly) {
          trainAssembly.classList.remove("wheels-rolling");
        }
        isTransitioning = false;
        if (typeof onStationChange === "function") {
          onStationChange(targetIndex, project);
        }
      }, 400);
    } else {
      setTimeout(() => {
        stopTrainChug();
        if (trainAssembly) {
          trainAssembly.classList.remove("wheels-rolling");
        }
        isTransitioning = false;
      }, 450);
    }
  }
  function destroyControls() {
    cleanups7.forEach((fn) => fn());
    cleanups7 = [];
  }

  // assets/js/railway/index.js
  var cleanups8 = [];
  var gsapContext = null;
  function initRailway() {
    const mountEl = document.getElementById("work");
    if (!mountEl) return () => {
    };
    mountEl.innerHTML = createSceneMarkup();
    const boardBtn = document.getElementById("btnBoardRailway");
    const introEl = document.getElementById("railwayIntro");
    const curtainLeft = document.getElementById("curtainGateLeft");
    const curtainRight = document.getElementById("curtainGateRight");
    const panelEl = document.getElementById("stationPanel");
    const visibleProjects = projects.filter((p) => !p.hidden);
    initRouteMap((idx) => {
      goToStation(idx, { source: "route-map" });
    });
    initControls((idx, proj) => {
    });
    const hasBoarded = sessionStorage.getItem("railway_boarded") === "true";
    function triggerBoardingSequence() {
      sessionStorage.setItem("railway_boarded", "true");
      playRailwayBell();
      playGateOpen();
      if (introEl) {
        introEl.classList.add("departing");
      }
      if (curtainLeft && curtainRight) {
        curtainLeft.style.transform = "translate3d(-100%, 0, 0)";
        curtainRight.style.transform = "translate3d(100%, 0, 0)";
      }
      setTimeout(() => {
        if (introEl) introEl.style.display = "none";
        goToStation(0, { source: "boarding" });
      }, prefersReducedMotion ? 100 : 700);
    }
    if (boardBtn) {
      boardBtn.addEventListener("click", triggerBoardingSequence);
      cleanups8.push(() => boardBtn.removeEventListener("click", triggerBoardingSequence));
    }
    const onKey = (e) => {
      if (introEl && introEl.style.display !== "none" && !hasBoarded) {
        if (e.key === " " || e.key === "Enter") {
          const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
          if (activeTag !== "input" && activeTag !== "textarea") {
            e.preventDefault();
            triggerBoardingSequence();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    cleanups8.push(() => window.removeEventListener("keydown", onKey));
    if (hasBoarded) {
      if (introEl) introEl.style.display = "none";
      if (curtainLeft) curtainLeft.style.transform = "translate3d(-100%, 0, 0)";
      if (curtainRight) curtainRight.style.transform = "translate3d(100%, 0, 0)";
      goToStation(0, { source: "session-resume" });
    }
    if (typeof window !== "undefined" && window.gsap && window.ScrollTrigger) {
      try {
        window.gsap.registerPlugin(window.ScrollTrigger);
        gsapContext = window.gsap.context(() => {
          window.ScrollTrigger.create({
            trigger: mountEl,
            start: "top top",
            end: "+=150%",
            pin: true,
            pinSpacing: true,
            anticipatePin: 1
          });
        }, mountEl);
      } catch (err) {
        console.warn("[Railway] GSAP Pinning fallback to CSS:", err);
      }
    }
    return destroyRailway;
  }
  function destroyRailway() {
    if (gsapContext) {
      gsapContext.revert();
      gsapContext = null;
    }
    cleanups8.forEach((fn) => fn());
    cleanups8 = [];
  }

  // assets/js/components/articles.js
  var cleanups9 = [];
  var currentCategory = "all";
  function initArticles() {
    const filterBtns = document.querySelectorAll(".filter-tab-btn");
    renderArticles("all");
    filterBtns.forEach((btn) => {
      const handler = () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.getAttribute("data-category") || "all";
        currentCategory = cat;
        renderArticles(cat);
      };
      btn.addEventListener("click", handler);
      cleanups9.push(() => btn.removeEventListener("click", handler));
    });
    return destroyArticles;
  }
  function destroyArticles() {
    cleanups9.forEach((fn) => fn());
    cleanups9 = [];
  }
  function renderArticles(categoryKey = "all") {
    const container = document.getElementById("articlesGrid");
    if (!container) return;
    const visibleProjects = projects.filter((p) => !p.hidden);
    const filtered = categoryKey === "all" ? visibleProjects : visibleProjects.filter((p) => p.categoryKey === categoryKey || categoryKey === "cloud" && p.categoryKey === "fullstack");
    if (filtered.length === 0) {
      container.innerHTML = `
      <div class="col-span-full py-12 px-6 text-center border-2 border-dashed border-[var(--border-divider)] bg-[var(--bg-parchment-light)]">
        <div class="stamp-distressed text-xs inline-block mb-3">ARCHIVE EMPTY</div>
        <h4 class="font-serif text-xl font-bold text-[var(--text-ink)] mb-2">No Case Files Detected in this Sector</h4>
        <p class="font-sans text-xs text-[var(--text-muted)] max-w-md mx-auto mb-4">
          The records for this sector appear vanished or occluded. Cast <strong>REPARO</strong> to restore all dispatch records.
        </p>
        <button id="reparoResetBtn" class="btn-ink text-xs">CAST REPARO &crarr;</button>
      </div>
    `;
      const resetBtn = document.getElementById("reparoResetBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          const allBtn = document.querySelector('.filter-tab-btn[data-category="all"]');
          if (allBtn) allBtn.click();
        });
      }
      return;
    }
    container.innerHTML = filtered.map((item) => {
      const isChart = item.id === "devops-forge";
      const demoBadge = item.isDemo ? `<span class="stamp-distressed text-[9px] px-1.5 py-0.5 ml-2">DEMO CASE FILE</span>` : "";
      const dropCap = item.title.charAt(0);
      return `
      <article class="sub-article-card" data-category="${item.categoryKey}">
        <div>
          <div class="flex items-center justify-between flex-wrap gap-1 mb-1">
            <span class="article-category-tag">STN ${item.number} &bull; ${item.category.toUpperCase()}</span>
            ${demoBadge}
          </div>
          <h3 class="article-headline">${item.title}</h3>

          ${isChart ? `
            <div class="prophet-chart-box">
              <div class="chart-header-row">
                <span>JENKINS CI/CD SHARDING</span>
                <span class="text-[#9e1d1d] font-bold">-75% TIME</span>
              </div>
              <svg viewBox="0 0 200 70" class="chart-svg">
                <line x1="10" y1="10" x2="190" y2="10" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                <line x1="10" y1="35" x2="190" y2="35" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                <line x1="10" y1="60" x2="190" y2="60" stroke="var(--border-ink)" stroke-width="1"/>
                <polyline points="15,12 50,18 90,28 130,52 185,55" fill="none" stroke="var(--stamp-red)" stroke-width="2.5"/>
                <circle cx="15" cy="12" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Legacy: 120 Minutes"/>
                <circle cx="185" cy="55" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Optimized: 30 Minutes (-75%)"/>
                <text x="15" y="24" font-family="Space Mono" font-size="7" fill="var(--text-ink)">120m</text>
                <text x="155" y="50" font-family="Space Mono" font-size="7" fill="var(--stamp-red)" font-weight="bold">30m</text>
              </svg>
            </div>
          ` : ""}

          <div class="linotype-column mb-4">
            <span class="ornate-drop-box">${dropCap}</span>
            ${item.summary}
          </div>
        </div>

        <div>
          <div class="article-tags-wrap">
            ${item.technologies.slice(0, 4).map((tech) => `<span class="stamp-badge">${tech}</span>`).join("")}
          </div>
          <div class="article-footer-row">
            <span class="font-mono text-xs text-[#766953]">STATION ${item.number}</span>
            <button class="btn-stamp-link" data-dossier-id="${item.id}" aria-label="Open case file for ${item.title}">OPEN CASE FILE &rarr;</button>
          </div>
        </div>
      </article>
    `;
    }).join("");
    container.querySelectorAll(".btn-stamp-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const caseId = btn.getAttribute("data-dossier-id");
        if (caseId) openDossier(caseId);
      });
    });
    initChartTooltips();
  }
  function initChartTooltips() {
    const points = document.querySelectorAll(".chart-point");
    let tooltip = document.querySelector(".chart-tooltip");
    if (!tooltip && points.length > 0) {
      tooltip = document.createElement("div");
      tooltip.className = "chart-tooltip";
      document.body.appendChild(tooltip);
    }
    points.forEach((point) => {
      point.addEventListener("mouseenter", () => {
        const text = point.getAttribute("data-tooltip");
        if (!text || !tooltip) return;
        tooltip.textContent = text;
        tooltip.style.opacity = "1";
        const rect = point.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX - 20}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
      });
      point.addEventListener("mouseleave", () => {
        if (tooltip) tooltip.style.opacity = "0";
      });
    });
  }

  // assets/js/data/skills.js
  var skillCategories = Object.freeze([
    { id: "all", label: "All Substances" },
    { id: "backend", label: "Backend" },
    { id: "frontend", label: "Frontend" },
    { id: "database", label: "Databases" },
    { id: "security", label: "Security" },
    { id: "devops", label: "DevOps" },
    { id: "cloud", label: "Cloud" },
    { id: "aiml", label: "AI/ML" }
  ]);
  var rawSkills = [
    {
      id: "java-spring",
      name: "Java 17 & Spring Boot 3",
      code: "SPRG",
      category: "backend",
      categoryLabel: "Backend",
      level: 95,
      levelType: "primary",
      detected: "Most days",
      finding: "PRIMARY TOOL",
      potionLabel: "Draught of Concurrency",
      bottleType: "tall-flask",
      color: "#d4af37",
      description: "Enterprise backend microservices, Finacle core, transactional banking workflows, multithreading & Spring Data JPA."
    },
    {
      id: "ts-nest",
      name: "TypeScript & NestJS",
      code: "NEST",
      category: "backend",
      categoryLabel: "Backend",
      level: 90,
      levelType: "primary",
      detected: "Most days",
      finding: "PRIMARY TOOL",
      potionLabel: "Elixir of Type-Safety",
      bottleType: "round-flask",
      color: "#38bdf8",
      description: "High-throughput modular API engines, dependency injection, Prisma ORM, and scalable microservices."
    },
    {
      id: "angular-react",
      name: "Angular & React",
      code: "UI",
      category: "frontend",
      categoryLabel: "Frontend",
      level: 85,
      levelType: "comfortable",
      detected: "Full-stack UI",
      finding: "COMFORTABLE",
      potionLabel: "Philter of Modern UI",
      bottleType: "conical-flask",
      color: "#f43f5e",
      description: "Component architecture, responsive state management, client dashboards, and Tailwind CSS design systems."
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      code: "PG",
      category: "database",
      categoryLabel: "Databases",
      level: 92,
      levelType: "primary",
      detected: "In projects",
      finding: "PRIMARY TOOL",
      potionLabel: "Essence of ACID Relational",
      bottleType: "square-jar",
      color: "#3b82f6",
      description: "Relational data modeling, ACID transactions, complex query tuning, indexing, and connection pooling."
    },
    {
      id: "oracle",
      name: "Oracle DB & PL/SQL",
      code: "ORA",
      category: "database",
      categoryLabel: "Databases",
      level: 90,
      levelType: "primary",
      detected: "Enterprise core",
      finding: "PRIMARY TOOL",
      potionLabel: "Extract of Enterprise Ledgers",
      bottleType: "tall-flask",
      color: "#ea580c",
      description: "Finacle enterprise core storage, stored procedures, triggers, high-volume transactional schemas."
    },
    {
      id: "prisma-mongo",
      name: "Prisma ORM & MongoDB",
      code: "PRIS",
      category: "database",
      categoryLabel: "Databases",
      level: 85,
      levelType: "comfortable",
      detected: "In projects",
      finding: "COMFORTABLE",
      potionLabel: "Tincture of Data Schema",
      bottleType: "round-flask",
      color: "#10b981",
      description: "Automated migrations, type-safe query generation, NoSQL document storage, flexible data access."
    },
    {
      id: "auth-rbac",
      name: "OAuth2, JWT & SSO (RBAC)",
      code: "AUTH",
      category: "security",
      categoryLabel: "Security",
      level: 92,
      levelType: "primary",
      detected: "Financial systems",
      finding: "PRIMARY TOOL",
      potionLabel: "Serum of Zero-Trust",
      bottleType: "dropper-vial",
      color: "#a855f7",
      description: "Zero-trust authorization matrices, token rotation, cryptographic validation, and maker-checker audit guardrails."
    },
    {
      id: "docker-k8s",
      name: "Docker & Containerization",
      code: "DCKR",
      category: "devops",
      categoryLabel: "DevOps",
      level: 88,
      levelType: "comfortable",
      detected: "When needed",
      finding: "COMFORTABLE",
      potionLabel: "Solution of Portability",
      bottleType: "square-jar",
      color: "#06b6d4",
      description: "Multi-stage Docker builds, image layer caching, local orchestration, containerized microservice clusters."
    },
    {
      id: "jenkins-cicd",
      name: "Jenkins CI/CD Automation",
      code: "JNKS",
      category: "devops",
      categoryLabel: "DevOps",
      level: 88,
      levelType: "comfortable",
      detected: "Pipeline optimization",
      finding: "COMFORTABLE",
      potionLabel: "Draft of Speed & Sharding",
      bottleType: "tall-flask",
      color: "#f97316",
      description: "Automated test runner sharding, Docker layer caching, linting gates, 75% pipeline speed acceleration."
    },
    {
      id: "cloud-oci",
      name: "AWS & Oracle Cloud (OCI)",
      code: "CLD",
      category: "cloud",
      categoryLabel: "Cloud",
      level: 80,
      levelType: "training",
      detected: "Amplify \u2022 S3 \u2022 OCI",
      finding: "IN TRAINING",
      potionLabel: "Tonic of High Availability",
      bottleType: "conical-flask",
      color: "#eab308",
      description: "Object storage, serverless lambdas, cloud compute instances, and infrastructure provisioning."
    },
    {
      id: "python-ml",
      name: "Python & ML Models",
      code: "PY",
      category: "aiml",
      categoryLabel: "AI/ML",
      level: 85,
      levelType: "comfortable",
      detected: "Research & scripts",
      finding: "COMFORTABLE",
      potionLabel: "Compound of Kinematic Vision",
      bottleType: "round-flask",
      color: "#059669",
      description: "Computer vision, OpenCV, gait kinematic analysis, automated data ingestion and scripting."
    }
  ];
  var skills = Object.freeze(rawSkills.map((s) => Object.freeze({ ...s })));

  // assets/js/components/lab-report.js
  var cleanups10 = [];
  var currentCategory2 = "all";
  var searchQuery = "";
  function initLabReport() {
    const searchInput = document.getElementById("skillSearchInput");
    const pillBtns = document.querySelectorAll(".lab-pill-btn");
    renderLabReport();
    if (searchInput) {
      const onSearch = (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderLabReport();
      };
      searchInput.addEventListener("input", onSearch);
      cleanups10.push(() => searchInput.removeEventListener("input", onSearch));
    }
    pillBtns.forEach((btn) => {
      const onPill = () => {
        pillBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory2 = btn.getAttribute("data-category") || "all";
        renderLabReport();
      };
      btn.addEventListener("click", onPill);
      cleanups10.push(() => btn.removeEventListener("click", onPill));
    });
    return destroyLabReport;
  }
  function destroyLabReport() {
    cleanups10.forEach((fn) => fn());
    cleanups10 = [];
  }
  function renderLabReport() {
    const tableBody = document.getElementById("forensicsTableBody");
    const mobileCardsContainer = document.getElementById("forensicsMobileCards");
    const countBadge = document.getElementById("skillCountBadge");
    const stackSection = document.getElementById("stack");
    const filtered = skills.filter((skill) => {
      const matchesCat = currentCategory2 === "all" || skill.category === currentCategory2 || currentCategory2 === "devops" && skill.category === "cloud" || currentCategory2 === "ui" && skill.category === "frontend";
      const matchesSearch = !searchQuery || skill.name.toLowerCase().includes(searchQuery) || skill.code.toLowerCase().includes(searchQuery) || skill.description.toLowerCase().includes(searchQuery) || skill.potionLabel.toLowerCase().includes(searchQuery);
      return matchesCat && matchesSearch;
    });
    if (countBadge) {
      countBadge.textContent = `${filtered.length} SUBSTANCES DETECTED`;
    }
    renderPotionCabinet(stackSection, filtered);
    if (tableBody) {
      if (filtered.length === 0) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8 font-mono text-xs text-[#766953]">
            NO SUBSTANCES DETECTED MATCHING QUERY &bull; 
            <button id="obliviateClearBtn" class="underline text-[var(--stamp-red)] font-bold ml-1">CAST OBLIVIATE TO CLEAR</button>
          </td>
        </tr>
      `;
        const obliviateBtn = document.getElementById("obliviateClearBtn");
        if (obliviateBtn) {
          obliviateBtn.addEventListener("click", () => {
            const input = document.getElementById("skillSearchInput");
            if (input) {
              input.value = "";
              searchQuery = "";
              renderLabReport();
            }
          });
        }
      } else {
        tableBody.innerHTML = filtered.map((skill) => {
          const badgeClass = skill.levelType === "primary" ? "stamp-red-box" : "stamp-black-box";
          return `
          <tr>
            <td class="font-serif text-base sm:text-lg text-[var(--text-ink)] font-bold">
              ${skill.name}
              <div class="font-sans text-xs text-[var(--text-muted)] font-normal mt-0.5">
                ${skill.description}
                <span class="font-mono text-[10px] text-[var(--stamp-red)] ml-1.5 italic font-bold">(${skill.potionLabel})</span>
              </div>
            </td>
            <td class="font-mono text-xs text-[var(--text-muted)]">${skill.code}</td>
            <td class="font-mono text-xs text-[var(--text-muted)]">${skill.detected}</td>
            <td class="text-right"><span class="${badgeClass}">${skill.finding}</span></td>
          </tr>
        `;
        }).join("");
      }
    }
    if (mobileCardsContainer) {
      if (filtered.length === 0) {
        mobileCardsContainer.innerHTML = `
        <div class="text-center py-6 font-mono text-xs text-[#766953] border border-dashed border-[#b09e75]">
          NO SUBSTANCES DETECTED MATCHING QUERY
        </div>
      `;
      } else {
        mobileCardsContainer.innerHTML = filtered.map((skill) => {
          const badgeClass = skill.levelType === "primary" ? "stamp-red-box" : "stamp-black-box";
          return `
          <div class="forensics-mobile-card">
            <div class="forensics-card-top">
              <span class="font-mono text-xs font-bold text-[var(--text-muted)]">${skill.code} // ${skill.categoryLabel}</span>
              <span class="${badgeClass}">${skill.finding}</span>
            </div>
            <h4 class="font-serif text-lg font-bold text-[var(--text-ink)]">${skill.name}</h4>
            <p class="font-sans text-xs text-[var(--text-muted)]">${skill.description}</p>
            <div class="flex items-center justify-between pt-1 font-mono text-[10px] text-[#766953]">
              <span>Detected: <strong>${skill.detected}</strong></span>
              <span class="italic text-[var(--stamp-red)]">${skill.potionLabel}</span>
            </div>
          </div>
        `;
        }).join("");
      }
    }
  }
  function renderPotionCabinet(stackSection, filteredSkills) {
    if (!stackSection) return;
    let cabinet = document.getElementById("potionCabinet");
    if (!cabinet) {
      cabinet = document.createElement("div");
      cabinet.id = "potionCabinet";
      cabinet.className = "potion-cabinet mb-8";
      const tableContainer = stackSection.querySelector(".forensics-table-container");
      if (tableContainer) {
        tableContainer.parentNode.insertBefore(cabinet, tableContainer);
      } else {
        stackSection.appendChild(cabinet);
      }
    }
    const shelfCategories = [
      { id: "backend", label: "Backend Core" },
      { id: "frontend", label: "Frontend UI" },
      { id: "database", label: "Databases & Relational" },
      { id: "security", label: "Security & Auth" },
      { id: "devops", label: "DevOps & Infrastructure" },
      { id: "cloud", label: "Cloud Systems" },
      { id: "aiml", label: "AI & Research" }
    ];
    const populatedShelves = shelfCategories.map((shelf) => {
      const shelfItems = filteredSkills.filter((s) => s.category === shelf.id);
      if (shelfItems.length === 0) return "";
      return `
      <div class="potion-shelf">
        <span class="shelf-label">${shelf.label}</span>
        <div class="shelf-bottles-row">
          ${shelfItems.map((skill) => renderPotionBottle(skill)).join("")}
        </div>
      </div>
    `;
    }).filter(Boolean).join("");
    cabinet.innerHTML = `
    <div class="cabinet-header">
      <div>
        <span class="font-mono text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">THE APOTHECARY</span>
        <h3 class="cabinet-title">Potion Cabinet of Technical Mastery</h3>
      </div>
      <div class="font-mono text-xs text-[#b09e75]">Hover or tap phials for Revelio disclosure</div>
    </div>
    <div class="cabinet-shelves-grid">
      ${populatedShelves || '<div class="text-center py-6 font-mono text-xs text-[#b09e75]">No potions currently brewed for this query.</div>'}
    </div>
  `;
    cabinet.querySelectorAll(".potion-bottle").forEach((bottle) => {
      bottle.addEventListener("click", () => playSfx("wand"));
    });
  }
  function renderPotionBottle(skill) {
    const liquidFillY = 80 - skill.level * 0.55;
    return `
    <div class="potion-bottle" tabindex="0" role="button" aria-label="${skill.name}: ${skill.potionLabel}">
      <!-- Floating Revelio Card -->
      <div class="potion-revelio-card">
        <div class="revelio-card-title">${skill.name}</div>
        <div class="font-mono text-[9px] text-[var(--stamp-red)] font-bold mb-1">${skill.potionLabel}</div>
        <p class="revelio-card-desc">${skill.description}</p>
        <div class="revelio-card-footer">
          <span>Potency: <strong>${skill.level}%</strong></span>
          <span class="text-[var(--stamp-red)] font-bold">${skill.finding}</span>
        </div>
      </div>

      <!-- SVG Phial with Dynamic Liquid Level -->
      <svg class="potion-phial-svg" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="liquidGrad-${skill.id}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${skill.color}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${skill.color}" stop-opacity="0.6"/>
          </linearGradient>
          <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
            <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/>
          </linearGradient>
        </defs>

        <!-- Wooden Cork Stopper -->
        <polygon points="24,4 36,4 34,14 26,14" fill="#8c5828" stroke="#4a280c" stroke-width="1"/>
        <line x1="25" y1="8" x2="35" y2="8" stroke="#4a280c" stroke-width="0.75"/>

        <!-- Glass Bottle Body Outline & Liquid Fill -->
        <g>
          <!-- Bottle Neck & Shoulder -->
          <path d="M25,14 L35,14 L35,26 C48,32 52,48 52,65 C52,78 44,84 30,84 C16,84 8,78 8,65 C8,48 12,32 25,26 Z" 
                fill="#14100c" 
                stroke="#d4af37" 
                stroke-width="1.5"/>

          <!-- Dynamic Colored Liquid Level -->
          <clipPath id="bottleClip-${skill.id}">
            <path d="M25,14 L35,14 L35,26 C48,32 52,48 52,65 C52,78 44,84 30,84 C16,84 8,78 8,65 C8,48 12,32 25,26 Z"/>
          </clipPath>
          <rect x="0" y="${liquidFillY.toFixed(1)}" width="60" height="90" fill="url(#liquidGrad-${skill.id})" clip-path="url(#bottleClip-${skill.id})"/>

          <!-- Glass Sheen Overlay -->
          <path d="M12,45 C12,35 18,28 26,26 L26,16" stroke="url(#glassReflection)" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>

      <span class="potion-bottle-name">${skill.code}</span>
      <span class="potion-bottle-label">${skill.level}%</span>
    </div>
  `;
  }

  // assets/js/data/experience.js
  var rawExperience = [
    {
      id: "edgeverve",
      period: "Aug 2025 \u2014 Now",
      role: "Software Engineer",
      company: "EDGEVERVE SYSTEMS (INFOSYS)",
      location: "Bangalore, India",
      description: "Observed daily, building enterprise banking platform engines \u2014 limits, collaterals, covenants, and maker-checker approval workflows. Resolving 79 mission-critical production defects and delivering 40+ client-ready features across core banking services.",
      badges: ["Java 17", "Spring Boot 3", "Oracle PL/SQL", "Finacle FNPR"],
      details: [
        "Core contributor to Finacle Credit Limits, Collaterals, and Covenant compliance engines.",
        "Engineered configurable maker-checker dual-authorization approval pipelines preventing unauthorized mutations.",
        "Identified, debugged, and resolved 79 production defects in live Tier-1 banking systems.",
        "Architected high-throughput relational SQL routines and Oracle PL/SQL triggers for transaction ledgers."
      ]
    },
    {
      id: "eventgo",
      period: "2024 \u2014 2025",
      role: "Backend Architect",
      company: "EVENTGO PLATFORM",
      location: "Remote",
      description: "Designed high-throughput NestJS marketplace architecture with Prisma ORM and PostgreSQL. Shipped 25 REST APIs, automated Swagger documentation, role-based JWT authentication, and webhook payment integrations.",
      badges: ["NestJS", "TypeScript", "Prisma ORM", "PostgreSQL"],
      details: [
        "Architected 6+ relational schemas with automated Prisma ORM migrations.",
        "Built 25 RESTful endpoints with OpenAPI/Swagger specifications and comprehensive validation.",
        "Secured routes with JWT token rotation and role-based access control (RBAC).",
        "Configured automated transactional webhook listeners for Stripe payment reconciliation."
      ]
    },
    {
      id: "ijrpr",
      period: "2024 \u2014 2025",
      role: "Published Researcher",
      company: "IJRPR JOURNAL (RESEARCH)",
      location: "Peer-Reviewed Publication",
      description: 'Authored peer-reviewed research paper titled "Gait Analysis of Human Behaviour" in the International Journal of Research Publication and Reviews (IJRPR), developing non-intrusive vision and accelerometer gait tracking models.',
      badges: ["Python", "Computer Vision", "OpenCV"],
      details: [
        "Formulated vision extraction algorithms using OpenCV to map body joint trajectories.",
        "Published findings in International Journal of Research Publication and Reviews (IJRPR), 2025.",
        "Eliminated reliance on intrusive physical accelerometer sensors with video modeling.",
        "Demonstrated robust kinematic pattern classification across varying illumination conditions."
      ]
    },
    {
      id: "dsatm",
      period: "2021 \u2014 2025",
      role: "B.E. Computer Science",
      company: "DAYANANDA SAGAR ACADEMY (DSATM)",
      location: "Bangalore, India",
      description: "First recorded appearance. Led intern teams of 8 developers, earned Runner-Up in Enterprise Products Hackathon, 2nd Runner-Up in Hackzion National Level Hackathon, and contributed to open source repositories.",
      badges: ["Algorithms", "Distributed Systems", "Hackathons"],
      details: [
        "Graduated with Distinction in Computer Science & Engineering.",
        "Led and mentored an engineering team of 8 developers during intensive hackathons.",
        "Secured Runner-Up at Enterprise Products Hackathon & 2nd Runner-Up at Hackzion.",
        "Contributed actively to open source software repositories across Hacktoberfest 2023\u20132025."
      ]
    }
  ];
  var experience = Object.freeze(rawExperience.map((item) => Object.freeze({
    ...item,
    badges: Object.freeze([...item.badges]),
    details: Object.freeze([...item.details])
  })));

  // assets/js/components/ledger.js
  var cleanups11 = [];
  function initLedger() {
    const container = document.querySelector(".ledger-timeline");
    if (!container) return () => {
    };
    container.innerHTML = experience.map((item, idx) => `
    <article class="ledger-row" data-ledger-id="${item.id}">
      <div class="ledger-period">
        <span>${item.period}</span>
      </div>
      <div class="ledger-role-box">
        <h3 class="ledger-role-title">${item.role}</h3>
        <div class="ledger-company">${item.company}</div>
        <div class="font-mono text-[10px] text-[var(--text-muted)]">${item.location}</div>
      </div>
      <div>
        <p class="ledger-desc">
          ${item.description}
        </p>
        <div class="ledger-badge-list">
          ${item.badges.map((b) => `<span class="stamp-badge">${b}</span>`).join("")}
        </div>
        <button class="ledger-expand-btn mt-3 text-xs font-mono font-bold text-[var(--stamp-red)] hover:underline flex items-center gap-1.5" aria-expanded="false" aria-controls="ledger-detail-${item.id}">
          <span>[+] EXPAND FORENSIC DOSSIER</span>
        </button>
        <div id="ledger-detail-${item.id}" class="ledger-expandable-content" aria-hidden="true">
          <div class="ledger-expandable-inner">
            <ul class="space-y-1.5 text-xs font-sans text-[var(--text-ink)] list-disc list-inside">
              ${item.details.map((d) => `<li>${d}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    </article>
  `).join("");
    const expandBtns = container.querySelectorAll(".ledger-expand-btn");
    expandBtns.forEach((btn) => {
      const handler = () => {
        const isExpanded = btn.getAttribute("aria-expanded") === "true";
        const detailId = btn.getAttribute("aria-controls");
        const detailEl = document.getElementById(detailId);
        const span = btn.querySelector("span");
        if (!detailEl) return;
        if (isExpanded) {
          btn.setAttribute("aria-expanded", "false");
          detailEl.classList.remove("open");
          detailEl.setAttribute("aria-hidden", "true");
          if (span) span.textContent = "[+] EXPAND FORENSIC DOSSIER";
        } else {
          btn.setAttribute("aria-expanded", "true");
          detailEl.classList.add("open");
          detailEl.setAttribute("aria-hidden", "false");
          if (span) span.textContent = "[-] COLLAPSE FORENSIC DOSSIER";
        }
      };
      btn.addEventListener("click", handler);
      cleanups11.push(() => btn.removeEventListener("click", handler));
    });
    return destroyLedger;
  }
  function destroyLedger() {
    cleanups11.forEach((fn) => fn());
    cleanups11 = [];
  }

  // assets/js/components/owl.js
  var activeSparkleInterval = null;
  function initOwl() {
    let overlay = document.getElementById("owlFlightOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "owlFlightOverlay";
      overlay.className = "owl-flight-overlay";
      document.body.appendChild(overlay);
    }
    return destroyOwl;
  }
  function destroyOwl() {
    if (activeSparkleInterval) {
      clearInterval(activeSparkleInterval);
      activeSparkleInterval = null;
    }
    const overlay = document.getElementById("owlFlightOverlay");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.innerHTML = "";
    }
  }
  function triggerFlyingOwl(onComplete) {
    const overlay = document.getElementById("owlFlightOverlay") || document.body;
    overlay.classList.add("active");
    overlay.innerHTML = "";
    const owlWrapper = document.createElement("div");
    owlWrapper.className = "flying-owl-wrapper";
    owlWrapper.innerHTML = `
    <svg class="owl-body-svg" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="owl-left-wing">
        <path d="M65 45 C45 20, 10 15, 2 30 C0 45, 20 65, 55 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
        <path d="M25 32 Q35 40 45 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M15 40 Q30 50 40 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      </g>
      <g class="owl-right-wing">
        <path d="M105 45 C125 20, 160 15, 168 30 C170 45, 150 65, 115 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
        <path d="M145 32 Q135 40 125 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M155 40 Q140 50 130 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      </g>
      <path d="M85 95 L78 115 L85 110 L92 115 Z" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
      <ellipse cx="85" cy="65" rx="26" ry="32" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
      <path d="M75 60 Q85 64 95 60" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M72 72 Q85 76 98 72" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M76 84 Q85 88 94 84" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="85" cy="38" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
      <circle cx="77" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="77" cy="36" r="3" fill="#0f172a"/>
      <circle cx="76" cy="34" r="1" fill="#ffffff"/>
      <circle cx="93" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="93" cy="36" r="3" fill="#0f172a"/>
      <circle cx="92" cy="34" r="1" fill="#ffffff"/>
      <polygon points="85,38 81,46 89,46" fill="#d97706" stroke="#1e293b" stroke-width="1"/>
      <path d="M78 95 Q76 102 80 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M92 95 Q94 102 90 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <div class="owl-letter-envelope">
      <div class="owl-wax-seal">RB</div>
    </div>
  `;
    overlay.appendChild(owlWrapper);
    playSfx("wand");
    if (!prefersReducedMotion) {
      activeSparkleInterval = setInterval(() => {
        const rect = owlWrapper.getBoundingClientRect();
        if (rect.right > 0 && rect.left < window.innerWidth) {
          createOwlSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, overlay);
        }
      }, 80);
    }
    const duration = prefersReducedMotion ? 400 : 3300;
    setTimeout(() => {
      if (activeSparkleInterval) {
        clearInterval(activeSparkleInterval);
        activeSparkleInterval = null;
      }
      overlay.classList.remove("active");
      overlay.innerHTML = "";
      if (onComplete) onComplete();
    }, duration);
  }
  function createOwlSparkle(x, y, parent) {
    const sparkle = document.createElement("div");
    sparkle.className = "owl-sparkle-trail";
    const ox = (Math.random() - 0.5) * 40 - 20;
    const oy = (Math.random() - 0.5) * 40 + 20;
    sparkle.style.setProperty("--ox", `${ox}px`);
    sparkle.style.setProperty("--oy", `${oy}px`);
    sparkle.style.left = `${x + (Math.random() - 0.5) * 20}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 20}px`;
    parent.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 900);
  }

  // assets/js/components/contact.js
  var cleanups12 = [];
  function initContact() {
    initFormValidation();
    initCopyButtons();
    initCharCounter();
    return destroyContact;
  }
  function destroyContact() {
    cleanups12.forEach((fn) => fn());
    cleanups12 = [];
  }
  function initCharCounter() {
    const storyInput = document.getElementById("formStory");
    const counterEl = document.getElementById("charCount");
    if (storyInput && counterEl) {
      const onInput = () => {
        counterEl.textContent = `${storyInput.value.length} / 1000 characters`;
      };
      storyInput.addEventListener("input", onInput);
      cleanups12.push(() => storyInput.removeEventListener("input", onInput));
    }
  }
  function initFormValidation() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const onSubmit = async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("formName");
      const emailInput = document.getElementById("formEmail");
      const subjectInput = document.getElementById("formSubject");
      const storyInput = document.getElementById("formStory");
      const submitBtn = form.querySelector('button[type="submit"]');
      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const subject = subjectInput ? subjectInput.value.trim() : "";
      const story = storyInput ? storyInput.value.trim() : "";
      if (!name || !email || !subject || !story) {
        showToast("\u26A0\uFE0F Please complete all parchment fields before dispatching the owl.");
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "DISPATCHING OWL...";
      }
      showToast("\u{1F989} The snowy owl takes wing carrying your missive...");
      try {
        const response = await fetch("https://formspree.io/f/mvkozeqz", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, subject, message: story })
        });
        if (!response.ok) {
          throw new Error(`Dispatch returned status: ${response.status}`);
        }
        triggerFlyingOwl(() => {
          renderSuccessCard(form, name, email);
          showToast("\u2709\uFE0F Missive safely delivered to Rishi\u2019s desk!");
        });
      } catch (err) {
        console.warn("[contact] Formspree dispatch failed, preserving user input:", err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "SEND THE OWL \u2192";
        }
        showToast("\u26A0\uFE0F The owl encountered turbulent winds. Please email directly to bhardvajrishi@gmail.com");
      }
    };
    form.addEventListener("submit", onSubmit);
    cleanups12.push(() => form.removeEventListener("submit", onSubmit));
  }
  function renderSuccessCard(form, name, email) {
    form.innerHTML = "";
    const card = document.createElement("div");
    card.className = "p-6 border-2 border-[var(--border-ink)] bg-[var(--bg-parchment-light)] text-center space-y-3";
    const stamp = document.createElement("div");
    stamp.className = "stamp-distressed text-xs";
    stamp.textContent = "DISPATCH CONFIRMED";
    const heading = document.createElement("h4");
    heading.className = "font-serif text-2xl font-bold text-[var(--text-ink)]";
    heading.textContent = "Owl Delivered Successfully";
    const message = document.createElement("p");
    message.className = "font-sans text-sm text-[var(--text-muted)] leading-relaxed";
    const text1 = document.createTextNode("Thank you, ");
    const strongName = document.createElement("strong");
    strongName.textContent = name;
    const text2 = document.createTextNode("! Your dispatch has reached Rishi\u2019s engineering desk. A reply will be dispatched to ");
    const strongEmail = document.createElement("strong");
    strongEmail.textContent = email;
    const text3 = document.createTextNode(" usually within 24 hours.");
    message.appendChild(text1);
    message.appendChild(strongName);
    message.appendChild(text2);
    message.appendChild(strongEmail);
    message.appendChild(text3);
    const btnWrap = document.createElement("div");
    btnWrap.className = "pt-2";
    const resetBtn = document.createElement("button");
    resetBtn.className = "btn-ink text-xs";
    resetBtn.textContent = "SEND ANOTHER LETTER \u2192";
    resetBtn.addEventListener("click", () => location.reload());
    btnWrap.appendChild(resetBtn);
    card.appendChild(stamp);
    card.appendChild(heading);
    card.appendChild(message);
    card.appendChild(btnWrap);
    form.appendChild(card);
  }
  function initCopyButtons() {
    const copyBtns = document.querySelectorAll("[data-copy]");
    copyBtns.forEach((btn) => {
      const onCopy = (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute("data-copy");
        if (!textToCopy) return;
        playSfx("click");
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`\u{1F4CB} Copied "${textToCopy}" to clipboard!`);
        }).catch(() => {
          showToast(`\u{1F4CB} ${textToCopy}`);
        });
      };
      btn.addEventListener("click", onCopy);
      cleanups12.push(() => btn.removeEventListener("click", onCopy));
    });
  }

  // assets/js/components/broom.js
  var rafId = null;
  var cleanups13 = [];
  function initBroom() {
    let track = document.getElementById("flyingBroomTrack");
    if (!track) {
      track = document.createElement("div");
      track.id = "flyingBroomTrack";
      track.className = "flying-broom-track";
      track.innerHTML = `
      <div class="broom-guide-line"></div>
      <div id="flyingBroom" class="flying-broom-container" title="Nimbus 2000 &bull; Scroll Tracker">
        <svg class="flying-broom-svg" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2 C20 2, 19 20, 19.5 40" stroke="#5c3818" stroke-width="3" stroke-linecap="round"/>
          <path d="M20 2 C20 2, 21 20, 20.5 40" stroke="#36200c" stroke-width="1" stroke-linecap="round"/>
          <rect x="16.5" y="38" width="7" height="4" rx="1" fill="#d4af37" stroke="#927114" stroke-width="0.75"/>
          <line x1="16.5" y1="40" x2="23.5" y2="40" stroke="#715408" stroke-width="0.5"/>
          <path d="M19.5 42 C16 48, 12 62, 11 76 C15 78, 25 78, 29 76 C28 62, 24 48, 20.5 42 Z" fill="#8c5828" stroke="#4a280c" stroke-width="1.2"/>
          <path d="M15 52 Q13 65 14 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <path d="M20 46 Q20 62 20 77" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <path d="M25 52 Q27 65 26 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <circle cx="20" cy="18" r="1.5" fill="#f5cf7a"/>
        </svg>
      </div>
    `;
      document.body.appendChild(track);
    }
    const broomContainer = document.getElementById("flyingBroom");
    if (!broomContainer) return () => {
    };
    const broomSvg = broomContainer.querySelector(".flying-broom-svg");
    let currentY2 = 0;
    let targetY2 = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let currentTilt = 0;
    let isDragging = false;
    let startDragY = 0;
    let startScrollY = 0;
    let lastSparkleTime = 0;
    function updateBroomPosition() {
      const trackHeight = track.clientHeight - broomContainer.clientHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && trackHeight > 0) {
        targetY2 = window.scrollY / maxScroll * trackHeight;
      } else {
        targetY2 = 0;
      }
      if (isDragging) {
        currentY2 = targetY2;
      } else {
        currentY2 += (targetY2 - currentY2) * 0.35;
      }
      broomContainer.style.transform = `translate3d(0, ${currentY2.toFixed(2)}px, 0)`;
      const speed = window.scrollY - lastScrollY;
      scrollVelocity += (speed - scrollVelocity) * 0.25;
      lastScrollY = window.scrollY;
      if (!prefersReducedMotion) {
        const targetTilt = Math.max(-28, Math.min(28, scrollVelocity * 0.65));
        currentTilt += (targetTilt - currentTilt) * 0.2;
        if (broomSvg) {
          broomSvg.style.transform = `rotate(${currentTilt.toFixed(2)}deg)`;
        }
        const now = performance.now();
        if (Math.abs(scrollVelocity) > 2 && now - lastSparkleTime > 120) {
          lastSparkleTime = now;
          createBroomSparkle(track, currentY2);
        }
      }
      rafId = requestAnimationFrame(updateBroomPosition);
    }
    rafId = requestAnimationFrame(updateBroomPosition);
    function createBroomSparkle(parentTrack, broomY) {
      const sparkle = document.createElement("div");
      sparkle.className = "broom-sparkle";
      const dx = (Math.random() - 0.5) * 20;
      const dy = (Math.random() - 0.5) * 16 - 8;
      sparkle.style.setProperty("--dx", `${dx}px`);
      sparkle.style.setProperty("--dy", `${dy}px`);
      sparkle.style.left = `${parentTrack.clientWidth / 2 - 2 + (Math.random() - 0.5) * 10}px`;
      sparkle.style.top = `${broomY + 54 + (Math.random() - 0.5) * 8}px`;
      parentTrack.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 700);
    }
    function stopDragging() {
      if (isDragging) {
        isDragging = false;
        document.documentElement.style.scrollBehavior = "";
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
      }
    }
    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
      startDragY = e.clientY;
      startScrollY = window.scrollY;
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const trackHeight = track.clientHeight - broomContainer.clientHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (trackHeight > 0 && maxScroll > 0) {
        const deltaY = e.clientY - startDragY;
        const scrollDelta = deltaY / trackHeight * maxScroll;
        window.scrollTo(0, Math.max(0, Math.min(maxScroll, startScrollY + scrollDelta)));
      }
    };
    broomContainer.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    cleanups13.push(() => {
      broomContainer.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    });
    return destroyBroom;
  }
  function destroyBroom() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    cleanups13.forEach((fn) => fn());
    cleanups13 = [];
  }

  // assets/js/data/spells.js
  var spells = Object.freeze([
    {
      id: "lumos",
      incantation: "Lumos",
      label: "Light Broadsheet",
      effect: "theme-light",
      keys: ["l", "L"],
      where: "Global & Navbar",
      sfx: "wand",
      description: "Illuminates the page in traditional parchment daylight edition."
    },
    {
      id: "nox",
      incantation: "Nox",
      label: "Dark Ink Edition",
      effect: "theme-dark",
      keys: ["n", "N"],
      where: "Global & Navbar",
      sfx: "wand",
      description: "Extinguishes the light, entering dark midnight ink mode."
    },
    {
      id: "revelio",
      incantation: "Revelio",
      label: "Reveal Secrets",
      effect: "reveal-detail",
      keys: ["r", "R"],
      where: "Railway, Potion Cabinet, Cards",
      sfx: "paper",
      description: "Unveils hidden engineering disclosures, query indexes, and parameters."
    },
    {
      id: "accio",
      incantation: "Accio Source",
      label: "Summon Source",
      effect: "open-github",
      keys: ["a", "A"],
      where: "Station Panel, Dossier",
      sfx: "whistle",
      description: "Summons the repository from the GitHub archives."
    },
    {
      id: "alohomora",
      incantation: "Alohomora",
      label: "Unlock Dossier",
      effect: "open-modal",
      keys: ["o", "O"],
      where: "Cards, Station Panel",
      sfx: "door",
      description: "Unlocks the tamper-evident wax seal of the case dossier."
    },
    {
      id: "protego",
      incantation: "Protego",
      label: "Shield Navigation",
      effect: "toggle-lock",
      keys: ["p", "P"],
      where: "Railway HUD",
      sfx: "bell",
      description: "Erects a protective barrier preventing accidental track navigation."
    },
    {
      id: "wingardium",
      incantation: "Wingardium",
      label: "Levitate Focus",
      effect: "hover-lift",
      keys: ["w", "W"],
      where: "Cards, Potion Bottles",
      sfx: "wand",
      description: "Levitates cards and potion phials upon magical focus."
    },
    {
      id: "reparo",
      incantation: "Reparo",
      label: "Mend & Reset",
      effect: "reset-filters",
      keys: ["g", "G"],
      where: "Case Files Header",
      sfx: "paper",
      description: "Mends fractured filter matrices and restores all dispatch articles."
    },
    {
      id: "obliviate",
      incantation: "Obliviate",
      label: "Erase Search",
      effect: "clear-search",
      keys: ["Backspace"],
      where: "Laboratory Search Bar",
      sfx: "paper",
      description: "Clears active forensics search query from memory."
    },
    {
      id: "priorIncantato",
      incantation: "Prior Incantato",
      label: "Previous Station",
      effect: "prev-station",
      keys: ["ArrowLeft"],
      where: "Railway HUD",
      sfx: "chug",
      description: "Echoes the previous station along the railway line."
    },
    {
      id: "expectoPatronum",
      incantation: "Expecto Patronum",
      label: "Conjure Patronus",
      effect: "highlight-featured",
      keys: ["e", "E"],
      where: "Case Files Header & Spellbook",
      sfx: "bell",
      description: "Conjures a radiant silver-blue beacon guiding to the featured station."
    },
    {
      id: "portkey",
      incantation: "Portkey",
      label: "Transport to Live Demo",
      effect: "open-demo",
      keys: [],
      where: "Station Panel & Dossier",
      sfx: "whistle",
      description: "Enchants an external link to transport the explorer to a live demo."
    },
    {
      id: "finite",
      incantation: "Finite Incantatem",
      label: "Halt All Magic",
      effect: "stop-effects",
      keys: ["Escape"],
      where: "Global & Spellbook",
      sfx: "bell",
      description: "Terminates all running kinetic animations, loops, and effects."
    },
    {
      id: "morsmordre",
      incantation: "Morsmordre",
      label: "Dark Mark Prank",
      effect: "dark-mark",
      keys: ["morsmordre"],
      where: "Global Easter Egg",
      sfx: "chime",
      description: "Summons a fleeting, harmless green skull in the clouds. Hire him instead."
    }
  ].map((s) => Object.freeze({
    ...s,
    keys: Object.freeze([...s.keys])
  })));
  function getSpellById(id) {
    return spells.find((s) => s.id === id) || null;
  }

  // assets/js/components/spell-bar.js
  var cleanups14 = [];
  var spellbookOpen = false;
  function initSpellBar() {
    createSpellbookMarkup();
    const onDocClick = (e) => {
      const trigger = e.target.closest("[data-spell]");
      if (trigger) {
        const spellId = trigger.getAttribute("data-spell");
        if (spellId) {
          castSpell(spellId, { trigger });
        }
      }
    };
    document.addEventListener("click", onDocClick);
    cleanups14.push(() => document.removeEventListener("click", onDocClick));
    const onKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "?" || e.shiftKey && e.key === "/") {
        e.preventDefault();
        toggleSpellbook();
      } else if (e.key === "Escape") {
        if (spellbookOpen) {
          toggleSpellbook(false);
        } else {
          castSpell("finite");
        }
      } else if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) {
        castSpell("revelio");
      } else if ((e.key === "e" || e.key === "E") && !e.ctrlKey && !e.metaKey) {
        castSpell("expectoPatronum");
      } else if ((e.key === "g" || e.key === "G") && !e.ctrlKey && !e.metaKey) {
        castSpell("reparo");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    cleanups14.push(() => window.removeEventListener("keydown", onKeyDown));
    return destroySpellBar;
  }
  function destroySpellBar() {
    cleanups14.forEach((fn) => fn());
    cleanups14 = [];
    const sb = document.getElementById("spellbookModal");
    if (sb) sb.remove();
  }
  function castSpell(spellId, ctx = {}) {
    const spell = getSpellById(spellId);
    const incantation = spell ? spell.incantation : spellId;
    const sfxType = spell ? spell.sfx : "wand";
    playSfx(sfxType);
    showToast(`\u26A1 ${incantation}!`);
    switch (spellId) {
      case "lumos":
        applyTheme("lumos");
        break;
      case "nox":
        applyTheme("nox");
        break;
      case "revelio":
        const revelioBtn = document.getElementById("btnRevelioToggle");
        if (revelioBtn) revelioBtn.click();
        document.querySelectorAll(".potion-revelio-card").forEach((c) => c.classList.toggle("active"));
        break;
      case "alohomora":
        openDossier(ctx.projectId || "finacle");
        break;
      case "accio":
        window.open("https://github.com/rishi-bhardvaj", "_blank", "noopener");
        break;
      case "protego":
        const protegoBtn = document.getElementById("hudProtegoBtn");
        if (protegoBtn) protegoBtn.click();
        break;
      case "reparo":
        const allFilterBtn = document.querySelector('.filter-tab-btn[data-category="all"]');
        if (allFilterBtn) allFilterBtn.click();
        const allPillBtn = document.querySelector('.lab-pill-btn[data-category="all"]');
        if (allPillBtn) allPillBtn.click();
        break;
      case "obliviate":
        const searchInput = document.getElementById("skillSearchInput");
        if (searchInput) {
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input"));
        }
        break;
      case "priorIncantato":
        const prevBtn = document.getElementById("hudPrevBtn");
        if (prevBtn) prevBtn.click();
        break;
      case "expectoPatronum":
        goToStation(0, { source: "patronus" });
        triggerPatronusMist();
        break;
      case "portkey":
        if (ctx.url) {
          setTimeout(() => window.open(ctx.url, "_blank", "noopener"), 400);
        }
        break;
      case "finite":
        document.querySelectorAll(".patronus-mist, .morsmordre-overlay").forEach((el) => el.remove());
        closeDossier();
        showToast("\u2726 Finite Incantatem: Active magical effects ceased.");
        break;
      case "morsmordre":
        triggerMorsmordre();
        break;
    }
  }
  function triggerPatronusMist() {
    if (prefersReducedMotion) return;
    const target = document.getElementById("railwayStage") || document.body;
    const mistWrap = document.createElement("div");
    mistWrap.className = "patronus-mist";
    target.appendChild(mistWrap);
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      p.className = "patronus-particle";
      const angle = i / particleCount * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      p.style.setProperty("--px", `${px}px`);
      p.style.setProperty("--py", `${py}px`);
      mistWrap.appendChild(p);
    }
    setTimeout(() => mistWrap.remove(), 2400);
  }
  function triggerMorsmordre() {
    playSfx("thunder");
    const overlay = document.createElement("div");
    overlay.className = "morsmordre-overlay";
    overlay.innerHTML = `
    <div class="morsmordre-content">
      <svg class="morsmordre-skull-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15 C30 15 20 30 20 50 C20 65 30 75 40 75 L40 85 L60 85 L60 75 C70 75 80 65 80 50 C80 30 70 15 50 15 Z" fill="#10b981" opacity="0.85"/>
        <circle cx="38" cy="45" r="7" fill="#064e3b"/>
        <circle cx="62" cy="45" r="7" fill="#064e3b"/>
        <path d="M48 60 L50 56 L52 60 Z" fill="#064e3b"/>
      </svg>
      <div class="morsmordre-title">MORSMORDRE</div>
      <p class="morsmordre-sub">Just kidding. Hire him instead.</p>
    </div>
  `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 500);
    }, 2200);
  }
  function createSpellbookMarkup() {
    let spellbook = document.getElementById("spellbookModal");
    if (!spellbook) {
      spellbook = document.createElement("aside");
      spellbook.id = "spellbookModal";
      spellbook.className = "spellbook-modal";
      spellbook.setAttribute("role", "dialog");
      spellbook.setAttribute("aria-modal", "true");
      spellbook.setAttribute("aria-label", "The Great Spellbook & Lexicon");
      spellbook.innerHTML = `
      <div class="spellbook-dossier" onclick="event.stopPropagation()">
        <div class="spellbook-header">
          <div>
            <div class="font-mono text-[10px] text-[var(--stamp-red)] font-bold tracking-widest uppercase">LEXICON OF SPELLS</div>
            <h3 class="font-headline text-2xl font-bold text-[var(--text-ink)]">The Standard Book of Spells</h3>
          </div>
          <button id="spellbookCloseBtn" class="btn-panel-return" aria-label="Close Spellbook">&times;</button>
        </div>

        <div class="spellbook-body">
          <p class="font-sans text-xs text-[var(--text-muted)] mb-4">
            Click any incantation or press its assigned shortcut key to trigger its corresponding system effect.
          </p>

          <div class="spells-registry-grid">
            ${spells.map((spell) => `
              <div class="spell-registry-card" data-spell="${spell.id}">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-headline font-bold text-sm text-[var(--text-ink)]">${spell.incantation}</span>
                  ${spell.keys.length > 0 ? `<kbd class="spell-kbd">${spell.keys[0]}</kbd>` : ""}
                </div>
                <div class="font-mono text-[9px] text-[var(--stamp-red)] font-bold uppercase mb-1">${spell.label}</div>
                <p class="font-sans text-xs text-[var(--text-muted)] leading-relaxed m-0">${spell.description}</p>
                <div class="text-right mt-2">
                  <span class="text-[10px] font-mono text-[var(--accent-gold)] underline">CAST &rarr;</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="spellbook-footer">
          <span class="font-mono text-[10px] text-[#766953]">Press [?] anywhere to open &bull; [Esc] to dismiss</span>
          <button id="spellbookDismissBtn" class="btn-ink text-xs">CLOSE SPELLBOOK</button>
        </div>
      </div>
    `;
      document.body.appendChild(spellbook);
      const closeBtn = document.getElementById("spellbookCloseBtn");
      const dismissBtn = document.getElementById("spellbookDismissBtn");
      if (closeBtn) closeBtn.addEventListener("click", () => toggleSpellbook(false));
      if (dismissBtn) dismissBtn.addEventListener("click", () => toggleSpellbook(false));
      spellbook.addEventListener("click", (e) => {
        if (e.target === spellbook) toggleSpellbook(false);
      });
    }
  }
  function toggleSpellbook(forceState) {
    const spellbook = document.getElementById("spellbookModal");
    if (!spellbook) return;
    spellbookOpen = typeof forceState === "boolean" ? forceState : !spellbookOpen;
    if (spellbookOpen) {
      spellbook.classList.add("active");
      document.body.style.overflow = "hidden";
      playSfx("paper");
    } else {
      spellbook.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // assets/js/data/navigation.js
  var navSections = Object.freeze([
    {
      id: "home",
      label: "DISPATCH",
      fullName: "Front Page & Overview",
      sub: "The Broadside Front Page",
      mapPos: { x: 50, y: 15 },
      icon: "feather"
    },
    {
      id: "work",
      label: "RAILWAY",
      fullName: "The Wizarding Railway",
      sub: "Case Files & Stations",
      mapPos: { x: 26, y: 38 },
      icon: "train"
    },
    {
      id: "stack",
      label: "LABORATORY",
      fullName: "The Lab Report & Potions",
      sub: "Substance Cabinet & Forensics",
      mapPos: { x: 74, y: 48 },
      icon: "flask"
    },
    {
      id: "ledger",
      label: "LEDGER",
      fullName: "The Career Ledger",
      sub: "Movements on Record",
      mapPos: { x: 28, y: 72 },
      icon: "scroll"
    },
    {
      id: "contact",
      label: "OWL POST",
      fullName: "Submit an Owl",
      sub: "Letters, Commissions & Wire",
      mapPos: { x: 72, y: 84 },
      icon: "feather-alt"
    }
  ]);

  // assets/js/components/marauder.js
  var modalEl = null;
  var cleanups15 = [];
  var previousActiveElement = null;
  var untrapFocus = null;
  var CHAMBER_ICONS = {
    home: "\u2712\uFE0F",
    work: "\u{1F682}",
    stack: "\u2697\uFE0F",
    ledger: "\u{1F4DC}",
    contact: "\u{1F989}"
  };
  function createMarauderModalMarkup() {
    return `
    <div id="marauderModal" class="marauder-modal" role="dialog" aria-modal="true" aria-labelledby="marauderHeading" aria-hidden="true">
      <div class="marauder-parchment-sheet" onclick="event.stopPropagation()">
        
        <!-- Header Crest & Inscription -->
        <header class="marauder-header">
          <div class="marauder-creators">Messrs Moony, Wormtail, Padfoot &amp; Prongs</div>
          <div class="marauder-motto">Purveyors of Aids to Magical Mischief-Makers &bull; Anno 2026</div>
          <h2 id="marauderHeading" class="marauder-title">The Marauder's Map</h2>
          <div class="marauder-subtitle">Spatial Floorplan &amp; Waypoints of Rishi Bhardvaj</div>
        </header>

        <!-- Floorplan Blueprint Stage -->
        <div class="marauder-floorplan" id="marauderFloorplan">
          
          <!-- SVG Connecting Corridors & Labyrinth -->
          <svg class="marauder-svg-blueprint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <!-- Architectural Wall Outlines -->
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#7c5c3b" stroke-width="0.8" opacity="0.4" />
            <rect x="8" y="8" width="84" height="84" fill="none" stroke="#7c5c3b" stroke-width="0.4" stroke-dasharray="1 1" opacity="0.3" />
            
            <!-- Dynamic Corridor Paths -->
            <path class="marauder-corridor-path" d="M 50 15 L 26 38" />
            <path class="marauder-corridor-path" d="M 50 15 L 74 48" />
            <path class="marauder-corridor-path" d="M 26 38 L 74 48" />
            <path class="marauder-corridor-path" d="M 26 38 L 28 72" />
            <path class="marauder-corridor-path" d="M 74 48 L 72 84" />
            <path class="marauder-corridor-path" d="M 28 72 L 72 84" />
          </svg>

          <!-- Animated Footstep Track Dots -->
          <div class="marauder-footprints-track" aria-hidden="true">
            <span class="marauder-footstep" style="top: 24%; left: 37%; transform: rotate(45deg); animation-delay: 0s;"></span>
            <span class="marauder-footstep" style="top: 28%; left: 41%; transform: rotate(45deg); animation-delay: 0.6s;"></span>
            <span class="marauder-footstep" style="top: 32%; left: 45%; transform: rotate(45deg); animation-delay: 1.2s;"></span>
            
            <span class="marauder-footstep" style="top: 42%; left: 46%; transform: rotate(90deg); animation-delay: 1.8s;"></span>
            <span class="marauder-footstep" style="top: 43%; left: 54%; transform: rotate(90deg); animation-delay: 2.4s;"></span>
            
            <span class="marauder-footstep" style="top: 55%; left: 27%; transform: rotate(0deg); animation-delay: 0.8s;"></span>
            <span class="marauder-footstep" style="top: 61%; left: 28%; transform: rotate(0deg); animation-delay: 1.4s;"></span>

            <span class="marauder-footstep" style="top: 62%; left: 73%; transform: rotate(0deg); animation-delay: 2.1s;"></span>
            <span class="marauder-footstep" style="top: 72%; left: 72%; transform: rotate(0deg); animation-delay: 2.7s;"></span>
          </div>

          <!-- Wandering Persona Ribbon -->
          <div class="marauder-person-ribbon" title="Engineer on site">
            <span>Rishi Bhardvaj</span>
          </div>

          <!-- Destination Chambers Rendered Dynamically from navSections -->
          ${navSections.map((sec) => `
            <button 
              type="button"
              class="marauder-chamber"
              style="left: ${sec.mapPos.x}%; top: ${sec.mapPos.y}%;"
              data-target-id="${sec.id}"
              aria-label="Travel to ${sec.fullName}: ${sec.sub}"
            >
              <span class="marauder-chamber-icon" aria-hidden="true">${CHAMBER_ICONS[sec.id] || "\u{1F4CD}"}</span>
              <span class="marauder-chamber-name">${sec.label}</span>
              <span class="marauder-chamber-sub">${sec.sub}</span>
            </button>
          `).join("")}

        </div>

        <!-- Footer Control Strip -->
        <footer class="marauder-footer">
          <div class="marauder-hint">
            &ldquo;I solemnly swear that I am up to no good.&rdquo;
          </div>
          <button type="button" class="marauder-close-btn" id="btnMischiefManaged">
            <span>&times;</span>
            <span>Mischief Managed</span>
          </button>
        </footer>

      </div>
    </div>
  `;
  }
  function openMarauderMap() {
    if (!modalEl) return;
    previousActiveElement = document.activeElement;
    playSfx("paper");
    modalEl.classList.add("active");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    untrapFocus = trapFocus(modalEl);
    const closeBtn = document.getElementById("btnMischiefManaged");
    if (closeBtn) {
      closeBtn.focus();
    }
  }
  function closeMarauderMap(reason = "close") {
    if (!modalEl || !modalEl.classList.contains("active")) return;
    playSfx("paper");
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (typeof untrapFocus === "function") {
      untrapFocus();
      untrapFocus = null;
    }
    if (previousActiveElement && typeof previousActiveElement.focus === "function") {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  }
  function initMarauder() {
    let existingModal = document.getElementById("marauderModal");
    if (!existingModal) {
      document.body.insertAdjacentHTML("beforeend", createMarauderModalMarkup());
      modalEl = document.getElementById("marauderModal");
    } else {
      modalEl = existingModal;
    }
    const chamberBtns = modalEl.querySelectorAll(".marauder-chamber");
    chamberBtns.forEach((btn) => {
      const onChamberClick = () => {
        const targetId = btn.getAttribute("data-target-id");
        const targetEl = document.getElementById(targetId);
        closeMarauderMap("navigate");
        playSfx("click");
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
          showToast("Mischief managed.");
        }
      };
      btn.addEventListener("click", onChamberClick);
      cleanups15.push(() => btn.removeEventListener("click", onChamberClick));
    });
    const closeBtn = document.getElementById("btnMischiefManaged");
    if (closeBtn) {
      const onCloseClick = () => {
        closeMarauderMap("button");
        showToast("Mischief managed.");
      };
      closeBtn.addEventListener("click", onCloseClick);
      cleanups15.push(() => closeBtn.removeEventListener("click", onCloseClick));
    }
    const onBackdropClick = (e) => {
      if (e.target === modalEl) {
        closeMarauderMap("backdrop");
        showToast("Mischief managed.");
      }
    };
    modalEl.addEventListener("click", onBackdropClick);
    cleanups15.push(() => modalEl.removeEventListener("click", onBackdropClick));
    const onKey = (e) => {
      if (e.key === "Escape" && modalEl.classList.contains("active")) {
        e.preventDefault();
        closeMarauderMap("escape");
        showToast("Mischief managed.");
      }
    };
    window.addEventListener("keydown", onKey);
    cleanups15.push(() => window.removeEventListener("keydown", onKey));
    const triggerLinks = document.querySelectorAll("[data-open-marauder], .marauder-entry-link");
    triggerLinks.forEach((link) => {
      const onTrigger = (e) => {
        e.preventDefault();
        openMarauderMap();
      };
      link.addEventListener("click", onTrigger);
      cleanups15.push(() => link.removeEventListener("click", onTrigger));
    });
    return destroyMarauder;
  }
  function destroyMarauder() {
    if (modalEl && modalEl.classList.contains("active")) {
      closeMarauderMap("destroy");
    }
    cleanups15.forEach((fn) => fn());
    cleanups15 = [];
  }

  // assets/js/components/cursor.js
  var cursorDot = null;
  var rafId2 = null;
  var isRunning = false;
  var cleanups16 = [];
  var targetX = -100;
  var targetY = -100;
  var currentX = -100;
  var currentY = -100;
  var isFiniteSuppressed = false;
  function initCursor() {
    if (typeof window === "undefined") return () => {
    };
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasFinePointer || prefersReducedMotion) {
      return () => {
      };
    }
    cursorDot = document.createElement("div");
    cursorDot.className = "wand-cursor-dot";
    cursorDot.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorDot);
    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorDot.classList.contains("active")) {
        cursorDot.classList.add("active");
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    cleanups16.push(() => window.removeEventListener("pointermove", onPointerMove));
    const onPointerLeave = () => {
      if (cursorDot) cursorDot.classList.remove("active");
    };
    const onPointerEnter = () => {
      if (cursorDot) cursorDot.classList.add("active");
    };
    document.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("mouseenter", onPointerEnter);
    cleanups16.push(() => document.removeEventListener("mouseleave", onPointerLeave));
    cleanups16.push(() => document.removeEventListener("mouseenter", onPointerEnter));
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || !cursorDot) return;
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], summary, .btn-ink, .route-node-btn, .marauder-chamber');
      if (isInteractive) {
        cursorDot.classList.add("hovering");
      } else {
        cursorDot.classList.remove("hovering");
      }
    };
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    cleanups16.push(() => document.removeEventListener("mouseover", onMouseOver));
    const onPointerDown = (e) => {
      if (isFiniteSuppressed || prefersReducedMotion) return;
      spawnSparks(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    cleanups16.push(() => window.removeEventListener("pointerdown", onPointerDown));
    const onSpellFinite = () => {
      isFiniteSuppressed = true;
      if (cursorDot) cursorDot.classList.remove("active");
      setTimeout(() => {
        isFiniteSuppressed = false;
      }, 4e3);
    };
    window.addEventListener("chronicle:spell:finite", onSpellFinite);
    cleanups16.push(() => window.removeEventListener("chronicle:spell:finite", onSpellFinite));
    isRunning = true;
    function loop() {
      if (!isRunning) return;
      if (!isFiniteSuppressed) {
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        currentX += dx * 0.22;
        currentY += dy * 0.22;
        if (cursorDot) {
          cursorDot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
      }
      rafId2 = requestAnimationFrame(loop);
    }
    rafId2 = requestAnimationFrame(loop);
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId2) cancelAnimationFrame(rafId2);
      } else {
        if (isRunning) rafId2 = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    cleanups16.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));
    return destroyCursor;
  }
  function spawnSparks(x, y) {
    const sparkCount = 6;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement("div");
      spark.className = "wand-spark";
      spark.setAttribute("aria-hidden", "true");
      const angle = i / sparkCount * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 14 + Math.random() * 22;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 3;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty("--dx", `${dx}px`);
      spark.style.setProperty("--dy", `${dy}px`);
      frag.appendChild(spark);
      setTimeout(() => spark.remove(), 450);
    }
    document.body.appendChild(frag);
  }
  function destroyCursor() {
    isRunning = false;
    if (rafId2) {
      cancelAnimationFrame(rafId2);
      rafId2 = null;
    }
    if (cursorDot && cursorDot.parentNode) {
      cursorDot.parentNode.removeChild(cursorDot);
      cursorDot = null;
    }
    cleanups16.forEach((fn) => fn());
    cleanups16 = [];
  }

  // assets/js/components/easter-eggs.js
  var cleanups17 = [];
  var keyBuffer = "";
  var keyTimer = null;
  var crestClickCount = 0;
  var crestTimer = null;
  function initEasterEggs() {
    if (typeof window === "undefined") return () => {
    };
    const onKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || activeEl.isContentEditable) {
          return;
        }
      }
      if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 20) {
          keyBuffer = keyBuffer.slice(-20);
        }
        clearTimeout(keyTimer);
        keyTimer = setTimeout(() => {
          keyBuffer = "";
        }, 2e3);
        checkIncantations(keyBuffer);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    cleanups17.push(() => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(keyTimer);
    });
    const crestElements = document.querySelectorAll(".nav-brand-crest, .masthead-monogram");
    crestElements.forEach((crest) => {
      const onCrestClick = (e) => {
        e.preventDefault();
        crestClickCount++;
        clearTimeout(crestTimer);
        crestTimer = setTimeout(() => {
          crestClickCount = 0;
        }, 3500);
        if (crestClickCount < 7) {
          playSfx("click");
          crest.style.transform = `scale(${1 + crestClickCount * 0.03})`;
          setTimeout(() => {
            crest.style.transform = "";
          }, 150);
        } else {
          crestClickCount = 0;
          playSfx("seal");
          crest.classList.add("seal-breaking");
          setTimeout(() => crest.classList.remove("seal-breaking"), 850);
          unlockSecretStation();
          showToast("\u26A1 TAMPER SEAL BROKEN: The Room of Requirement (Station 07) has unlocked along the Wizarding Railway!");
          const workSec = document.getElementById("work");
          if (workSec) {
            workSec.scrollIntoView({ behavior: "smooth" });
          }
        }
      };
      crest.addEventListener("click", onCrestClick);
      cleanups17.push(() => crest.removeEventListener("click", onCrestClick));
    });
    const owlBtn = document.getElementById("footerOwlBtn");
    if (owlBtn) {
      const onOwlClick = (e) => {
        e.preventDefault();
        playSfx("hoot");
        owlBtn.classList.add("hooting");
        setTimeout(() => owlBtn.classList.remove("hooting"), 500);
        showToast("\u{1F989} Hoo! The nocturnal dispatch owl stands ready. Send an owl in the post section below!");
      };
      owlBtn.addEventListener("click", onOwlClick);
      cleanups17.push(() => owlBtn.removeEventListener("click", onOwlClick));
    }
    return destroyEasterEggs;
  }
  function checkIncantations(buffer) {
    if (buffer.endsWith("mischief")) {
      keyBuffer = "";
      openMarauderMap();
    } else if (buffer.endsWith("morsmordre")) {
      keyBuffer = "";
      triggerDarkMark();
    } else if (buffer.endsWith("patronus")) {
      keyBuffer = "";
      triggerPatronus();
    } else if (buffer.endsWith("lumos")) {
      keyBuffer = "";
      playSfx("wand");
      const isDark = document.documentElement.classList.contains("theme-nox");
      if (isDark) {
        document.documentElement.classList.remove("theme-nox");
        store.set("theme", "lumos");
        localStorage.setItem("prophet_theme_edition", "lumos");
      }
      showToast("\u2728 Lumos! Radiant broadsheet illumination cast.");
    } else if (buffer.endsWith("nox")) {
      keyBuffer = "";
      playSfx("wand");
      const isDark = document.documentElement.classList.contains("theme-nox");
      if (!isDark) {
        document.documentElement.classList.add("theme-nox");
        store.set("theme", "nox");
        localStorage.setItem("prophet_theme_edition", "nox");
      }
      showToast("\u{1F311} Nox! Shadows veil the broadsheet.");
    } else if (buffer.endsWith("finite")) {
      keyBuffer = "";
      playSfx("paper");
      dismissAllOverlays();
      showToast("\u2728 Finite Incantatem! All active charms dispelled.");
    }
  }
  function triggerDarkMark() {
    playSfx("dark-mark");
    dismissAllOverlays();
    const overlay = document.createElement("div");
    overlay.className = "dark-mark-overlay";
    overlay.id = "activeDarkMark";
    overlay.innerHTML = `
    <svg class="dark-mark-graphic" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="The Dark Mark">
      <!-- Emerald Glow Aura -->
      <circle cx="100" cy="90" r="70" fill="rgba(16, 185, 129, 0.25)" filter="blur(20px)" />
      <!-- Stylized Skull Silhouette -->
      <path d="M60 80 C60 45, 140 45, 140 80 C140 105, 130 120, 115 130 L115 145 C115 150, 85 150, 85 145 L85 130 C70 120, 60 105, 60 80 Z" fill="#10b981" fill-opacity="0.9" stroke="#6ee7b7" stroke-width="2" />
      <!-- Eye Sockets & Nasal Aperture -->
      <ellipse cx="80" cy="80" rx="9" ry="12" fill="#064e3b" />
      <ellipse cx="120" cy="80" rx="9" ry="12" fill="#064e3b" />
      <polygon points="100,95 95,110 105,110" fill="#064e3b" />
      <!-- Teeth Grid -->
      <rect x="90" y="132" width="4" height="8" fill="#064e3b" />
      <rect x="98" y="132" width="4" height="8" fill="#064e3b" />
      <rect x="106" y="132" width="4" height="8" fill="#064e3b" />
      <!-- Emergent Coiling Serpent -->
      <path d="M100 148 C95 180, 50 190, 70 220 C90 250, 140 230, 130 260 C120 280, 100 290, 85 295" stroke="#34d399" stroke-width="8" stroke-linecap="round" fill="none" />
      <circle cx="85" cy="295" r="4" fill="#a7f3d0" />
    </svg>
  `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("active"));
    showToast("\u26A1 Morsmordre! The emerald serpent mark ascents into the clouds.");
    setTimeout(() => {
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 600);
    }, 2600);
  }
  function triggerPatronus() {
    playSfx("patronus");
    dismissAllOverlays();
    const overlay = document.createElement("div");
    overlay.className = "patronus-overlay";
    overlay.id = "activePatronus";
    overlay.innerHTML = `
    <svg class="patronus-stag-silhouette" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Silver Stag Patronus">
      <!-- Luminous Celestial Glow -->
      <circle cx="150" cy="150" r="100" fill="rgba(255, 255, 255, 0.4)" filter="blur(30px)" />
      <!-- Ethereal Stag Head & Antlers -->
      <path d="M150 170 C140 150, 135 125, 145 105 C150 95, 160 95, 165 105 C175 125, 170 150, 160 170 Z" fill="#ffffff" fill-opacity="0.95" />
      <!-- Left Antler Branches -->
      <path d="M142 105 C130 90, 110 80, 95 85 C90 75, 100 65, 115 70 C125 75, 135 60, 125 45 C135 50, 140 65, 140 85" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Right Antler Branches -->
      <path d="M168 105 C180 90, 200 80, 215 85 C220 75, 210 65, 195 70 C185 75, 175 60, 185 45 C175 50, 170 65, 170 85" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Muzzle & Gentle Eye -->
      <circle cx="150" cy="172" r="3" fill="#38bdf8" />
      <circle cx="147" cy="130" r="2" fill="#38bdf8" />
      <circle cx="163" cy="130" r="2" fill="#38bdf8" />
    </svg>
  `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("active"));
    showToast("\u{1F98C} Expecto Patronum! Silver guardian mist dispels the darkness.");
    setTimeout(() => {
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 700);
    }, 4500);
  }
  function dismissAllOverlays() {
    const dm = document.getElementById("activeDarkMark");
    if (dm) dm.remove();
    const pat = document.getElementById("activePatronus");
    if (pat) pat.remove();
    window.dispatchEvent(new CustomEvent("chronicle:spell:finite"));
  }
  function destroyEasterEggs() {
    cleanups17.forEach((fn) => fn());
    cleanups17 = [];
    dismissAllOverlays();
  }

  // assets/js/main.js
  var teardowns = [];
  function initAll() {
    assertDom([
      "themeToggleBtn",
      "soundToggleBtn",
      "work",
      "articlesGrid",
      "forensicsTableBody",
      "contactForm",
      "caseModal"
    ]);
    const initializers = [
      initTheme,
      initAudio,
      initNavigation,
      initMasthead,
      initPortrait,
      initRailway,
      initArticles,
      initLabReport,
      initLedger,
      initDossier,
      initContact,
      initBroom,
      initOwl,
      initSpellBar,
      initMarauder,
      initCursor,
      initEasterEggs
    ];
    initializers.forEach((fn) => {
      try {
        const teardown = fn();
        if (typeof teardown === "function") {
          teardowns.push(teardown);
        }
      } catch (err) {
        console.error(`[Orchestrator] Error initializing ${fn.name}:`, err);
      }
    });
    console.log("\u{1F5DE}\uFE0F Daily Chronicle broadsheet edition initialized successfully.");
  }
  function destroyAll() {
    while (teardowns.length > 0) {
      const fn = teardowns.pop();
      try {
        fn();
      } catch (err) {
        console.error("[Orchestrator] Error during teardown:", err);
      }
    }
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      initAll();
    }
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", destroyAll);
  }
})();
