/**
 * Moving Portrait Component
 * 3D perspective mouse tracking and vintage photo filter matrix.
 */

import { prefersReducedMotion } from '../core/motion.js';

let cleanups = [];

export function initPortrait() {
  const photoFrame = document.querySelector('.prophet-photo-frame');
  const userImg = document.querySelector('.prophet-user-img');
  const filterBtns = document.querySelectorAll('.photo-filter-btn');

  if (!photoFrame || !userImg) return () => {};

  if (!prefersReducedMotion) {
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
  cleanups.forEach(fn => fn());
  cleanups = [];
}
