/**
 * Flying Broom Scrollbar Component
 * Nimbus broomstick tracking viewport scroll with dynamic tilt and sparkle trail.
 */

import { prefersReducedMotion } from '../core/motion.js';

let rafId = null;
let cleanups = [];

export function initBroom() {
  let track = document.getElementById('flyingBroomTrack');
  if (!track) {
    track = document.createElement('div');
    track.id = 'flyingBroomTrack';
    track.className = 'flying-broom-track';
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

  const broomContainer = document.getElementById('flyingBroom');
  if (!broomContainer) return () => {};
  const broomSvg = broomContainer.querySelector('.flying-broom-svg');

  let currentY = 0;
  let targetY = 0;
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
      targetY = (window.scrollY / maxScroll) * trackHeight;
    } else {
      targetY = 0;
    }

    if (isDragging) {
      currentY = targetY;
    } else {
      currentY += (targetY - currentY) * 0.35;
    }

    broomContainer.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;

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
        createBroomSparkle(track, currentY);
      }
    }

    rafId = requestAnimationFrame(updateBroomPosition);
  }

  rafId = requestAnimationFrame(updateBroomPosition);

  function createBroomSparkle(parentTrack, broomY) {
    const sparkle = document.createElement('div');
    sparkle.className = 'broom-sparkle';
    const dx = (Math.random() - 0.5) * 20;
    const dy = (Math.random() - 0.5) * 16 - 8;
    sparkle.style.setProperty('--dx', `${dx}px`);
    sparkle.style.setProperty('--dy', `${dy}px`);
    sparkle.style.left = `${(parentTrack.clientWidth / 2 - 2) + (Math.random() - 0.5) * 10}px`;
    sparkle.style.top = `${broomY + 54 + (Math.random() - 0.5) * 8}px`;
    parentTrack.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }

  function stopDragging() {
    if (isDragging) {
      isDragging = false;
      document.documentElement.style.scrollBehavior = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  }

  const onMouseDown = (e) => {
    e.preventDefault();
    isDragging = true;
    startDragY = e.clientY;
    startScrollY = window.scrollY;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const trackHeight = track.clientHeight - broomContainer.clientHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (trackHeight > 0 && maxScroll > 0) {
      const deltaY = e.clientY - startDragY;
      const scrollDelta = (deltaY / trackHeight) * maxScroll;
      window.scrollTo(0, Math.max(0, Math.min(maxScroll, startScrollY + scrollDelta)));
    }
  };

  broomContainer.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', stopDragging);

  cleanups.push(() => {
    broomContainer.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopDragging);
  });

  return destroyBroom;
}

export function destroyBroom() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  cleanups.forEach(fn => fn());
  cleanups = [];
}
