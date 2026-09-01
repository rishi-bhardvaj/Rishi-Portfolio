// ==========================================================================
// FLYING BROOM SCROLLBAR COMPONENT
// Nimbus / Firebolt Broomstick riding the scrollbar with tilt and sparkle trail
// ==========================================================================

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
          <!-- Handle Tail -->
          <path d="M20 2 C20 2, 19 20, 19.5 40" stroke="#5c3818" stroke-width="3" stroke-linecap="round"/>
          <path d="M20 2 C20 2, 21 20, 20.5 40" stroke="#36200c" stroke-width="1" stroke-linecap="round"/>
          <!-- Golden Band Binding -->
          <rect x="16.5" y="38" width="7" height="4" rx="1" fill="#d4af37" stroke="#927114" stroke-width="0.75"/>
          <line x1="16.5" y1="40" x2="23.5" y2="40" stroke="#715408" stroke-width="0.5"/>
          <!-- Twigs / Bristles -->
          <path d="M19.5 42 C16 48, 12 62, 11 76 C15 78, 25 78, 29 76 C28 62, 24 48, 20.5 42 Z" fill="#8c5828" stroke="#4a280c" stroke-width="1.2"/>
          <!-- Bristle details -->
          <path d="M15 52 Q13 65 14 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <path d="M20 46 Q20 62 20 77" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <path d="M25 52 Q27 65 26 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
          <!-- Golden Nimbus Inscription -->
          <circle cx="20" cy="18" r="1.5" fill="#f5cf7a"/>
        </svg>
      </div>
    `;
    document.body.appendChild(track);
  }

  const broomContainer = document.getElementById('flyingBroom');
  const broomSvg = broomContainer.querySelector('.flying-broom-svg');

  let currentY = 0;
  let targetY = 0;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let isDragging = false;
  let startDragY = 0;
  let startScrollY = 0;

  function updateBroomPosition() {
    const trackHeight = track.clientHeight - broomContainer.clientHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll > 0) {
      const scrollRatio = window.scrollY / maxScroll;
      targetY = scrollRatio * trackHeight;
    } else {
      targetY = 0;
    }

    // Smooth Lerp
    currentY += (targetY - currentY) * 0.22;
    broomContainer.style.transform = `translateY(${currentY}px)`;

    // Tilt based on velocity
    const speed = window.scrollY - lastScrollY;
    scrollVelocity += (speed - scrollVelocity) * 0.15;
    lastScrollY = window.scrollY;

    const tilt = Math.max(-25, Math.min(25, scrollVelocity * 0.7));
    if (broomSvg) {
      broomSvg.style.transform = `rotate(${tilt}deg)`;
    }

    // Emit sparkle if moving
    if (Math.abs(scrollVelocity) > 2 && Math.random() > 0.4) {
      createBroomSparkle(broomContainer);
    }

    requestAnimationFrame(updateBroomPosition);
  }

  requestAnimationFrame(updateBroomPosition);

  // Sparkle generator
  function createBroomSparkle(parent) {
    const sparkle = document.createElement('div');
    sparkle.className = 'broom-sparkle';
    const dx = (Math.random() - 0.5) * 24;
    const dy = (Math.random() - 0.5) * 20 - 10;
    sparkle.style.setProperty('--dx', `${dx}px`);
    sparkle.style.setProperty('--dy', `${dy}px`);
    sparkle.style.left = `${16 + (Math.random() - 0.5) * 10}px`;
    sparkle.style.top = `${55 + (Math.random() - 0.5) * 10}px`;

    parent.appendChild(sparkle);
    setTimeout(() => {
      sparkle.remove();
    }, 700);
  }

  // Draggable Broom Support
  broomContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startDragY = e.clientY;
    startScrollY = window.scrollY;
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const trackHeight = track.clientHeight - broomContainer.clientHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const deltaY = e.clientY - startDragY;
    const scrollDelta = (deltaY / trackHeight) * maxScroll;
    window.scrollTo(0, startScrollY + scrollDelta);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });

  // Touch Support
  broomContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    startDragY = e.touches[0].clientY;
    startScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const trackHeight = track.clientHeight - broomContainer.clientHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const deltaY = e.touches[0].clientY - startDragY;
    const scrollDelta = (deltaY / trackHeight) * maxScroll;
    window.scrollTo(0, startScrollY + scrollDelta);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

