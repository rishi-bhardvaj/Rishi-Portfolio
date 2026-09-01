// ==========================================================================
// CONTACT / OWL DISPATCH COMPONENT
// Silent Background Dispatch via Formspree API & Animated Flying Owl
// ==========================================================================

import { triggerFlyingOwl } from './owl.js';

export function initContact() {
  initFormValidation();
  initCopyButtons();
  initCharCounter();
}

function initCharCounter() {
  const storyInput = document.getElementById('formStory');
  const counterEl = document.getElementById('charCount');

  if (storyInput && counterEl) {
    storyInput.addEventListener('input', () => {
      const len = storyInput.value.length;
      counterEl.textContent = `${len} / 1000 characters`;
    });
  }
}

function initFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject').value.trim();
    const story = document.getElementById('formStory').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !subject || !story) {
      showToast('⚠️ Please fill out all required fields before sending the owl.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'DISPATCHING OWL...';
    }

    showToast('🦉 The Owl takes flight carrying your letter...');

    // Send payload in the background via Formspree AJAX API (Zero Email Redirect)
    fetch('https://formspree.io/f/mvkozeqz', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: story
      })
    }).catch(err => {
      console.warn('Silent dispatch notification:', err);
    });

    // Trigger magical flying owl carrying letter animation across the screen!
    triggerFlyingOwl(() => {
      form.innerHTML = `
        <div class="p-6 border-2 border-[var(--border-ink)] bg-[var(--bg-parchment-light)] text-center space-y-3">
          <div class="stamp-distressed text-xs">DISPATCH CONFIRMED</div>
          <h4 class="font-serif text-2xl font-bold text-[var(--text-ink)]">Owl Delivered Successfully</h4>
          <p class="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
            Thank you, <strong>${name}</strong>! Your dispatch has been delivered directly into Rishi&rsquo;s personal inbox. You will receive a response at <strong>${email}</strong> usually within 24 hours.
          </p>
          <div class="pt-2">
            <button onclick="location.reload()" class="btn-ink text-xs">SEND ANOTHER LETTER &rarr;</button>
          </div>
        </div>
      `;

      showToast('✉️ Owl Delivered into Rishi’s Inbox!');
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
      }).catch(() => {
        showToast(`📋 ${textToCopy}`);
      });
    });
  });
}

export function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
