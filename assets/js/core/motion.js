/**
 * Core Motion Utilities
 * Handles prefers-reduced-motion queries and motion-safe execution wrappers.
 */

const motionQuery = typeof window !== 'undefined' && window.matchMedia 
  ? window.matchMedia('(prefers-reduced-motion: reduce)') 
  : { matches: false, addEventListener: () => {} };

export let prefersReducedMotion = motionQuery.matches;

if (motionQuery.addEventListener) {
  motionQuery.addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
  });
}

/**
 * Execute callback only if the user has not requested reduced motion.
 * @param {Function} fn 
 */
export function motionSafe(fn) {
  if (!prefersReducedMotion) {
    return fn();
  }
  return undefined;
}
