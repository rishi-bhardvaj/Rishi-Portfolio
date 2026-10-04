/**
 * The Wizarding Railway entry point.
 * Mounts the stage into #work and hands control to the journey engine.
 */

import { startJourney } from './journey.js';

export function initRailway() {
  const mount = document.getElementById('work');
  if (!mount) return () => {};
  return startJourney(mount);
}
