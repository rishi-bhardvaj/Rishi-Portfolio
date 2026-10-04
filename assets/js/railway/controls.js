/**
 * Railway Controls & State Transition Controller
 * Handles station-to-station navigation via arrows, swipe, drag, and HUD buttons.
 */

import { projects } from '../data/projects.js';
import { store } from '../core/store.js';
import { updateRouteMapUI } from './route-map.js';
import { renderStation } from './station-panel.js';
import { playStationArrival, startTrainChug, stopTrainChug, playRailwayBell } from './sfx.js';
import { showToast } from '../core/dom.js';

let isTransitioning = false;
let cleanups = [];
let touchStartX = 0;
let touchStartY = 0;

export function initControls(onStationChange) {
  const prevBtn = document.getElementById('hudPrevBtn');
  const nextBtn = document.getElementById('hudNextBtn');
  const protegoBtn = document.getElementById('hudProtegoBtn');
  const reboardBtn = document.getElementById('hudReboardBtn');
  const stage = document.getElementById('railwayStage');

  const visibleProjects = projects.filter(p => !p.hidden);
  const total = visibleProjects.length;

  function handleGo(targetIndex, source) {
    if (store.get('protegoLock') && source !== 'protego-override') {
      showToast('🛡️ Protego Shield active: Station navigation is pinned.');
      return;
    }
    if (isTransitioning) return;
    if (targetIndex < 0 || targetIndex >= total) return;

    goToStation(targetIndex, { source, onStationChange });
  }

  // HUD buttons
  if (prevBtn) {
    const onPrev = () => handleGo(store.get('activeStation') - 1, 'hud-prev');
    prevBtn.addEventListener('click', onPrev);
    cleanups.push(() => prevBtn.removeEventListener('click', onPrev));
  }

  if (nextBtn) {
    const onNext = () => handleGo(store.get('activeStation') + 1, 'hud-next');
    nextBtn.addEventListener('click', onNext);
    cleanups.push(() => nextBtn.removeEventListener('click', onNext));
  }

  // Protego button
  if (protegoBtn) {
    const onProtego = () => {
      const current = store.get('protegoLock');
      const next = !current;
      store.set('protegoLock', next);
      protegoBtn.setAttribute('aria-pressed', String(next));
      if (next) {
        protegoBtn.classList.add('active');
        showToast('🛡️ Protego! Station pinned against accidental movement.');
      } else {
        protegoBtn.classList.remove('active');
        showToast('🛡️ Protego shield lowered.');
      }
    };
    protegoBtn.addEventListener('click', onProtego);
    cleanups.push(() => protegoBtn.removeEventListener('click', onProtego));
  }

  // Reboard button
  if (reboardBtn) {
    const onReboard = () => {
      sessionStorage.removeItem('railway_boarded');
      location.hash = '#work';
      location.reload();
    };
    reboardBtn.addEventListener('click', onReboard);
    cleanups.push(() => reboardBtn.removeEventListener('click', onReboard));
  }

  // Keyboard navigation
  const onKeyDown = (e) => {
    // Only capture when not typing in form inputs
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowLeft') {
      handleGo(store.get('activeStation') - 1, 'keyboard');
    } else if (e.key === 'ArrowRight') {
      handleGo(store.get('activeStation') + 1, 'keyboard');
    } else if (e.key === 'Home') {
      handleGo(0, 'keyboard');
    } else if (e.key === 'End') {
      handleGo(total - 1, 'keyboard');
    }
  };
  window.addEventListener('keydown', onKeyDown);
  cleanups.push(() => window.removeEventListener('keydown', onKeyDown));

  // Touch Swipe & Pointer Drag Navigation
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

      // Ensure horizontal swipe is dominant and above 50px threshold
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          // Swipe left -> next station
          handleGo(store.get('activeStation') + 1, 'swipe');
        } else {
          // Swipe right -> prev station
          handleGo(store.get('activeStation') - 1, 'swipe');
        }
      }
    };

    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    cleanups.push(() => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchend', onTouchEnd);
    });
  }

  return destroyControls;
}

export function goToStation(targetIndex, { source = 'direct', onStationChange } = {}) {
  const visibleProjects = projects.filter(p => !p.hidden);
  const total = visibleProjects.length;

  if (targetIndex < 0 || targetIndex >= total) return;

  isTransitioning = true;
  store.set('activeStation', targetIndex);

  const project = visibleProjects[targetIndex];
  const trainAssembly = document.getElementById('trainAssembly');
  const counterEl = document.getElementById('hudCounter');
  const panelEl = document.getElementById('stationPanel');
  const stage = document.getElementById('railwayStage');

  // Update HUD counter
  if (counterEl) {
    counterEl.textContent = `0${targetIndex + 1} / 0${total}`;
  }

  // Update route map track line & active node
  updateRouteMapUI(targetIndex);

  // Set world theme CSS variables (sky gradient, lantern hue)
  if (stage && project.theme) {
    stage.style.setProperty('--station-sky', project.theme.sky);
    stage.style.setProperty('--station-accent', project.theme.accent);
    stage.style.setProperty('--station-lantern', project.theme.lantern);
  }

  // Trigger sound & train rolling
  startTrainChug();
  if (trainAssembly) {
    trainAssembly.classList.add('wheels-rolling');
    // Shift train offset based on station
    const offsetPercent = -((targetIndex) * 18);
    trainAssembly.style.transform = `translate3d(${offsetPercent}%, 0, 0)`;
  }

  // Update World Parallax
  const world = document.getElementById('railwayWorld');
  if (world) {
    const worldOffset = -(targetIndex * 45);
    world.style.setProperty('--world-parallax-x', `${worldOffset}px`);
  }

  // Slide panel crossfade
  if (panelEl) {
    panelEl.classList.remove('open');
    setTimeout(() => {
      renderStation(panelEl, project);
      panelEl.classList.add('open');
      playStationArrival();
      stopTrainChug();
      if (trainAssembly) {
        trainAssembly.classList.remove('wheels-rolling');
      }
      isTransitioning = false;
      if (typeof onStationChange === 'function') {
        onStationChange(targetIndex, project);
      }
    }, 400);
  } else {
    setTimeout(() => {
      stopTrainChug();
      if (trainAssembly) {
        trainAssembly.classList.remove('wheels-rolling');
      }
      isTransitioning = false;
    }, 450);
  }
}

export function destroyControls() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}
