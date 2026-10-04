/**
 * Incantation feedback: speaks the matching spell at the cursor whenever the visitor operates something.
 * Elements that carry `data-spell` are handled by the spell dispatcher instead (it labels itself).
 */

import { incantationRules } from '../data/incantations.js';
import { castLabel, trackPointer } from '../core/incantation.js';

export function initIncantations() {
  trackPointer();

  const onClick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const custom = target.closest('[data-incant]');
    if (custom) { castLabel(custom.dataset.incant.toUpperCase(), pointFor(e)); return; }
    if (target.closest('[data-spell]')) return;

    for (const rule of incantationRules) {
      const el = target.closest(rule.match);
      if (el) {
        // Deferred one task so the element's own handlers run first and state-dependent words (theme, sound, music) are current
        const at = pointFor(e);
        setTimeout(() => castLabel(typeof rule.text === 'function' ? rule.text(el) : rule.text, at), 0);
        return;
      }
    }
  };

  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}

/** Keyboard activations report 0,0 coordinates: fall back to the element's centre. */
function pointFor(e) {
  if (e.clientX || e.clientY) return { x: e.clientX, y: e.clientY };
  const r = e.target.getBoundingClientRect?.();
  return r ? { x: r.left + r.width / 2, y: r.top } : undefined;
}
