/**
 * The Wizarding Railway Master Orchestrator
 * Mounts the cinematic platform, coordinates GSAP entrance sequences, and manages station states.
 */

import { createSceneMarkup } from './scene.js';
import { initControls, goToStation } from './controls.js';
import { initRouteMap } from './route-map.js';
import { renderStation } from './station-panel.js';
import { projects } from '../data/projects.js';
import { store } from '../core/store.js';
import { playRailwayBell, playGateOpen } from './sfx.js';
import { prefersReducedMotion } from '../core/motion.js';

let cleanups = [];
let gsapContext = null;

export function initRailway() {
  const mountEl = document.getElementById('work');
  if (!mountEl) return () => {};

  // Inject Scene DOM
  mountEl.innerHTML = createSceneMarkup();

  const boardBtn = document.getElementById('btnBoardRailway');
  const introEl = document.getElementById('railwayIntro');
  const curtainLeft = document.getElementById('curtainGateLeft');
  const curtainRight = document.getElementById('curtainGateRight');
  const panelEl = document.getElementById('stationPanel');

  const visibleProjects = projects.filter(p => !p.hidden);

  // Initialize Route Map
  initRouteMap((idx) => {
    goToStation(idx, { source: 'route-map' });
  });

  // Initialize Controls
  initControls((idx, proj) => {
    // Station changed callback
  });

  // Check if session previously boarded
  const hasBoarded = sessionStorage.getItem('railway_boarded') === 'true';

  function triggerBoardingSequence() {
    sessionStorage.setItem('railway_boarded', 'true');
    playRailwayBell();
    playGateOpen();

    if (introEl) {
      introEl.classList.add('departing');
    }

    // Split curtain gates
    if (curtainLeft && curtainRight) {
      curtainLeft.style.transform = 'translate3d(-100%, 0, 0)';
      curtainRight.style.transform = 'translate3d(100%, 0, 0)';
    }

    setTimeout(() => {
      if (introEl) introEl.style.display = 'none';
      // Travel to first station
      goToStation(0, { source: 'boarding' });
    }, prefersReducedMotion ? 100 : 700);
  }

  if (boardBtn) {
    boardBtn.addEventListener('click', triggerBoardingSequence);
    cleanups.push(() => boardBtn.removeEventListener('click', triggerBoardingSequence));
  }

  // Keyboard Space/Enter boarding
  const onKey = (e) => {
    if (introEl && introEl.style.display !== 'none' && !hasBoarded) {
      if (e.key === ' ' || e.key === 'Enter') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          triggerBoardingSequence();
        }
      }
    }
  };
  window.addEventListener('keydown', onKey);
  cleanups.push(() => window.removeEventListener('keydown', onKey));

  // If already boarded in session, skip entrance curtain
  if (hasBoarded) {
    if (introEl) introEl.style.display = 'none';
    if (curtainLeft) curtainLeft.style.transform = 'translate3d(-100%, 0, 0)';
    if (curtainRight) curtainRight.style.transform = 'translate3d(100%, 0, 0)';
    goToStation(0, { source: 'session-resume' });
  }

  // Initialize GSAP ScrollTrigger Pinning if CDN is loaded
  if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger) {
    try {
      window.gsap.registerPlugin(window.ScrollTrigger);
      gsapContext = window.gsap.context(() => {
        window.ScrollTrigger.create({
          trigger: mountEl,
          start: 'top top',
          end: '+=150%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        });
      }, mountEl);
    } catch (err) {
      console.warn('[Railway] GSAP Pinning fallback to CSS:', err);
    }
  }

  return destroyRailway;
}

export function destroyRailway() {
  if (gsapContext) {
    gsapContext.revert();
    gsapContext = null;
  }
  cleanups.forEach(fn => fn());
  cleanups = [];
}
