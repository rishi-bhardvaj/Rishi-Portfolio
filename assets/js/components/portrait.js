/**
 * Moving Portrait Component
 * 3D perspective mouse tracking, vintage photo filter matrix, and ambient moving photograph loop.
 */

import { prefersReducedMotion } from '../core/motion.js';

let cleanups = [];
let photoObserver = null;

export function initPortrait() {
  const photoFrame = document.querySelector('.prophet-photo-frame');
  const userImg = document.querySelector('.prophet-user-img');
  const filterBtns = document.querySelectorAll('.photo-filter-btn');

  if (!photoFrame || !userImg) return () => {};

  // Ambient moving photograph loop (paused when offscreen)
  if (!prefersReducedMotion) {
    userImg.classList.add('photo-alive');

    if ('IntersectionObserver' in window) {
      photoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            userImg.style.animationPlayState = 'running';
          } else {
            userImg.style.animationPlayState = 'paused';
          }
        });
      }, { threshold: 0.1 });

      photoObserver.observe(photoFrame);
    }

    // Floating Dust Motes Overlay
    let dustWrap = photoFrame.querySelector('.photo-dust-overlay');
    if (!dustWrap) {
      dustWrap = document.createElement('div');
      dustWrap.className = 'photo-dust-overlay';
      dustWrap.setAttribute('aria-hidden', 'true');
      dustWrap.innerHTML = `
        <span class="photo-mote mote-a"></span>
        <span class="photo-mote mote-b"></span>
        <span class="photo-mote mote-c"></span>
        <span class="photo-mote mote-d"></span>
      `;
      photoFrame.appendChild(dustWrap);
    }

    // 3D Perspective Tilt on Mouse Movement
    const onMouseMove = (e) => {
      const rect = photoFrame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      userImg.style.transform = `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.03)`;
    };

    const onMouseLeave = () => {
      userImg.style.transform = '';
    };

    photoFrame.addEventListener('mousemove', onMouseMove);
    photoFrame.addEventListener('mouseleave', onMouseLeave);
    cleanups.push(() => photoFrame.removeEventListener('mousemove', onMouseMove));
    cleanups.push(() => photoFrame.removeEventListener('mouseleave', onMouseLeave));
  }

  // Filter Switcher
  filterBtns.forEach(btn => {
    const onClick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterType = btn.getAttribute('data-filter');
      switch (filterType) {
        case 'linotype':
          userImg.style.filter = 'contrast(1.25) grayscale(1) brightness(0.95)';
          break;
        case 'daguerreotype':
          userImg.style.filter = 'contrast(1.15) sepia(0.45) brightness(0.92)';
          break;
        case 'amber':
          userImg.style.filter = 'contrast(1.1) sepia(0.2) hue-rotate(15deg) brightness(1.02)';
          break;
        default:
          userImg.style.filter = 'contrast(1.08) brightness(0.96) sepia(0.18)';
      }
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  return destroyPortrait;
}

export function destroyPortrait() {
  if (photoObserver) {
    photoObserver.disconnect();
    photoObserver = null;
  }
  cleanups.forEach(fn => fn());
  cleanups = [];
}
