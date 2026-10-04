/**
 * Core Reactive Store
 * Minimal, lightweight pub/sub store for portfolio state.
 */

const state = {
  activeStation: 0,
  theme: 'lumos',
  sound: false,
  protegoLock: false,
  activeFilter: 'all',
  activeSkillCategory: 'all',
  skillSearch: '',
  secretUnlocked: false,
  railwayBoarded: false
};

const listeners = new Map();

export const store = {
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
      subs.forEach(fn => {
        try {
          fn(val, oldVal);
        } catch (err) {
          console.error(`[store] Error in subscriber for "${key}":`, err);
        }
      });
    }

    const globalSubs = listeners.get('*');
    if (globalSubs) {
      globalSubs.forEach(fn => {
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
      listeners.set(key, new Set());
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
