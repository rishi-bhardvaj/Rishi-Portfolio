/**
 * Core Event Management & Cleanup Registry
 * Provides scoped event listeners with guaranteed teardown.
 */

export function createEventScope() {
  const cleanups = [];

  return {
    /**
     * Add event listener with auto-cleanup
     */
    listen(target, type, handler, options) {
      if (!target) return () => {};
      target.addEventListener(type, handler, options);
      const cleanup = () => {
        target.removeEventListener(type, handler, options);
      };
      cleanups.push(cleanup);
      return cleanup;
    },

    /**
     * Register any arbitrary cleanup function
     */
    add(cleanupFn) {
      if (typeof cleanupFn === 'function') {
        cleanups.push(cleanupFn);
      }
    },

    /**
     * Teardown all listeners in this scope
     */
    destroy() {
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop();
        try {
          cleanup();
        } catch (err) {
          console.error('[EventScope] Error during teardown:', err);
        }
      }
    }
  };
}
