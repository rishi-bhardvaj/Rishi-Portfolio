/**
 * Contact & Owl Dispatch Component
 * Secure AJAX dispatch with response verification, XSS prevention via textContent, and copy triggers.
 */

import { triggerFlyingOwl } from './owl.js';
import { showToast } from '../core/dom.js';
import { playSfx } from '../core/audio.js';

let cleanups = [];

export function initContact() {
  initFormValidation();
  initCopyButtons();
  initCharCounter();

  return destroyContact;
}

export function destroyContact() {
  cleanups.forEach(fn => fn());
  cleanups = [];
}

function initCharCounter() {
  const storyInput = document.getElementById('formStory');
  const counterEl = document.getElementById('charCount');

  if (storyInput && counterEl) {
    const onInput = () => {
      counterEl.textContent = `${storyInput.value.length} / 1000 characters`;
    };
    storyInput.addEventListener('input', onInput);
    cleanups.push(() => storyInput.removeEventListener('input', onInput));
  }
}

function initFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const onSubmit = async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('formName');
    const emailInput = document.getElementById('formEmail');
    const subjectInput = document.getElementById('formSubject');
    const storyInput = document.getElementById('formStory');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const story = storyInput ? storyInput.value.trim() : '';

    if (!name || !email || !subject || !story) {
      showToast('⚠️ Please complete all parchment fields before dispatching the owl.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'DISPATCHING OWL...';
    }

    showToast('🦉 The snowy owl takes wing carrying your missive...');

    try {
      const response = await fetch('https://formspree.io/f/mvkozeqz', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message: story })
      });

      if (!response.ok) {
        throw new Error(`Dispatch returned status: ${response.status}`);
      }

      // Successful dispatch
      triggerFlyingOwl(() => {
        renderSuccessCard(form, name, email);
        showToast('✉️ Missive safely delivered to Rishi’s desk!');
      });
    } catch (err) {
      console.warn('[contact] Formspree dispatch failed, preserving user input:', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND THE OWL →';
      }
      showToast('⚠️ The owl encountered turbulent winds. Please email directly to bhardvajrishi@gmail.com');
    }
  };

  form.addEventListener('submit', onSubmit);
  cleanups.push(() => form.removeEventListener('submit', onSubmit));
}

function renderSuccessCard(form, name, email) {
  form.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'p-6 border-2 border-[var(--border-ink)] bg-[var(--bg-parchment-light)] text-center space-y-3';

  const stamp = document.createElement('div');
  stamp.className = 'stamp-distressed text-xs';
  stamp.textContent = 'DISPATCH CONFIRMED';

  const heading = document.createElement('h4');
  heading.className = 'font-serif text-2xl font-bold text-[var(--text-ink)]';
  heading.textContent = 'Owl Delivered Successfully';

  const message = document.createElement('p');
  message.className = 'font-sans text-sm text-[var(--text-muted)] leading-relaxed';

  // Safe construction using textContent and span nodes — ZERO XSS
  const text1 = document.createTextNode('Thank you, ');
  const strongName = document.createElement('strong');
  strongName.textContent = name;
  const text2 = document.createTextNode('! Your dispatch has reached Rishi’s engineering desk. A reply will be dispatched to ');
  const strongEmail = document.createElement('strong');
  strongEmail.textContent = email;
  const text3 = document.createTextNode(' usually within 24 hours.');

  message.appendChild(text1);
  message.appendChild(strongName);
  message.appendChild(text2);
  message.appendChild(strongEmail);
  message.appendChild(text3);

  const btnWrap = document.createElement('div');
  btnWrap.className = 'pt-2';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn-ink text-xs';
  resetBtn.textContent = 'SEND ANOTHER LETTER →';
  resetBtn.addEventListener('click', () => location.reload());
  btnWrap.appendChild(resetBtn);

  card.appendChild(stamp);
  card.appendChild(heading);
  card.appendChild(message);
  card.appendChild(btnWrap);

  form.appendChild(card);
}

function initCopyButtons() {
  const copyBtns = document.querySelectorAll('[data-copy]');
  copyBtns.forEach(btn => {
    const onCopy = (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      playSfx('click');

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
      }).catch(() => {
        showToast(`📋 ${textToCopy}`);
      });
    };
    btn.addEventListener('click', onCopy);
    cleanups.push(() => btn.removeEventListener('click', onCopy));
  });
}
