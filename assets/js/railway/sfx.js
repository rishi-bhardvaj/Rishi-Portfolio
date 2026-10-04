/**
 * Railway Sound Controller
 * Orchestrates acoustic cues for station travel, bells, whistles, and steam chugs.
 */

import { playSfx, startChug, stopChug, isSoundActive } from '../core/audio.js';

export function playRailwayBell() {
  if (isSoundActive()) playSfx('bell');
}

export function playTrainWhistle() {
  if (isSoundActive()) playSfx('whistle');
}

export function playGateOpen() {
  if (isSoundActive()) playSfx('door');
}

export function playStationArrival() {
  if (isSoundActive()) playSfx('arrival');
}

export function startTrainChug() {
  if (isSoundActive()) startChug();
}

export function stopTrainChug() {
  stopChug();
}
