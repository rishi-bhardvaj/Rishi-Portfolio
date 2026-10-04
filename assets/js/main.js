/**
 * THE DAILY CHRONICLE — MAIN APPLICATION ORCHESTRATOR
 * Pure Native ES Module Architecture
 */

import { initTheme } from './components/theme.js';
import { initAudio } from './components/audio.js';
import { initNavigation } from './components/navigation.js';
import { initMasthead } from './components/masthead.js';
import { initPortrait } from './components/portrait.js';
import { initArticles } from './components/articles.js';
import { initLabReport } from './components/lab-report.js';
import { initLedger } from './components/ledger.js';
import { initModal } from './components/modal.js';
import { initContact } from './components/contact.js';
import { initBroom } from './components/broom.js';
import { initOwl } from './components/owl.js';
import { assertDom } from './core/dom.js';

let teardowns = [];

export function initAll() {
  // Verify expected mounting points exist
  assertDom([
    'themeToggleBtn', 'soundToggleBtn', 'articlesGrid', 
    'forensicsTableBody', 'contactForm', 'caseModal'
  ]);

  // Initialize components in strict sequence
  const initializers = [
    initTheme,
    initAudio,
    initNavigation,
    initMasthead,
    initPortrait,
    initArticles,
    initLabReport,
    initLedger,
    initModal,
    initContact,
    initBroom,
    initOwl
  ];

  initializers.forEach(fn => {
    try {
      const teardown = fn();
      if (typeof teardown === 'function') {
        teardowns.push(teardown);
      }
    } catch (err) {
      console.error(`[Orchestrator] Error initializing ${fn.name}:`, err);
    }
  });

  console.log('🗞️ Daily Chronicle broadsheet edition initialized successfully.');
}

export function destroyAll() {
  while (teardowns.length > 0) {
    const fn = teardowns.pop();
    try {
      fn();
    } catch (err) {
      console.error('[Orchestrator] Error during teardown:', err);
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', destroyAll);
}
