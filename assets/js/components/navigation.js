/**
 * Vintage Navigation Component
 * Orchestrates desktop navbar, mobile drawer, scroll-spy, and reading progress bar.
 */

let cleanups = [];

export function initNavigation() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileClose = document.getElementById('mobileNavClose');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const progressBar = document.getElementById('scrollProgressBar');

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openDrawer);
    cleanups.push(() => mobileToggle.removeEventListener('click', openDrawer));
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', closeDrawer);
    cleanups.push(() => mobileClose.removeEventListener('click', closeDrawer));
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
    cleanups.push(() => backdrop.removeEventListener('click', closeDrawer));
  }

  const onKey = (e) => {
    if (e.key === 'Escape') closeDrawer();
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  // Smooth scroll links with header offset
  const allNavLinks = document.querySelectorAll('a[href^="#"]');
  allNavLinks.forEach(link => {
    const handler = (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeDrawer();
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };
    link.addEventListener('click', handler);
    cleanups.push(() => link.removeEventListener('click', handler));
  });

  // Scroll spy & reading progress
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  const onScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && progressBar) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    let currentId = '';
    const scrollPos = window.pageYOffset + 220;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener('scroll', onScroll));

  return destroyNavigation;
}

export function destroyNavigation() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}
